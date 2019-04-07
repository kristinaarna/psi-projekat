'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../../omikron');
const php = require('../../php');
const hash = require('../../hash');
const Captcha = require('./captcha');
const Token = require('./token');

const methods = {
  async getHomePagePosts(){
    // Not implemented yet
    return [];
  },

  async getCompetitions(token){
    // Not implemented yet
    return [];
  },

  async getCaptcha(){
    // Generate a new captcha image and send the token to the user
    const captcha = await Captcha.generate();
    return captcha.token;
  },
};

module.exports = methods;

function isStr(val){
  return typeof val === 'string';
}