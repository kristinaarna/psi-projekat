'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Page = require('./page');
const Form = require('../form');

class Register extends Page{
  constructor(parent, captchaToken){
    super(parent);

    const form = new Form(this);

    const fields = [
      ['InputText', 'nick', 'username'],
      ['InputText', 'email', 'email'],
      ['InputPass', 'pass', 'pass'],
      ['InputPass', 'pass2', 'pass2'],
      ['InputText', 'captcha', 'captcha'],
    ];

    this.fields = fields.map(([ctorName, fieldName, labelName]) => {
      const ctor = Element[ctorName];
      const label = LS.labels.forms.fields[labelName];

      form.createField(ctor, fieldName, label);
    });

    form.addCaptcha(captchaToken);
    form.addConfirm();

    form.on('confirm', fields => {
      O.glob.dom.alert(O.sf(fields));
    });

    this.form = form;
  }

  static title(){ return LS.titles.register; }

  css(){ return 'register'; }
};

module.exports = Register;