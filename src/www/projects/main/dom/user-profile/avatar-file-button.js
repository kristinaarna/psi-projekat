'use strict';

const LS = require('../../strings');
const Element = require('../element');

class AvatarFileButton extends Element.InputFile{
  constructor(parent){
    super(parent);
  }

  css(){ return 'avatar-file-btn'; }
}

module.exports = AvatarFileButton;