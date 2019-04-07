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

  async register(nick, email, pass, captchaToken, captchaStr){
    /*
      Ensure that the nick name:
        1. is a string
        2. is not longer than 32 characters
        3. consists of lower case letters or numebrs separated by optional hyphens
      Valid examples:
        a
        5
        xy
        some-user
        a-b-c-d
    */
    if(!isStr(nick) || nick.length > 32 || !/^[a-z0-9]+(?:\-[a-z0-9]+)*$/.test(nick))
      throw 'invalidNick';

    /*
      Ensure that the email:
        1. is a string
        2. is not longer than 1024 characters
        3. consists of lower case letters or numebrs separated by exactly one "@" symbol
      Valid examples:
        user@website
        a.b.c@dd.ee
        ...@x.y.z
        ----@--
    */
    if(!isStr(email) || email.length > 1024 || !/^[a-z0-9\-\.]+\@[a-z0-9\-\.]+$/.test(email))
      throw 'invalidEmail';

    /*
      Ensure that the password:
        1. is a string
        2. is not shorter than 8 characters
        3. is not longer than 64 characters
        4. consists of printable ASCII characters (including spaces)
        5. has at least one lower case letter
        6. has at least one upper case letter
        7. has at least one digit
      Valid examples:
        abcdefX7
        aaAA3333
        2 + 3 x B
    */
    if(!isStr(pass) || pass.length < 8 || pass.length > 64 || (
      /^[ ~]+$/.test(pass) && !(
        /[a-z]/.test(pass) &&
        /[A-Z]/.test(pass) &&
        /[0-9]/.test(pass)
      )
    )) throw 'invalidPass';

    /*
      Check the captcha validity.
      The reason this is separated in a new code block is because
      variables `msg`, `captcha` and `ok` are not used outside
      this block, so encapsulating them in a new code block speeds
      up the JavaScript engine.
    */
    {
      const msg = 'invalidCaptcha';
      if(!isStr(captchaToken)) throw msg;

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

    /*
      TODO: Registration was successfull, now we need to automatically
      login the user and send the token, but since login is not implemented
      yet, we only return the string "ok"
    */
    return 'ok';
  },
};

module.exports = methods;

function isStr(val){
  return typeof val === 'string';
}