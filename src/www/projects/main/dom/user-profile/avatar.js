'use strict';

const LS = require('../../strings');
const backend = require('../../backend');
const Element = require('../element');
const AvatarImage = require('./avatar-image');

class Avatar extends Element.Div{
  constructor(parent, nick, editable){
    super(parent);

    const {dom} = O.glob;

    this.editable = editable;
    const img = this.img = new AvatarImage(this, nick);

    if(editable){
      const {elem} = this;

      O.ael(elem, 'dragover', evt => {
        O.pd(evt);
        evt.dataTransfer.dropEffect = 'copy';
      });

      O.ael(elem, 'drop', evt => {
        O.pd(evt);

        const files = evt.dataTransfer.files;
        if(files.length === 0) return;

        if(files.length > 1)
          return dom.alert(LS.errors.singleFile);

        const file = files[0];
        const reader = new FileReader();

        O.ael(reader, 'load', evt => {
          dom.handle(backend.editUserData(O.lst.token, 'avatar', reader.result), null, 1);
        });

        reader.readAsDataURL(file);
      });
    }
  }

  css(){ return 'user-profile-avatar'; }
}

module.exports = Object.assign(Avatar, {
  AvatarImage,
});

function getUrl(nick){
  return `/avatar?nick=${nick}`;
}