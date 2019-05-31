'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');

const cwd = __dirname;

class Material{
  constructor(img, tex){
    this.img = img;
    this.tex = tex;
  }

  static async init(genTexFunc, procTexFunc){
    const textures = {
      hud: './textures/hud.png',
      sky: './textures/sky.png',
      dirt: './textures/dirt.png',
      rock: './textures/rock.png',
      tree: './textures/tree.png',
      animal: './textures/animal.png',
      bot: O.lst.signedIn ?
        `/avatar?nick=${O.lst.nick}` :
        './textures/bot.png',
      coin: './textures/coin.png',
    };

    for(const texture of O.keys(textures)){
      const glTex = genTexFunc();
      const [img, tex] = await Material.loadTexture(textures[texture], glTex, procTexFunc);
      Material[texture] = new Material(img, tex);
    }
  }

  static loadTexture(pth, glTex, procTexFunc){
    return new Promise((res, rej) => {
      const tex = glTex;
      const img = new Image();

      img.onload = () => {
        procTexFunc(tex, img);
        res([img, tex]);
      };

      img.onerror = () => {
        rej(new Error(`Cannot load image ${O.sf(pth)}`));
      };

      if(pth[0] === '.') pth = path.join(cwd, pth);
      img.src = O.urlTime(pth);
    });
  }
};

module.exports = Material;