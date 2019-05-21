'use strict';

class EnhancedStorage extends O.Storage{
  constructor(legacy, project, keys=[]){
    super(legacy, project);

    for(const key of keys){
      Object.defineProperty(this, key, {
        get(){
          return this.state[key];
        },

        set(val){
          this.state[key] = val;
          this.save();
        },
      });
    }
  }

  static get version(){ return 0; }

  init(){ O.virtual('init'); }
}

module.exports = EnhancedStorage;