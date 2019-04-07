'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../../omikron');
const config = require('../../config');

const DEFAULT_LEN = 64;

class Token{
  constructor(str){
    this.str = str;
  }

  static generate(len=DEFAULT_LEN){
    const buf = O.randBuf(len);
    const base64 = buf.toString('base64');

    const str = base64
      .replace(/\=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return new Token(str);
  }

  toJSON(){
    return this.toString();
  }

  toString(){
    return this.str;
  }
};

module.exports = Token;