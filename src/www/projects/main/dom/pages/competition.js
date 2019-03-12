'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Page = require('./page');
const Competition = require('../competition');

class CompetitionPage extends Page{
  constructor(parent, competitions=[]){
    super(parent);

    this.competitions = [];
    this.addcompetitions(competitions);
  }

  static title(){ return LS.titles.competition; }

  createCompetition(...args){
    const competition = new Competition(this, ...args);
    this.addCompetition(competition);
  }

  addCompetition(comp){
    this.competitions.push(comp);

    comp.on('stateChange', applied => this.emit('stateChange', comp, applied));
    comp.on('apply', () => this.emit('apply', comp));
    comp.on('giveUp', () => this.emit('giveUp', comp));
  }

  addcompetitions(competitions){
    for(const competition of competitions)
      this.addCompetition(competition);
  }

  css(){ return 'competition-page'; }
};

CompetitionPage.Competition = Competition;

module.exports = CompetitionPage;