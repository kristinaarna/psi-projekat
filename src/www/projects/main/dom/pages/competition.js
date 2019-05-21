'use strict';

const LS = require('../../strings');
const backend = require('../../backend');
const Element = require('../element');
const Form = require('../form');
const Competition = require('../competition');
const Page = require('./page');

class CompetitionPage extends Page{
  constructor(parent, competitions=[]){
    super(parent);

    if(O.lst.signedIn && O.lst.isMod){
      const form = this.form = new Form(this);
      const strs = LS.labels.forms;

      form.createField(Element.InputText, 'title', strs.fields.compTitle);
      form.createField(Element.InputText, 'desc', strs.fields.compDesc);
      form.addConfirm(strs.buttons.addComp);

      form.on('confirm', fields => {
        backend.addCompetition(O.lst.token, fields.title, fields.desc).then(() => {
          O.glob.dom.nav('competition');
        }, err => {
          O.glob.dom.err(err);
        });
      });
    }

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

    const {dom} = O.glob;

    const alert = applied => {
      dom.alert(`${
        applied ?
        LS.labels.competition.msgs.applied :
        LS.labels.competition.msgs.gaveUp
      } ${O.sf(comp.getTitle())}`);
    }

    comp.on('stateChange', (applied, cb) => {
      const methodName = applied ? 'applyForCompetition' : 'giveUpFromCompetition';

      backend[methodName](O.lst.token, comp.id).then(() => {
        alert(1);
        cb(1);
      }, err => {
        dom.err(err);
        cb(0);
      });
    });
  }

  addcompetitions(competitions){
    for(const competition of competitions)
      this.addCompetition(competition);
  }

  css(){ return 'competition-page'; }
}

CompetitionPage.Competition = Competition;

module.exports = CompetitionPage;