'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Form = require('../form');
const CompetitionTitle = require('./title');
const CompetitionDate = require('./date');
const CompetitionDescription = require('./desc');

class Competition extends Element.Region{
  constructor(parent, title, date, desc, applied=0){
    super(parent);

    this.title = new CompetitionTitle(this, title);
    this.date = new CompetitionDate(this, date);
    this.desc = new CompetitionDescription(this, desc);

    this.applied = applied;

    this.right = new Element.Right(this);
    this.btn = new Form.ButtonConfirm(this.right);
    this.updateBtn();

    this.btn.on('click', this.onClick.bind(this));
  }

  onClick(){
    this.applied ^= 1;
    this.updateBtn();

    this.emit('stateChange', this.applied);
    if(this.applied) this.emit('apply');
    else this.emit('giveUp');
  }

  updateBtn(){
    this.btn.val = this.applied ?
      LS.labels.competition.giveUp :
      LS.labels.competition.apply;
  }

  getTitle(){ return this.title.val; }
  css(){ return 'post'; }
};

Competition.CompetitionTitle = CompetitionTitle;
Competition.CompetitionDate = CompetitionDate;
Competition.CompetitionDescription = CompetitionDescription;

module.exports = Competition;