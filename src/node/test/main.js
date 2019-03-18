'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const O = require('../omikron');

setTimeout(main);

function main(){
  const G = new O.Graph([A, B]);

  let a = new A(G, 5);
  let b = new B(G, 7);
  let c = new A(G, 123);
  let d = new B(G, 55);

  a.x = null;
  a.y = null;
  b.p = null;
  b.q = null;
  c.x = null;
  c.y = a;
  d.p = null;
  d.q = null;

  log(G);
  log();

  const ser = G.ser();
  const buf = ser.getOutput(1);
  log(buf.toString('hex'));

  log();
  log(new O.Graph([A, B]).deser(new O.Serializer(buf, 1)));
}

class A extends O.GraphNode{
  constructor(graph, num){
    super(graph);
    this.num = num;
  }

  ser(ser=new O.Serializer()){
    ser.writeInt(this.num);
    return ser;
  }

  deser(ser){
    this.num = ser.readInt();
    return this;
  }

  [util.inspect.custom](){ return `[${f(this.x)}, ${f(this.y)}]`; }
  static keys(){ return ['x', 'y']; }
};

class B extends O.GraphNode{
  constructor(graph, num){
    super(graph);
    this.num = num;
  }

  ser(ser=new O.Serializer()){
    ser.writeInt(this.num);
    return ser;
  }

  deser(ser){
    this.num = ser.readInt();
    return this;
  }

  [util.inspect.custom](){ return `[${f(this.p)}, ${f(this.q)}]`; }
  static keys(){ return ['p', 'q']; }
};

function f(node){
  if(node === null) return 'null';
  return String(node.num);
}