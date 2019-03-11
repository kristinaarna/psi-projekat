'use strict';

class LocalStorage extends O.Storage{
  constructor(){
    super(O.lst);
  }

  static get version(){ return 0; }

  init(){
    const state = O.obj();
    this.state = state;

    state.signedIn = 0;
  }

  ser(ser=new O.Serializer()){
    const {state} = this;

    ser.write(state.signedIn);

    return ser;
  }

  deser(ser){
    const state = O.obj();
    this.state = state;

    state.signedIn = ser.read();

    return this;
  }

  get signedIn(){
    return this.state.signedIn || O.sst.signedIn;
  }

  set signedIn(val){
    this.state.signedIn = val;
    this.save();
    O.sst.signedIn = val;
  }
};

module.exports = LocalStorage;