'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../../../omikron');
const SG = require('../../../serializable-graph');
const SF = require('../../stack-frame');
const cgs = require('../../common-graph-nodes');
const Interpreter = require('./interpreter');

const cs = Interpreter.ctorsObj;

class Simulator extends cs.NativeInvocation{
  tick(th){
    const {g, name, args} = this;

    if(args === null)
      return th.ret(this.intp.simulator);

    if(args.next !== null)
      return th.throw(new cgs.TypeError(g, `${name} takes no more than one argument`));

    const ident = args.ident.str;

    if(/^[\+\-]?\d+$/.test(ident)){
      const num = +ident;
      const int = num | 0;

      if(int !== num)
        return th.throw(new cgs.TypeError(g, `Invalid integer ${ident} at ${name}`));

      return th.ret(new Integer(g, int));
    }

    if(/^".*"$/.test(ident)){
      let str = null;
      try{ str = JSON.parse(ident); }catch{}

      if(str === null)
        return th.throw(new cgs.TypeError(g, `Invalid string ${ident} at ${name}`));

      return th.ret(new String(g, str));
    }

    if(/^\..+/.test(ident)){
      const method = ident.slice(1);

      switch(method){
        case 'dispatch':
          th.ret(new Dispatch(g));
          break;

        case 'rotate':
          th.ret(new Rotate(g));
          break;

        case 'go':
          th.ret(new Go(g));
          break;

        case 'jump':
          th.ret(new Jump(g));
          break;

        case 'canSee':
          th.ret(new CanSeeTile(g));
          break;

        default:
          th.throw(new cgs.TypeError(g, `${method} is not a valid method for ${name}`));
          break;
      }

      return;
    }

    th.throw(new cgs.TypeError(g, `${O.sf(ident)} is not a valid argument for ${name}`));
  }
}

class PassiveInvocation extends cs.NativeInvocation{
  tick(th){
    let str = this.toString();
    if(str !== '') str += ' ';

    th.throw(new cgs.TypeError(this.g, `${this.name} ${str}is not a function`));
  }
}

class Null extends PassiveInvocation{
  toString(){
    return '';
  }
}

class Integer extends PassiveInvocation{
  constructor(g, int){
    super(g);
    if(g.dsr) return;

    this.int = int;
  }

  ser(s){ super.ser(); ser.writeInt(this.int); }
  deser(s){ super.deser(); this.int = ser.readInt(); }

  static cmp(v1, v2){
    return v1.int === v2.int;
  }

  invoke(args){
    return new this.constructor(this.g, this.int);
  }

  toString(){
    return global.String(this.int);
  }
}

class String extends PassiveInvocation{
  static ptrsNum = this.keys(['str']);

  constructor(g, str=null){
    super(g);
    if(g.dsr) return;

    this.str = new cgs.String(g, str);
  }

  static cmp(v1, v2){
    return v1.str.str === v2.str.str;
  }

  invoke(args){
    return new this.constructor(this.g, this.str.str);
  }

  toString(){
    return O.sf(this.str.str);
  }
}

class Dispatch extends cs.NativeInvocation{
  tick(th){
    if(this.eargs === null){
      if(this.nval) return th.call(this.evalArgs());
      this.eargs = this.gval;
    }

    const {g, name, args, eargs} = this;

    if(eargs.length !== 0)
      return th.throw(new cgs.TypeError(g, `${name} takes no arguments`));

    if(this.nval){
      this.g.stdout.write(O.Buffer.from([0x00]));
      return th.call(new cgs.Read(g, 8));
    }

    const {buf} = this.gval;
    if(buf[0] !== 0) return th.ret(new Null(g));

    th.ret(this.intp.zero);
  }
}

class Rotate extends cs.NativeInvocation{
  tick(th){
    if(this.eargs === null){
      if(this.nval) return th.call(this.evalArgs());
      this.eargs = this.gval;
    }

    const {g, name, args, eargs} = this;

    if(eargs.length !== 1)
      return th.throw(new cgs.TypeError(g, `${name} takes exactly 1 argument`));

    const dir = eargs.get(0);

    if(!(dir instanceof Integer))
      return th.throw(new cgs.TypeError(g, `${name} takes integer representing direction as argument`));

    if(dir.int !== (dir.int & 3))
      return th.throw(new cgs.TypeError(g, `${name} argument can only be an integer in interval [0, 3]`));

    if(this.nval){
      this.g.stdout.write(O.Buffer.from([0x01, dir.int]));
      return th.call(new cgs.Read(g, 8));
    }

    const {buf} = this.gval;
    if(buf[0] !== 0) return th.ret(new Null(g));

    th.ret(this.intp.zero);
  }
}

class Go extends cs.NativeInvocation{
  tick(th){
    if(this.eargs === null){
      if(this.nval) return th.call(this.evalArgs());
      this.eargs = this.gval;
    }

    const {g, name, args, eargs} = this;

    if(eargs.length !== 0)
      return th.throw(new cgs.TypeError(g, `${name} takes no arguments`));

    if(this.nval){
      this.g.stdout.write(O.Buffer.from([0x02]));
      return th.call(new cgs.Read(g, 8));
    }

    const {buf} = this.gval;
    if(buf[0] !== 0) return th.ret(new Null(g));

    th.ret(this.intp.zero);
  }
}

class Jump extends cs.NativeInvocation{
  tick(th){
    if(this.eargs === null){
      if(this.nval) return th.call(this.evalArgs());
      this.eargs = this.gval;
    }

    const {g, name, args, eargs} = this;

    if(eargs.length !== 0)
      return th.throw(new cgs.TypeError(g, `${name} takes no arguments`));

    if(this.nval){
      this.g.stdout.write(O.Buffer.from([0x03]));
      return th.call(new cgs.Read(g, 8));
    }

    const {buf} = this.gval;
    if(buf[0] !== 0) return th.ret(new Null(g));

    th.ret(this.intp.zero);
  }
}

class CanSeeTile extends cs.NativeInvocation{
  tick(th){
    if(this.eargs === null){
      if(this.nval) return th.call(this.evalArgs());
      this.eargs = this.gval;
    }

    const {g, name, args, eargs} = this;

    if(eargs.length !== 3)
      return th.throw(new cgs.TypeError(g, `${name} takes 3 arguments (got ${eargs.length})`));

    const x = eargs.get(0);
    const y = eargs.get(1);
    const z = eargs.get(2);

    if(!(x instanceof Integer && y instanceof Integer && z instanceof Integer))
      return th.throw(new cgs.TypeError(g, `${name} takes three integer coordinates as arguments (x, y, z)`));

    if(this.nval){
      this.g.stdout.write(O.Buffer.from([0x04, x.int, y.int, z.int]));
      return th.call(new cgs.Read(g, 16));
    }

    const {buf} = this.gval;
    if(buf[0] !== 0) return th.ret(new Null(g));

    th.ret(this.intp.globInv.getIdentByIndex(buf[1] & 1));
  }
}

const ctorsArr = [
  Simulator,
  PassiveInvocation,
  Null,
  Integer,
  String,
  Dispatch,
  Rotate,
  Go,
  Jump,
  CanSeeTile,
];

const ctorsObj = O.obj();
for(const ctor of ctorsArr)
  ctorsObj[ctor.name] = ctor;

module.exports = {
  ctorsArr,
  ctorsObj,
};