'use strict';

const ProgLangEngine = require('/node/programming-language/engine');
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

class Sandbox extends Page{
  constructor(parent){
    super(parent);

    this.choice = new elemCtors.LanguageChoice(this);

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
      editor.val = labs[name];
    }

    const canvCont = new elemCtors.CanvasContainer(frame.contents[3].elem);
    const reng = new RenderEngine(canvCont.elem, WIDTH, HEIGHT);
    reng.init();
  }

  static title(){ return LS.titles.sandbox; }

  css(){ return 'sandbox'; }
}

module.exports = Sandbox;