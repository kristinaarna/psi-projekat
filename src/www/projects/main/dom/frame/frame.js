'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Tab = require('./tab');
const TabStrip = require('./tab-strip');
const TabContent = require('./tab-content');

class Frame extends Element.Div{
  constructor(parent, tabs=[]){
    super(parent);

    this.tabs = [];
    this.contents = [];

    this.tabStrip = new TabStrip(this);

    for(const [name, label] of tabs)
      this.createTab(name, label);

    this.tabStrip.on('select', (tab, evt) => {
      const {tabs, contents} = this;

      for(const tab of tabs) tab.unselect();
      for(const content of contents) content.unselect();

      this.selectTab(tab.name);

      this.emit('select', tab, evt);
    });
  }

  createTab(name, label){
    this.tabs.push(new Tab(this.tabStrip, name, label));
    this.contents.push(new TabContent(this));
    if(this.tabs.length === 1) this.selectTab(name);
  }

  getTab(name){
    return this.tabs.find(tab => tab.name === name);
  }

  getTabIndex(name){
    return this.tabs.findIndex(tab => tab.name === name);
  }

  selectTab(name){
    this.selectTabByIndex(this.getTabIndex(name));
  }

  unselectTab(name){
    this.unselectTabByIndex(this.getTabIndex(name));
  }

  selectTabByIndex(index){
    this.tabs[index].select();
    this.contents[index].select();
  }

  unselectTabByIndex(index){
    this.tabs[index].unselect();
    this.contents[index].unselect();
  }

  css(){ return 'frame'; }
}

module.exports = Object.assign(Frame, {
  Tab,
  TabStrip,
  TabContent,
});