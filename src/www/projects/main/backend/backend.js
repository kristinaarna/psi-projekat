'use strict';

const server = require('./server');

/*
  Module "backend" is a wrapper for all PHP/SQL/Node.js
  operations that are intended to be performed on the
  server side. Every communication with the server
  (including get and post requests) shoud be realized
  using this module.
*/

const methods = [
  'getHomePagePosts',
  'getCompetitions',
  'getCaptcha',
];

module.exports = initMethods(methods);

function initMethods(methods){
  const obj = O.obj();

  for(const method of methods){
    obj[method] = (...args) => {
      return send(method, ...args);
    };
  }

  return obj;
}

async function send(method, ...args){
  const obj = {method, args};
  const res = await server.send(obj);
  if(res.error !== null) throw new Error(res.error);
  return res.data;
}