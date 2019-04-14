'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Page = require('./page');
const elemCtors = require('../user-profile');

class UserProfile extends Page{
  constructor(parent, data){
    super(parent);

    this.data = data;

    const labels = [
      ['nick', 'nick'],
      ['email', 'email'],
      ['registrationDate', 'registrationDate'],
      ['fullName', 'fullName'],
      ['description', 'desc'],
      ['isMod', 'isMod'],
    ];

    log(O.lst.isMod);

    new elemCtors.Avatar(this, data.nick);

    for(const [key, labelName] of labels){
      const val = data[key];
      if(val === null) continue;

      const label = LS.labels.userProfile[labelName];
      new elemCtors.Label(this, label, val);
    }
  }

  static title(){ return LS.titles.userProfile; }

  createPost(...args){
    const post = new Post(this, ...args);
    this.addPost(post);
  }

  addPost(post){
    this.posts.push(post);
  }

  addPosts(posts){
    for(const post of posts)
      this.addPost(post);
  }

  css(){ return 'user-profile'; }
};

module.exports = UserProfile;