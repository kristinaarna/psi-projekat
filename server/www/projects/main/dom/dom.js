'use strict';

const Element = require('./element');
const Navbar = require('./navbar');

/*
  Document Object Model
  This class is used for all operations with HTML elements.
  Classes that represent elements should be extended from
  class DOM.Element.
*/

class DOM extends Element{
  constructor(main, init=1){
    super();

    // Main element
    this.main = main;

    // Elements
    this.navbar = null;

    if(init) this.init();
  }

  init(){
    this.createNavbar();
  }

  createNavbar(){
    this.navbar = new Navbar(this.main);
  }
};

DOM.Element = Element;

module.exports = DOM;