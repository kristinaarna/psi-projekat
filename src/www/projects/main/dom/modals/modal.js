'use strict';

const LS = require('../../strings');
const Element = require('../element');

class Modal extends Element.Region{
  constructor(parent){
    super(parent.purge());
  }

  css(){ return 'modal'; }
};

module.exports = Modal;