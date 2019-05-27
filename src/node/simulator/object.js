'use strict';

const Shape = require('./shape');
const Material = require('./material');
const Model = require('./model');
const Ray = require('./ray');
const Vector = require('./vector');

const {zero} = Vector;

const objs = new Set();

class Object extends Ray{
  static objs = objs;

  static model = null;
  static material = null;

  static is = Object.traits([]);
  is = this.constructor.is;

  #dir = 0;

  updateSym = Symbol();

  constructor(tile){
    const {x, y, z} = tile;
    super(x, y, z, 0, 0, 0);

    this.grid = tile.grid;
    this.tile = tile;
    this.index = -1;
    this.dir = 0;

    this.prev = Ray.from(this);
    this.shapes = [];

    this.aels();

    objs.add(this);
    tile.addObj(this);
  }

  static reset(){
    objs.clear();
  }

  static traits(arr){
    const obj = O.obj();
    for(const trait of arr) obj[trait] = 1;
    return obj;
  }

  aels(){
    const {grid} = this;

    this.tickBound = 'onTick' in this ? this.onTick.bind(this) : null;

    this.updateBound = 'onUpdate' in this ? type => {
      if(this.updateSym === grid.updateSym) return;
      this.updateSym = grid.updateSym;
      this.onUpdate(type);
    } : null;

    if(this.tickBound !== null) this.grid.ael('tick', this.tickBound);
  }

  rels(){
    if(this.tickBound !== null) this.grid.rel('tick', this.tickBound);
  }

  get(x, y, z){
    let t;

    switch(this.#dir){
      case 1: [x, z] = [-z, x]; break;
      case 2: [x, z] = [-x, -z]; break;
      case 3: [x, z] = [z, -x]; break;
    }

    return this.grid.get(this.x + x, this.y + y, this.z + z);
  }

  canJump(){
    return this.get(0, -1, 0).has.ground && this.get(0, 1, 0).free;
  }

  jump(){
    this.nav(5);
  }

  descend(){
    this.nav(4);
  }

  move(x, y, z){
    super.move(x, y, z);

    this.tile.removeObj(this);
    this.tile = this.grid.get(x, y, z);
    this.tile.addObj(this);
  }

  nav(dir){
    this.movev(Vector.navv(this, dir));
  }

  rot(rx, ry, rz){
    super.rot(rx, ry, rz);
  }

  canGo(){
    return this.get(0, 0, -1).free;
  }

  go(){
    this.nav(this.dir);
  }

  turnLeft(){
    this.dir = this.dir + 1 & 3;
  }

  turnRight(){
    this.dir = this.dir - 1 & 3;
  }

  get dir(){
    return this.#dir;
  }

  set dir(dir){
    this.#dir = dir;
    this.rot(0, -dir * O.pih, 0);
  }

  get reng(){ return this.grid.reng; }

  addShape(shape=null){
    const {shapes} = this;

    if(shape === null){
      const ctor = this.constructor;
      shape = new Shape(Model[ctor.model], Material[ctor.material]);
    }

    shape.obj = this;
    shape.index = shapes.length;
    shapes.push(shape);
  }

  removeShape(shape){
    const {shapes} = this;
    const {index} = shape;
    const last = shapes.pop();

    shape.obj = null;
    last.index = index;
    if(last !== shape) shapes[index] = last;
  }

  remove(){
    this.rels();
    this.tile.removeObj(this);
    objs.delete(this);

    for(const shape of this.shapes)
      shape.remove();
  }

  getv(v){ return this.get(v.x, v.y, v.z); }
  movev(v){ return this.move(v.x, v.y, v.z); }
  rotv(v){ return this.rot(v.x, v.y, v.z); }
}

class Dirt extends Object{
  static is = Object.traits(['occupying', 'opaque', 'ground']);
  static model = 'cubeuv';
  static material = 'dirt';

  constructor(tile){
    super(tile);
    this.addShape();
  }
}

class Tree extends Object{
  static is = Object.traits(['occupying']);
  static model = 'tree';
  static material = 'tree';

  constructor(tile){
    super(tile);
    this.addShape();
  }
}

class Rock extends Object{
  static is = Object.traits(['occupying', 'nonFloating', 'pushable']);
  static model = 'rock';
  static material = 'rock';

  constructor(tile){
    super(tile);
    this.addShape();

    const angle = O.randf(O.pi2);
    this.rot(0, angle, 0);
    this.prev.rot(0, angle, 0);
  }

  onUpdate(){
    const {grid} = this;

    if(grid.getv(Vector.navv(this, 4)).empty){
      this.nav(4);
      return;
    }
  }
}

class Animal extends Object{
  static is = Object.traits(['occupying', 'nonFloating', 'entity']);
  static model = 'animal';
  static material = 'animal';

  jumped = 0;

  constructor(tile){
    super(tile);
    this.addShape();
  }

  onTick(){
    const {jumped} = this;

    this.jumped = 0;

    if(this.get(0, -1, 0).nempty){
      if(O.rand(4) !== 0){
        if(this.get(0, 0, -1).empty && !(this.get(0, -1, -1).empty && this.get(0, -2, -1).empty))
          return this.go();

        if(this.get(0, -1, 0).has.ground && this.get(0, 1, 0).empty && this.get(0, 0, -1).has.ground && this.get(0, 1, -1).empty){
          this.jump();
          this.jumped = 1;
          return;
        }
      }

      this.dir = this.dir + (O.rand(2) ? 1 : -1) & 3;
    }else{
      if(!jumped){
        if(O.rand(2)) this.dir = this.dir + (O.rand(2) ? 1 : -1) & 3;
        return this.descend();
      }

      if(this.get(0, 0, -1).empty && !(this.get(0, -1, -1).empty && this.get(0, -2, -1).empty))
        return this.go();

      if(O.rand(2)) this.dir = this.dir + (O.rand(2) ? 1 : -1) & 3;
      this.descend();
    }
  }
}

class Bot extends Object{
  static is = Object.traits(['occupying', 'nonFloating', 'entity']);
  static model = 'bot';
  static material = 'bot';

  jumped = 0;
  jumpedPrev = 0;
  moved = 0;

  constructor(tile){
    super(tile);
    this.addShape();
  }

  onTick(){
    this.jumpedPrev = this.jumped;
    this.jumped = 0;
    this.moved = 0;

    const shouldDescend = this.get(0, -1, 0).free;

    this.reng.emit('tick', this);

    if(shouldDescend && this.get(0, -1, 0).free && !(this.moved && (this.jumpedPrev || this.jumped)))
      this.descend();
  }

  go(){
    super.go();
    this.moved = 1;
  }

  canGo(){
    if(!super.canGo()) return 0;
    if(this.get(0, -1, 0).nfree) return 1;
    return this.jumpedPrev;
  }

  jump(){
    super.jump();
    this.jumped = 1;
  }
}

const ctorsArr = [
  Dirt,
  Rock,
  Tree,
  Animal,
  Bot,
];

const ctors = O.obj();
for(const ctor of ctorsArr)
  ctors[ctor.name] = ctor;

module.exports = window.Object.assign(Object, {
  objs,
  ctors,
  ctorsArr,
  ctorsNum: ctorsArr.length,
});