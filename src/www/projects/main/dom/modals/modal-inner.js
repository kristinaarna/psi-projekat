'use strict';

const LS = require('../../strings');
const Element = require('../element');

class Modal extends Element.Div{
  css(){ return 'modal-inner'; }
}

module.exports = Modal;