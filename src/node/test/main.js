'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const O = require('../omikron');

setTimeout(main);

function main(){
  const G = new O.Graph([A, B], 3);

  let a = new A(G, 5);
  a.x = a;
  a.y = a;

  let b = new B(G, 7);
  b.p = b;
  b.q = b;

  let c = new A(G, 123);
  c.x = c;
  c.y = c;
  a.x = c;

  let d = new B(G, 55);
  d.p = d;
  d.q = d;

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