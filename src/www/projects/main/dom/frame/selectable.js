'use strict';

const LS = require('../../strings');
const Element = require('../element');

class Selectable extends Element.Div{
  select(){
    this.elem.classList.add('selected');
  }

  unselect(){
    this.elem.classList.remove('selected');
  }

  css(){ return 'selectable'; }
}

module.exports = Selectable;