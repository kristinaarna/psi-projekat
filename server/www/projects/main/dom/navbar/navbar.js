'use strict';

const Element = require('../element');
const LS = require('../../strings');

class Navbar extends Element.Div{
  constructor(parent){
    super(parent);

    this.items = {
      left: [
        ''
      ],
      right: [
      ],
    };
  }

  css(){ return 'navbar'; }
};

module.exports = Navbar;