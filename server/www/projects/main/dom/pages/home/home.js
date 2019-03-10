'use strict';

const LS = require('../../../strings');
const Element = require('../../element');
const Post = require('./post');

class Home extends Element.Div{
  constructor(parent, posts=[]){
    super(parent);

    this.title = new Element.Title(this, LS.titles.home);
    this.posts = [];

    this.addPosts(posts);
  }

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