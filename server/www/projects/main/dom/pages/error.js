'use strict';

const LS = require('../../strings');
const Element = require('../element');

const es = LS.errors;

class Error extends Element.Div{
  constructor(parent, status, msg=null){
    super(parent);

    status |= 0;

    if(!(status in es.server.status))
      return O.error('Unsupported status code');

    if(msg === null) msg = es.server.status[status];
    else msg = es.server.info[msg];

    this.title = new Element.Title(this, `${es.error} ${status}`);
    this.desc = new Element.Span(this, msg);
  }
};

module.exports = Error;