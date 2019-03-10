'use strict';

const LS = require('../../strings');
const Element = require('../element');

class NavbarItem extends Element.Button{
  constructor(parent, text, path){
    super(parent, text);
    this.path = path;
  }

  css(){ return 'navbar-item'; }
};

class NavbarItemLeft extends NavbarItem{
  css(){ return 'left'; }
};

class NavbarItemRight extends NavbarItem{
  css(){ return 'right'; }
};

NavbarItem.NavbarItemLeft = NavbarItemLeft;
NavbarItem.NavbarItemRight = NavbarItemRight;

module.exports = NavbarItem;