/* global io */
'use strict';

import { ViewPort } from 'src/gfx/viewport';
import { TileSet, TileMap} from 'src/gfx/tiles';
import { WorldState } from 'src/world/state';
import { Player } from 'src/world/actor';
import { Rectangle, Renderer } from 'src/gfx/utils';
import { GameLoop } from 'src/tools/loop';
import { TheAssetManager } from 'src/tools/assets';


var loop = new GameLoop();

TheAssetManager.push('map-overworld', 'data/overworld.map')
   .push('tileset-overworld', 'img/overworld.gif')
   .push('sprite-link', 'img/link.png')
   .then(init);

class Camera {
   constructor(viewport) {
      this.viewport = viewport;
      this.xMom = 0;
      this.yMom = 0;
      document.addEventListener('keydown', this.onKeyDown.bind(this), false);
      document.addEventListener('keyup', this.onKeyUp.bind(this), false);
   }
   
   update(dt) {
      const nextX = this.viewport.metrics.x + (this.xMom === 0 ? 0 : this.xMom * dt);
      const nextY = this.viewport.metrics.y + (this.yMom === 0 ? 0 : this.yMom * dt);
      this.viewport.metrics.x = nextX;
      this.viewport.metrics.y = nextY;
      
      this.xMom *= 0.95;
      this.yMom *= 0.95;   
   }
   
   onKeyDown(e) {
      var key = String.fromCharCode(e.keyCode);
      if(key === 'F') {
         this.xMom = 200; 
      } else if(key === 'S') {
         this.xMom = -200; 
      }
      
      
      if(key === 'E') {
         this.yMom = -200;
      } else if(key === 'D') {
         this.yMom = 200;
      }
   }
   
   onKeyUp() {
      
   }
}

var socket = io.connect();

function init(assets) {
   var tilemap = new TileMap(256,84, assets.get('map-overworld'));
   var tileset = new TileSet(assets.get('tileset-overworld'), 16,16, 0);
   var world = new WorldState();
      

   world.layers.set(tilemap, tileset);
   
   for(var i = 0; i < 1000; i++) {
      var player =  new Player();
      player.x = Math.random() * 4000 | 0;
      player.y = Math.random() * 1000 | 0;
      world.actors.push(player);
   }

   const viewport = new ViewPort(world, new Rectangle (0, 0, 256, 224));
   const cam = new Camera(viewport);
   loop.add(world);
   loop.add(cam);
   loop.add(new Renderer(viewport));
   

   loop.start();
}


