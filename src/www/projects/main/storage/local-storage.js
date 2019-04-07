'use strict';

const EnhancedStorage = require('./enhanced-storage');

const keys = [
  'token',
];

class LocalStorage extends EnhancedStorage{
  constructor(){
    super(O.lst, O.project, keys);
  }

  init(){
    const state = O.obj();
    this.state = state;

    state.token = null;
  }

  ser(ser=new O.Serializer()){
    const {state} = this;

    if(state.token){
      ser.write(1);
      ser.writeBuf(state.token);
    }else{
      ser.write(0);
    }

    return ser;
  }

  deser(ser){
    const state = O.obj();
    this.state = state;

    state.token = ser.read() ? ser.readBuf() : null;

    return this;
  }

  get signedIn(){ return this.token !== null; }
};

module.exports = LocalStorage;