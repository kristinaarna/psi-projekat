'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../../omikron');
const Captcha = require('./captcha');
const Token = require('./token');

const methods = {
  async getHomePagePosts(){
    return [];
  },

  async getCompetitions(tk){
    return [];
  },

  async getCaptcha(){
    const captcha = await Captcha.generate();
    return {token: captcha.token};
  },
};

module.exports = methods;