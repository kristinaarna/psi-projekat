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

  get calledGC(){ return this.#machine.calledGC; }

  tick(){
    this.#machine.tick();
  }

  run(ticks=null){
    const machine = this.#machine;
    this.paused = 0;

    const t = O.now();
    let n = 0n;

    try{
      while(this.active){
        if(ticks !== null && ticks-- === 0){
          ticks++;
          break;
        }

        this.tick();
        n++;
      }
    }catch(err){
      throw err;
      let msg;

      if(err instanceof Error){
        msg = `${err.name}: ${err.message}`;
      }else{
        msg = 'UnknownError';
      }

      this.stderr.write(msg);
    }

    if(DEBUG && this.done){
      log(`Time: ${format.time((O.now() - t) / 1e3 + .5 | 0)}`);
      log(`Instructions: ${format.num(n)}`);
      log();
    }

    this.paused = 1;
    return ticks;
  }

  pause(){
    this.paused = 1;
    return this;
  }
}

module.exports = Engine;