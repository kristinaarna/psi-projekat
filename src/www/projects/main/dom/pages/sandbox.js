'use strict';

const LS = require('../../strings');
const Element = require('../element');
const TextEditor = require('../text-editor');
const Form = require('../form');
const Page = require('./page');

class Sandbox extends Page{
  constructor(parent){
    super(parent);

    this.editor = new TextEditor(this);
    this.editor.setVal(LS.texts.scriptTemplate);
    this.start = new Form.ButtonConfirm(this, LS.labels.sandbox.buttons.start);

    this.aels();
  }

  aels(){
    this.start.on('click', () => {
      const src = this.editor.getVal();
      let func = null;

      try{ func = new Function(src); }
      catch{}

      if(func === null)
        return O.glob.dom.alert(LS.errors.syntaxError);

      O.glob.dom.alert(LS.errors.noimpl);
    });
  }

  static title(){ return LS.titles.sandbox; }

  css(){ return 'sandbox'; }
};

module.exports = Sandbox;