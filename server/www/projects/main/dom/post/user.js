'use strict';

const LS = require('../../strings');
const Element = require('../element');

class PostUser extends Element.Span{
  constructor(parent, str){
    super(parent, str);
  }

  css(){ return 'post-user'; }
};

module.exports = PostUser;