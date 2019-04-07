'use strict';

const LS = require('../../strings');
const backend = require('../../backend');
const Element = require('../element');
const Page = require('./page');
const Form = require('../form');

class Register extends Page{
  constructor(parent){
    super(parent);

    const form = new Form(this);
    this.form = form;

    const fields = [
      ['InputText', 'nick', 'nick'],
      ['InputText', 'email', 'email'],
      ['InputPass', 'pass', 'pass'],
      ['InputPass', 'pass2', 'pass2'],
      ['InputText', 'captchaStr', 'captcha'],
    ];

    O.ael('keydown', e => {
      if(e.code === 'F4'){
        O.pd(e);
        const fs = form.fields;
        fs.nick.val = 'a';
        fs.email.val = 'a@a';
        fs.pass.val = '123456xX';
        fs.pass2.val = '123456xX';
      }
    });

    this.fields = fields.map(([ctorName, fieldName, labelName]) => {
      const ctor = Element[ctorName];
      const label = LS.labels.forms.fields[labelName];

      form.createField(ctor, fieldName, label);
    });

    form.on('confirm', fields => {
      dom.noimpl();
    });

    form.addCaptcha().then(() => {
      form.addConfirm();
    });
  }

  static title(){ return LS.titles.register; }

  css(){ return 'register'; }
};

module.exports = Register;