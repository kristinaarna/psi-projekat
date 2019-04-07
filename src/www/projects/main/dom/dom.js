'use strict';

const LS = require('../strings');
const backend = require('../backend');
const Element = require('./element');
const Navbar = require('./navbar');
const PageContent = require('./page-content');
const pages = require('./pages');
const modals = require('./modals');

/*
  Document Object Model.
  This class is used for all operations with HTML elements.
  Classes that represent elements should be extended from
  class DOM.Element.
*/

class DOM extends Element{
  constructor(main, modal, init=1){
    super();

    // This class is singleton
    O.glob.dom = this;

    // Main element
    this.main = main;
    this.modal = modal;

    // Elements
    this.navbar = null;
    this.pageContent = null;
    this.page = null;
    this.modalInner = null;

    this.loading = 0;
    this.modalOpen = 0;
    this.modalCb = null;

    if(init) this.init();
  }

  init(){
    this.modalInner = new modals.ModalInner(this.modal);

    this.createNavbar();
    this.createPageContent();

    this.aels();
    this.reload();
  }

  aels(){
    O.ael('keydown', this.onModalKeydown.bind(this));

    O.ael('popstate', evt => {
      evt.preventDefault();
      evt.stopPropagation();
      this.reload();
    });
  }

  reload(){
    this.loadPage().then(() => {
      this.loading = 0;
      O.raf(() => this.emit('load'));
    }).catch(err => {
      this.loading = 0;
      O.raf(() => this.emit('error', err));
    });
  }

  openModal(cb=O.nop){
    if(this.modalOpen) return;

    const {main, modal, modalInner: inner} = this;

    main.style.pointerEvents = 'none';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
    inner.style.top = '50%';

    modal.focus();

    this.modalOpen = 1;
    this.modalCb = cb;
  }

  closeModal(){
    if(!this.modalOpen) return;

    const {main, modal, modalInner: inner} = this;

    inner.style.top = '0%';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    main.style.pointerEvents = 'all';

    this.modalCb.call(null);
    this.modalCb = null;
    this.modalOpen = 0;
  }

  onModalKeydown(evt){
    if(!this.modalOpen) return;

    switch(evt.code){
      case 'Escape':
        this.closeModal();
        break;
    }
  }

  alert(msg, cb){
    const modal = new modals.Alert(this.modalInner, msg);
    this.openModal(cb);
  }

  noimpl(cb){
    this.alert(LS.errors.noimpl, cb);
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
    await O.while(() => this.loading);
    this.loading = 1;

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
        case 'sandbox':
          await this.createSandboxPage();
          break;

        case 'competition':
          await this.createCompetitionPage();
          break;

        case 'search':
          await this.createSearchPage();
          break;

        case 'help':
          await this.createHelpPage();
          break;

        case 'language':
          await this.createLanguagePage();
          break;

        case 'register':
          await this.createRegisterPage();
          break;

        case 'login':
          await this.createLoginPage();
          break;

        case 'error':
          const status = O.urlParam('status');
          const info = O.urlParam('info');
          await this.createError(status, info);
          break;

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

  async createSandboxPage(){
    const page = new pages.Sandbox(this.pageContent);
    this.page = page;
  }

  async createCompetitionPage(){
    const page = new pages.CompetitionPage(this.pageContent);
    this.page = page;

    const comps = await backend.getCompetitions(0);

    for(const comp of comps){
      const title = comp.title;
      const date = new Date(+comp.date);
      const desc = comp.desc;
      const applied = comp.applied;

      page.createCompetition(title, date, desc, applied);
    }

    page.on('stateChange', (comp, applied) => {
      this.alert(`${
        applied ?
        LS.labels.competition.msgs.applied :
        LS.labels.competition.msgs.gaveUp
      } ${O.sf(comp.getTitle())}`);
    });
  }

  async createSearchPage(){
    const page = new pages.Search(this.pageContent);
    this.page = page;
  }

  async createHelpPage(){
    const page = new pages.Help(this.pageContent);
    this.page = page;
  }

  async createLanguagePage(){
    const page = new pages.Language(this.pageContent);
    this.page = page;
  }

  async createRegisterPage(){
    const page = new pages.Register(this.pageContent);
    this.page = page;
  }

  async createLoginPage(){
    const page = new pages.Login(this.pageContent);
    this.page = page;
  }

  async createError(status, msg=null){
    const page = new pages.Error(this.pageContent, status, msg);
    this.page = page;
  }
};

DOM.Element = Element;

module.exports = DOM;