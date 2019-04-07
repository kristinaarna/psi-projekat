'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Page = require('./page');
const Form = require('../form');

class Login extends Page{
  constructor(parent){
    super(parent);

    const form = new Form(this);

    const fields = [
      ['InputText', 'nick', 'username'],
      ['InputPass', 'pass', 'pass'],
    ];

    this.fields = fields.map(([ctorName, fieldName, labelName]) => {
      const ctor = Element[ctorName];
      const label = LS.labels.forms.fields[labelName];

      form.createField(ctor, fieldName, label);
    });

    form.addConfirm();

    form.on('confirm', () => {
      O.glob.dom.noimpl();
    });

    this.form = form;
  }

  static title(){ return LS.titles.login; }

  css(){ return 'login'; }
};

module.exports = Login;