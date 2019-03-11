'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Page = require('./page');
const Form = require('../form');

class Login extends Page{
  constructor(parent){
    super(parent);

    const form = new Form(this);
    const field = form.createField(Element.InputDropdown);

    for(const lang of O.sortAsc(O.keys(LS.langs)))
      field.addOpt(lang, LS.langs[lang], lang === LS.lang);

    form.addConfirm();

    form.on('confirm', () => {
      location.reload();
    });

    this.form = form;
  }

  static title(){ return LS.titles.language; }

  css(){ return 'page-language'; }
};

module.exports = Login;