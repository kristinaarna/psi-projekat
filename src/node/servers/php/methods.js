'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../../omikron');

const methods = {
  async getHomePagePosts(){
    return [
      {
        user: 'x-y-z',
        date: 1e8,
        content: 'Најновији пост.\nСадржај поста може да се простире у више редова.',
      }, {
        user: 'abc',
        date: 1e6,
        content: 'Неки други пост.',
      }, {
        user: 'test',
        date: 0,
        content: 'Ово је пост број 1.',
      },
    ];
  },
};

module.exports = methods;