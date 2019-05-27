'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');

const cwd = __dirname;

const textures = {
  hud: './textures/hud.png',
  sky: './textures/sky.png',
  dirt: './textures/dirt.png',
  rock: './textures/rock.png',
  tree: './textures/tree.png',
  animal: './textures/animal.png',
  bot: './textures/bot.png',
};

class Material{
  constructor(img, tex){
    this.img = img;
    this.tex = tex;
  }

  static async init(genTexFunc, procTexFunc){
    for(const texture of O.keys(textures)){
      const glTex = genTexFunc();
      const [img, tex] = await Material.loadTexture(textures[texture], glTex, procTexFunc);
      Material[texture] = new Material(img, tex);
    }
  }

  static loadTexture(pth, glTex, procTexFunc){
    return new Promise(res => {
      const tex = glTex;
      const img = new Image();

      img.onload = () => {
        procTexFunc(tex, img);
        res([img, tex]);
      };

      img.src = O.urlTime(path.join(cwd, pth));
    });
  }
};

module.exports = Material;