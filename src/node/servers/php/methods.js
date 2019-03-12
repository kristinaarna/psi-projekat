'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../../omikron');

const methods = {
  async getHomePagePosts(){
    return require('./responses/home-page-posts');
  },
};

module.exports = methods;