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
    if(typeof msg !== 'string') msg = O.sf(msg);
    const modal = new modals.Alert(this.modalInner, msg);
    this.openModal(cb);
  }

  noimpl(cb){
    this.alert(LS.errors.noimpl, cb);
  }

  succ(msg, cb){
    this.alert(LS.succ.query[msg], cb);
  }

  err(err, cb){
    const errs = LS.errors.query;

    if(err instanceof Error) err = err.stack;
    else if(typeof err === 'string' && O.has(errs, err)) err = errs[err];

    this.alert(err, cb);
  }

  handle(promise, path=null){
    promise.then(() => {
      if(path === null) this.reload();
      else this.nav(path);
    }, this.err.bind(this));
  }

  createNavbar(){
    const navbar = new Navbar(this.main);
    this.navbar = navbar;

    navbar.on('click', (name, elem, evt) => {
      if(elem.path !== null)
        return this.nav(elem.path);

      switch(name){
        case 'logout':
          const {token} = O.lst;
          O.lst.token = null;

          backend.logout(token).then(() => {
            location.reload();
          }, err => {
            this.err(err, () => location.reload());
          });
          break;
      }
    });
  }

  createPageContent(){
    this.pageContent = new PageContent(this.main);
  }

  nav(path){
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

    switch(path[0]){
      case 'sandbox':
        if(len !== 1) return await e404();
        await this.createSandboxPage();
        break;

      case 'competition':
        if(len !== 1) return await e404();
        await this.createCompetitionPage();
        break;

      case 'search':
        if(len !== 1) return await e404();
        await this.createSearchPage();
        break;

      case 'help':
        if(len !== 1) return await e404();
        await this.createHelpPage();
        break;

      case 'language':
        if(len !== 1) return await e404();
        await this.createLanguagePage();
        break;

      case 'register':
        if(len !== 1) return await e404();
        await this.createRegisterPage();
        break;

      case 'login':
        if(len !== 1) return await e404();
        await this.createLoginPage();
        break;

      case 'users':
        if(len !== 2) return await e404();
        await this.createUserProfilePage(path[1]);
        break;

      case 'error':
        if(len !== 1) return await e404();
        const status = O.urlParam('status');
        const info = O.urlParam('info');
        await this.createError(status, info);
        break;

      default: await e404(); break;
    }
  }

  async createHomePage(){
    const page = new pages.Home(this.pageContent);
    this.page = page;

    const posts = await backend.getPosts('');

    for(const post of posts){
      const {user, date, content} = post;
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

    const comps = await backend.getCompetitions(O.lst.token, '');

    for(const comp of comps){
      const {id, title, date, desc, applied} = comp;
      page.createCompetition(id, title, date, desc, applied);
    }
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

  async createUserProfilePage(nick){
    let data = null;

    try{
      data = await backend.getUserData(nick);
    }catch(err){
      if(err === '404') this.createError(404);
      else this.err(err);
      return;
    }

    data.nick = nick;
    data.registrationDate = O.date(data.registrationDate);

    const page = new pages.UserProfile(this.pageContent, data);
    this.page = page;
  }

  async createError(status, msg=null){
    const page = new pages.Error(this.pageContent, status, msg);
    this.page = page;
  }
};

DOM.Element = Element;

module.exports = DOM;