'use strict';

const LS = require('../../strings');
const Element = require('../element');
const AvatarImage = require('./avatar-image');

class Avatar extends Element.Div{
  constructor(parent, nick){
    super(parent);
    new AvatarImage(this, nick);
  }

  css(){ return 'user-profile-avatar'; }
};

Avatar.AvatarImage = AvatarImage;

module.exports = Avatar;

function getUrl(nick){
  return `/avatar?nick=${nick}`;
}