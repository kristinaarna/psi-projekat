'use strict';

const LS = require('../../strings');
const Element = require('../element');
const Page = require('./page');
const Post = require('../post');

class Home extends Page{
  constructor(parent, posts=[]){
    super(parent);

    this.posts = [];
    this.addPosts(posts);
  }

  static title(){ return LS.titles.home; }

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

  css(){ return 'home'; }
};

Home.Post = Post;

module.exports = Home;