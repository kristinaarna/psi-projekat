'use strict';

const LS = require('../strings');
const backend = require('../backend');
const Element = require('./element');
const Navbar = require('./navbar');
const PageContent = require('./page-content');
const pages = require('./pages');

/*
  Document Object Model
  This class is used for all operations with HTML elements.
  Classes that represent elements should be extended from
  class DOM.Element.
*/

class DOM extends Element{
  constructor(main, modal, init=1){
    super();

    // Main element
    this.main = main;
    this.modal = modal;

    // Elements
    this.navbar = null;
    this.pageContent = null;
    this.page = null;

    if(init) this.init();
  }

  init(){
    this.createNavbar();
    this.createPageContent();

    this.aels();
    this.reload();
  }

  aels(){
    O.ael('popstate', evt => {
      evt.preventDefault();
      evt.stopPropagation();
      this.reload();
    });
  }

  reload(){
    this.loadPage().then(() => {
      O.raf(() => this.emit('load'));
    }).catch(err => {
      O.raf(() => this.emit('error', err));
    });
  }

  createNavbar(){
    const navbar = new Navbar(this.main);
    this.navbar = navbar;

    navbar.on('click', (name, elem, evt) => {
      this.navigate(elem.path);
    });
  }

  createPageContent(){
    this.pageContent = new PageContent(this.main);
  }

  navigate(path){
    const url = path !== '' ? `/?path=${path}` : '/';
    history.pushState(null, path, url);
    this.reload();
  }

  async loadPage(){
    const e404 = async () => {
      await this.createError(404);
    };

    const pathStr = O.urlParam('path', '');
    const path = pathStr !== '' ? pathStr.split('/') : [];
    const len = path.length;

    this.pageContent.clear();

    if(len === 0){
      await this.createHomePage();
      return;
    }

    if(len === 1){
      switch(path[0]){
        case 'error': this.createError(O.urlParam('status'), O.urlParam('info')); break;
        default: await e404(); break;
      }
      return;
    }

    await e404();
  }

  async createHomePage(){
    const page = new pages.Home(this.pageContent);
    this.page = page;

    const posts = await backend.getHomePagePosts();

    for(const post of posts){
      const user = post.user;
      const date = new Date(+post.date);
      const content = post.content;

      page.createPost(user, date, content);
    }
  }

  async createError(status, msg=null){
    this.page = new pages.Error(this.pageContent, status, msg);
  }
};

DOM.Element = Element;

module.exports = DOM;