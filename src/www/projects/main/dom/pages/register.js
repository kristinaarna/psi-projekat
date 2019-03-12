'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Page = require('./page');
const Form = require('../form');

class Register extends Page{
  constructor(parent){
    super(parent);

    const form = new Form(this);

    const fields = [
      ['InputText', 'username'],
      ['InputText', 'email'],
      ['InputPass', 'pass'],
      ['InputPass', 'pass2'],
      ['InputText', 'captcha'],
    ];

    this.fields = fields.map(([ctorName, labelName]) => {
      const ctor = Element[ctorName];
      const label = LS.labels.forms.fields[labelName];

      form.createField(ctor, label);
    });

    form.addConfirm();

    form.on('confirm', () => {
      O.glob.dom.noimpl();
    });

    this.form = form;
  }

  static title(){ return LS.titles.register; }

  css(){ return 'register'; }
};

module.exports = Register;