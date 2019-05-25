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

const WIDTH = 926;
const HEIGHT = 671;

const MAX_SIZE = 1e7;
const CRITICAL_SIZE = MAX_SIZE - 1e3;
const INSTRUCTIONS_PER_TICK = 1e4;

class Sandbox extends Page{
  constructor(parent){
    super(parent);

    this.choice = new elemCtors.LanguageChoice(this);
    this.running = 0;
    this.awaitingPause = 0;
    this.disposed = 0;

    const labs = LS.labels.sandbox;
    const frame = this.frame = new Frame(this, [
      ['script', labs.script],
      ['input', labs.input],
      ['output', labs.output],
      ['simulator', labs.simulator],
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
    const reng = new RenderEngine(canvCont.elem, WIDTH, HEIGHT);
    reng.init()//.catch(log);

    frame.on('select', tab => {
      if(this.disposed) return;

      const {script, input, output} = this.editors;
      const {name} = tab;

      if(name === 'output'){
        output.val = 'Computing...';
        output.elem.classList.remove('output-error');
        output.elem.classList.add('output-computing');

        (async () => {
          await O.await(() => this.disposed || !this.running);
          if(this.disposed) return;
          this.running = 1;

          const lang = await this.choice.getLang();
          if(this.disposed) return;

          const eng = this.eng = new ProgLangEngine(lang, script.val, MAX_SIZE, CRITICAL_SIZE);
          const io = new O.IO(input.val);

          const onRead = (buf, len) => {
            buf[0] = io.read();
            return io.hasMore;
          };

          const onWrite = (buf, len) => {
            io.write(buf[0]);
          };

          eng.stdout.on('write', onWrite);
          eng.stdin.on('read', onRead);

          let error = null;

          eng.stderr.on('write', (buf, len) => {
            error = buf.toString();
            eng.pause();
          });

          await O.await(() => {
            if(this.disposed || this.awaitingPause || error !== null) return 1;
            return eng.run(INSTRUCTIONS_PER_TICK).done;
          });
          if(this.disposed) return;

          if(this.awaitingPause){
            this.awaitingPause = 0;
            this.running = 0;
            return;
          }

          if(error !== null){
            output.val = error;
            output.elem.classList.remove('output-computing');
            output.elem.classList.add('output-error');
            this.running = 0;
            return;
          }

          output.val = io.getOutput().toString();
          output.elem.classList.remove('output-computing');

          this.running = 0;
        })()//.catch(log);
        return;
      }

      if(name === 'simulator')
        reng.play();
    });

    frame.on('unselect', tab => {
      const {name} = tab;

      if(name === 'output') this.awaitingPause = this.running;
      else if(name === 'simulator') reng.pause();
    });

    const onKeyDown = evt => {
      if(this.disposed || !evt.ctrlKey) return;

      const matchDigit = evt.code.match(/^(?:Digit|Numpad)([1234])$/);
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
  }

  static title(){ return LS.titles.sandbox; }

  css(){ return 'sandbox'; }
}

module.exports = Sandbox;