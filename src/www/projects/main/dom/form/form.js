'use strict';

const LS = require('../../strings');
const Element = require('../element');
const ButtonConfirm = require('./btn-confirm');

class Form extends Element.Region{
  constructor(parent){
    super(parent);

    this.fields = [];

    this.btnConfirm = null;
  }

  createField(ctor, ...args){
    this.br();
    const field = new ctor(this, ...args);
    return this.addField(field, 0);
  }

  addField(field){
    this.fields.push(field);
    return field;
  }

  addConfirm(label){
    this.br();

    const btn = new ButtonConfirm(this, label);;
    btn.on('click', () => this.emit('confirm'));

    this.btnConfirm = btn;
  }

  br(){
    if(this.fields.length === 0) return;
    super.br();
  }

  css(){ return 'form'; }
};

Form.ButtonConfirm = ButtonConfirm;

module.exports = Form;