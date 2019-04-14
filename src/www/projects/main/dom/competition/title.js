'use strict';

const LS = require('../../strings');
const Element = require('../element');

class CompetitionTitle extends Element.Span{
  constructor(parent, title){
    const str = `${LS.labels.competition.title}: ${title}`;
    super(parent, str);

    this.title = title;
  }

  css(){ return 'competition-title'; }
};

module.exports = CompetitionTitle;