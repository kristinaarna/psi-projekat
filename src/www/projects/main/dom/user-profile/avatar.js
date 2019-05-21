'use strict';

const LS = require('../../strings');
const Element = require('../element');
const AvatarImage = require('./avatar-image');
const AvatarFileButton = require('./avatar-file-button');

class Avatar extends Element.Div{
  constructor(parent, nick, editable){
    super(parent);

    this.editable = editable;
    this.img = new AvatarImage(this, nick);

    if(editable){
      const btn = new AvatarFileButton(this);
    }
  }

  css(){ return 'user-profile-avatar'; }
}

Avatar.AvatarImage = AvatarImage;
Avatar.AvatarFileButton = AvatarFileButton;

module.exports = Avatar;

function getUrl(nick){
  return `/avatar?nick=${nick}`;
}