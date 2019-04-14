'use strict';

const EnhancedStorage = require('./enhanced-storage');

const keys = [
  'token',
  'nick',
  'isMod',
];

class LocalStorage extends EnhancedStorage{
  constructor(){
    super(O.lst, O.project, keys);
  }

  init(){
    const state = this.state = O.obj();

    state.token = null;
    state.nick = null;
    state.isMod = null;

    return this;
  }

  ser(ser=new O.Serializer()){
    const {state} = this;

    if(state.token !== null){
      ser.write(1);
      ser.writeStr(state.token);
      ser.writeStr(state.nick);
      ser.write(state.isMod);
    }else{
      ser.write(0);
    }

    return ser;
  }

  deser(ser){
    const {state} = this.init();

    if(ser.read()){
      state.token = ser.readStr();
      state.nick = ser.readStr();
      state.isMod = ser.read();
    }

    return this;
  }

  get signedIn(){ return this.token !== null; }
};

module.exports = LocalStorage;