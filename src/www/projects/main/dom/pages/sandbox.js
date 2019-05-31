'use strict';

const PL = require('/node/prog-langs/programming-language');
const ProgLangEngine = require('/node/prog-langs/engine');
const RenderEngine = require('/node/simulator/render-engine');
const LS = require('../../strings');
const Element = require('../element');
const TextEditor = require('../text-editor');
const Form = require('../form');
const Frame = require('../frame');
const elemCtors = require('../sandbox');
const Page = require('./page');

const DEFAULT_TAB = 'simulator';

const WIDTH = 926;
const HEIGHT = 671;

const MAX_SIZE = 1e7;
const CRITICAL_SIZE = MAX_SIZE - 1e3;
const INSTRUCTIONS_PER_TICK = 1e4;

class Sandbox extends Page{
  #coords = new Int8Array(3);

  constructor(parent){
    super(parent);

    this.running = 0;
    this.awaitingPause = 0;
    this.disposed = 0;

    const labs = LS.labels.sandbox;
    const frame = this.frame = new Frame(this, [
      ['script', labs.script],
      ['input', labs.input],
      ['output', labs.output],
      ['simulator', labs.simulator],
      ['config', labs.config],
    ]);

    const editors = this.editors = O.obj();

    for(let i = 0; i !== 3; i++){
      const tab = frame.tabs[i];
      const {name} = tab;

      const content = frame.contents[i];
      const editor = editors[name] = new TextEditor(content);

      if(name === 'output')
        editor.disable();
    }

    const canvCont = new elemCtors.CanvasContainer(frame.contents[3].elem);
    const reng = this.reng = new RenderEngine(canvCont.elem, WIDTH, HEIGHT);
    reng.init()//.catch(log);

    const config = this.config = new elemCtors.Configuration(frame.contents[4]);
    let doNotEval = 0;

    frame.on('select', tab => {
      if(this.disposed) return;

      const {script, input, output} = this.editors;
      const {name} = tab;

      const out = name === 'output';
      const sim = name === 'simulator';

      if(out && doNotEval){
        doNotEval = 0;
        return;
      }

      if(out || sim){
        (async () => {
          await O.await(() => this.disposed || !this.running);
          if(this.disposed) return;
          this.running = 1;

          output.val = 'Computing...';
          output.elem.classList.remove('output-error');
          output.elem.classList.add('output-computing');

          reng.play();

          const lang = await this.config.getLang();
          if(this.disposed) return;

          const eng = this.eng = new ProgLangEngine(lang, script.val, MAX_SIZE, CRITICAL_SIZE);
          let error = null;
          let io;

          if(out){
            io = new O.IO(input.val);

            eng.stdin.on('read', (buf, len) => {
              buf[0] = io.read();
              return io.hasMore;
            });

            eng.stdout.on('write', (buf, len) => {
              io.write(buf[0]);
            });

            eng.stderr.on('write', (buf, len) => {
              error = buf.toString();
              eng.pause();
            });

            await O.await(async () => {
              if(this.disposed || this.awaitingPause || error !== null) return 1;
              eng.run(INSTRUCTIONS_PER_TICK);
              return eng.done;
            });
          }else{
            const inp = [];
            const out = [];

            eng.stdin.on('read', (buf, len) => {
              if(len & 7)
                throw O.glob.dom.alert('Input bit stream is currently not supported in simulator');

              len >>= 3;

              for(let i = 0; i !== len; i++){
                if(out.length !== 0) buf[i] = out.shift();
                else buf[i] = 0;
              }

              return 1;
            });

            eng.stdout.on('write', (buf, len) => {
              if(len & 7)
                throw O.glob.dom.alert('Output bit stream is currently not supported in simulator');

              len >>= 3;

              for(let i = 0; i !== len; i++)
                inp.push(buf[i]);

              eng.pause();
            });

            eng.stderr.on('write', (buf, len) => {
              error = buf.toString();
              eng.pause();
            });

            const onTick = bot => {
              let ticks = INSTRUCTIONS_PER_TICK;

              while(ticks > 0){
                const prev = ticks;
                ticks = this.execute(bot, inp, out, ticks);
                if(ticks === prev) break;
              }

              while(ticks > 0 && !eng.done){
                ticks = eng.run(ticks);

                while(ticks > 0){
                  const prev = ticks;
                  ticks = this.execute(bot, inp, out, ticks);
                  if(ticks === prev) break;
                }
              }
            };

            reng.on('tick', onTick);

            await O.await(async () => {
              if(this.disposed || this.awaitingPause || error !== null) return 1;
              return eng.done;
            }, 1e3);

            reng.rel('tick', onTick);
          }

          if(this.disposed) return;
          this.running = 0;
          this.awaitingPause = 0;
          output.elem.classList.remove('output-computing');

          if(error !== null){
            output.val = error;
            output.elem.classList.add('output-error');

            if(sim){
              doNotEval = 1;
              frame.selectTab('output');
            }

            return;
          }

          if(out)
            output.val = io.getOutput().toString();
        })()//.catch(log);

        return;
      }
    });

    frame.on('unselect', tab => {
      const {name} = tab;

      const out = name === 'output';
      const sim = name === 'simulator';

      if(out || sim){
        this.awaitingPause = this.running;
        if(sim) reng.pause();
      }
    });

    const onKeyDown = evt => {
      if(this.disposed || !evt.ctrlKey) return;

      const matchDigit = evt.code.match(/^(?:Digit|Numpad)([12345])$/);
      if(matchDigit !== null){
        O.pd(evt);

        const digit = ~-matchDigit[1];
        frame.selectTabByIndex(digit);
      }
    };

    O.ael('keydown', onKeyDown);

    this.on('remove', () => {
      this.disposed = 1;

      O.rel('keydown', onKeyDown);
      reng.dispose();
    });

    editors.script.val = `
      0, 1,
      ==, =, var, [],
      in, out, eof, #,

      var(x, # 0),
      var(y, # 0),
      var(z, # -2),

      var(null, #().null),

      var(ok, [](a)(
        ==(a, null)(0, 1)
      )),

      var(if, [](a, b, c)(
        ok(a)(b, c)()
      )),

      var(f, []()(
        var(a, #().get(x, y, z)),

        if(a, []()(
          var(b, a .get(# "tree")),

          if(b, []()(
            #().rotate(# 3)
          ), []()(
            #().rotate(# 1)
          ))
        )),

        f()
      ))()
    `;

    editors.input.val = `abcde`;

    frame.selectTab(DEFAULT_TAB);
  }

