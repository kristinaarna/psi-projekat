'use strict';

const LS = require('../../strings');
const Element = require('../element');
const NavbarItem = require('./item');

class Navbar extends Element.Div{
  constructor(parent){
    super(parent);

    const items = {
      left: [
        'home',
        'sandbox',
        'competition',
        'search',
        'contact',
      ],
      right: [
        'register',
        'login',
      ],
    };

    for(const type of O.keys(items)){
      const arr = items[type];
      const ctor = type === 'left' ? NavbarItem.NavbarItemLeft : NavbarItem.NavbarItemRight;

      for(let i = 0; i !== arr.length; i++){
        const name = arr[i];
        const label = LS.labels.navbar[type][name];
        const elem = new ctor(this, label);

        elem.on('click', evt => {
          this.onItemClick(name, evt);
        });

        arr[i] = elem;
      }
    }

    this.items = items;
  }

  // Triggers when user clicks on any navbar item
  onItemClick(name, evt){
    log(name);
  }

  css(){ return 'navbar'; }
};

module.exports = Navbar;