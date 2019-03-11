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
      ['InputText', 'username'],
      ['InputPass', 'pass'],
    ];

    this.fields = fields.map(([ctorName, labelName]) => {
      const ctor = Element[ctorName];
      const label = LS.labels.forms.fields[labelName];

      form.createField(ctor, label);
    });

    form.addConfirm();

    form.on('confirm', () => {
      location.reload();
    });

    this.form = form;
  }

  static title(){ return LS.titles.login; }

  css(){ return 'login'; }
};

module.exports = Login;