  static title(){ return LS.titles.sandbox; }

  execute(bot, inp, out, ticks){
    if(inp.length === 0) return ticks;

    const op = inp[0];

    switch(op){
      case 0x00: { // Dispatch
        out.length = 0;
        out.push(0);
        inp.splice(0, 1);
        ticks = 0;
        break;
      }

      case 0x01: { // Rotate
        if(inp.length < 2) break;
        out.length = 0;

        const dir = inp[1];
        if(dir === (dir & 3)){
          bot.dir = bot.dir + dir & 3;
          out.push(0);
        }else{
          out.push(1);
        }

        ticks = 0;
        inp.splice(0, 2);
        break;
      }

      case 0x02: { // Go forward
        out.length = 0;

        if(bot.canGo()){
          bot.go();
          out.push(0);
        }else{
          out.push(1);
        }

        inp.splice(0, 1);
        ticks = 0;
        break;
      }

      case 0x03: { // Jump
        out.length = 0;

        if(bot.canJump()){
          bot.jump();
          out.push(0);
        }else{
          out.push(1);
        }

        inp.splice(0, 1);
        ticks = 0;
        break;
      }

      case 0x04: { // Can the bot see the given tile
        if(inp.length < 4) break;
        out.length = 0;

        const [x, y, z] = this.getCoords(inp);

        out.push(0);
        out.push(bot.canSee(x, y, z));

        inp.splice(0, 4);
        break;
      }

      case 0x05: { // Does the given tile have an object with the given traits
        if(inp.length < 5) break;
        if(inp.length < inp[4] + 5) break;
        out.length = 0;

        const [x, y, z] = this.getCoords(inp);
        const traits = O.Buffer.from(inp.slice(5, inp[4] + 5)).toString().split(' ');
        inp.splice(0, inp[4] + 5);

        if(!bot.canSee(x, y, z)){
          out.push(1);
          break;
        }

        const d = bot.get(x, y, z);
        const has = d.objs.some(obj => {
          return traits.every(trait => {
            return obj.is[trait];
          });
        });

        out.push(0);
        out.push(has);
        break;
      }

      case 0x06: { // Send the given request to the first object with the given traits from the given tile
        debugger;
        break;
      }

      default: {
        out.length = 0;
        out.push(1);
        ticks = 0;
        break;
      }
    }

    return ticks;
  }

  getCoords(inp){
    const cs = this.#coords;

    cs[0] = inp[1];
    cs[1] = inp[2];
    cs[2] = inp[3];

    return cs;
  }

  css(){ return 'sandbox'; }
}

module.exports = Sandbox;