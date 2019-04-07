'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Captcha = require('../captcha');
const ButtonConfirm = require('./btn-confirm');

class Form extends Element.Region{
  constructor(parent){
    super(parent);

    this.fields = [];

    this.captcha = null;
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

  addCaptcha(token){
    this.br();
    return this.captcha = new Captcha(this, token);
  }

  addConfirm(label){
    this.br();

    const btn = new ButtonConfirm(this, label);;
    btn.on('click', this.onConfirm.bind(this));

    return this.btnConfirm = btn;
  }

  onConfirm(){
    const {fields} = this;
    const obj = O.obj();

    for(const field of fields)
      obj[field.name] = field.val;

    this.emit('confirm', obj);
  }

  br(){
    if(this.fields.length === 0) return;
    super.br();
  }

  css(){ return 'form'; }
};

Form.ButtonConfirm = ButtonConfirm;

module.exports = Form;