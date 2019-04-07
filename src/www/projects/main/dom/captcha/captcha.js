'use strict';

const LS = require('../../strings');
const Element = require('../element');

class Captcha extends Element.Image{
  constructor(parent, token){
    const url = `/captcha?token=${token}`;
    super(parent, url);
  }

  css(){ return 'captcha'; }
};

module.exports = Captcha;