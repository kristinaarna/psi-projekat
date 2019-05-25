'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const format = require('../format');
const Machine = require('./machine');

const DEBUG = 0;

class Engine{
  #machine;

  paused = 1;

  constructor(lang, script, maxSize, criticalSize){
    this.#machine = new Machine(lang, script, maxSize, criticalSize);
  }

  get stdin(){ return this.#machine.stdin; }
  get stdout(){ return this.#machine.stdout; }
  get stderr(){ return this.#machine.stderr; }

  get active(){ return !this.paused && this.#machine.active; }
  get done(){ return this.#machine.done; }

  tick(){
    this.#machine.tick();
  }

  run(ticks=null){
    this.paused = 0;

    const t = Date.now();
    let n = 0n;

    try{
      while(this.active){
        if(ticks !== null && ticks-- === 0) break;
        this.tick();
        n++;
      }
    }catch(err){
      let msg;

      if(err instanceof Error){
        msg = `${err.name}: ${err.message}`;
      }else{
        msg = `FatalError: Something went really bad :/`;
      }

      this.stderr.write(msg);
    }

    if(DEBUG && this.done){
      log(`Time: ${format.time((Date.now() - t) / 1e3 + .5 | 0)}`);
      log(`Instructions: ${format.num(n)}`);
      log();
    }

    return this.pause();
  }

  pause(){
    this.paused = 1;
    return this;
  }
}

module.exports = Engine;