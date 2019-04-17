'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../../omikron');
const php = require('../../php');
const hash = require('../../hash');
const Captcha = require('./captcha');
const Token = require('./token');
const check = require('./check');
const editableData = require('./editable-user-data');

const ALLOW_DELETING_PROFILE = 1;

const methods = {
  async getPosts(keywords){
    if(!check.text(keywords)) throw 'data';
    return await php.exec('getPosts', {keywords});
  },

  async getCompetitions(token, keywords){
    if(!check.tokenn(token)) throw 'data';
    if(!check.text(keywords)) throw 'data';
    return await php.exec('getCompetitions', {token, keywords});
  },

  async getFunctionalities(token, keywords){
    if(!check.tokenn(token)) throw 'data';
    if(!check.text(keywords)) throw 'data';
    return await php.exec('getFunctionalities', {token, keywords});
  },

  async getUsers(keywords){
    if(!check.sstr(keywords)) throw 'data';
    return await php.exec('getUsers', {keywords});
  },

  async getCaptcha(){
    // Generate a new captcha image and send the token to the user
    const captcha = await Captcha.generate();
    return captcha.token;
  },

  async register(nick, email, pass, captchaToken, captchaStr){
    if(!check.nick(nick)) throw 'invalidNick';
    if(!check.email(email)) throw 'invalidEmail';
    if(!check.pass(pass)) throw 'invalidPass';

    /*
      Check the captcha validity.
      The reason this is separated in a new code block is because
      variables `msg`, `captcha` and `ok` are not used outside
      this block, so encapsulating them in a new code block speeds
      up the JavaScript engine.
    */
    {
      const msg = 'invalidCaptcha';
      if(check.nstr(captchaToken)) throw msg;

      const captcha = Captcha.get(captchaToken);
      if(captcha === null) throw msg;

      const ok = typeof captchaStr === 'string' && captcha.check(captchaStr);
      captcha.invalidate();
      if(!ok) throw msg;
    }

    /*
      Finally, execute the `register` PHP query and send the
      relevant arguments (nick, email, passHash).
    */
    await php.exec('register', {
      nick,
      email,
      passHash: hash(pass, 'sha512').toString('base64'),
    });
  },

  async login(nick, pass){
    if(check.nstr(nick) || check.nstr(pass)) throw 'data';

    const token = Token.generate();
    const data = await php.exec('login', {
      nick,
      passHash: hash(pass, 'sha512').toString('base64'),
      token,
    });

    data.token = token;
    return data;
  },

  async logout(token){
    if(!check.token(token)) throw 'data';
    await php.exec('logout', {token});
  },

  async getUserData(nick){
    if(!check.nick(nick)) throw 'data';
    return await php.exec('getUserData', {nick});
  },

  async applyForCompetition(token, idComp){
    if(!check.token(token)) throw 'data';
    if(!check.id(idComp)) throw 'data';
    await php.exec('applyForCompetition', {token, idComp});
  },

  async giveUpFromCompetition(token, idComp){
    if(!check.token(token)) throw 'data';
    if(!check.id(idComp)) throw 'data';
    await php.exec('giveUpFromCompetition', {token, idComp});
  },

  async upgradeFunctionality(token, idFunc){
    if(!check.token(token)) throw 'data';
    if(!check.id(idFunc)) throw 'data';
    await php.exec('upgradeFunctionality', {token, idFunc});
  },

  async addPost(token, content){
    if(!check.token(token)) throw 'data';
    if(!check.text(content)) throw 'data';
    await php.exec('addPost', {token, content});
  },

  async addCompetition(token, title, desc){
    if(!check.token(token)) throw 'data';
    if(!check.sstr(title)) throw 'data';
    if(!check.text(desc)) throw 'data';
    await php.exec('addCompetition', {token, title, desc});
  },

  async editUserData(token, type, val){
    if(!check.token(token)) throw 'data';
    if(!check.str(type)) throw 'data';
    if(!check.str(val)) throw 'data';
    if(!O.has(editableData, type)) throw 'data';

    val = val.trim();
    if(val.length > editableData[type]) throw 'data';
    else if(val.length === 0) val = null;

    await php.exec('editUserData', {token, type, val});
  },

  async turnIntoMod(token, nick){
    if(!check.token(token)) throw 'data';
    if(!check.sstr(nick)) throw 'data';
    await php.exec('turnIntoMod', {token, nick});
  },

  async deleteOwnProfile(token){
    if(!ALLOW_DELETING_PROFILE) throw 'forbidden';
    if(!check.token(token)) throw 'data';
    await php.exec('deleteOwnProfile', {token});
  },

  async deleteOtherProfile(token, nick){
    if(!ALLOW_DELETING_PROFILE) throw 'forbidden';
    if(!check.token(token)) throw 'data';
    if(!check.sstr(nick)) throw 'data';
    await php.exec('deleteOtherProfile', {token, nick});
  },
};

module.exports = methods;