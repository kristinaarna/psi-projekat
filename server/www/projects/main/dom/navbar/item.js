'use strict';

const LS = require('../../strings');
const Element = require('../element');

class NavbarItem extends Element.Button{
  constructor(parent, text){
    super(parent, text);
  }

  css(){ return 'navbar-item'; }
};

class NavbarItemLeft extends NavbarItem{
  constructor(parent, text){
    super(parent, text);
  }

  css(){ return 'left'; }
};

class NavbarItemRight extends NavbarItem{
  constructor(parent, text){
    super(parent, text);
  }

  css(){ return 'right'; }
};

NavbarItem.NavbarItemLeft = NavbarItemLeft;
NavbarItem.NavbarItemRight = NavbarItemRight;

module.exports = NavbarItem;