'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Selectable = require('./selectable');

class Tab extends Selectable{
  constructor(parent, name, label){
    super(parent);

    this.name = name;
    this.val = label;

    this.ael('click', evt => {
      this.parent.emit('select', this, evt);
    });
  }

  css(){ return 'tab'; }
}

module.exports = Tab;