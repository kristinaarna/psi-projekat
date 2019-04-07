'use strict';

const LS = require('../../strings');
const Element = require('../element');

class Captcha extends Element.Image{
  constructor(parent, token){
    super(parent, getUrl(token));
    this._token = token;
  }

  get token(){
    return this._token;
  }

  set token(token){
    this.src = getUrl(token);
    this._token = token;
  }

  css(){ return 'captcha'; }
};

module.exports = Captcha;

function getUrl(token){
  return `/captcha?token=${token}`;
}