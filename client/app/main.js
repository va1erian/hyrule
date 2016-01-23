/* global io */
'use strict';

import { ViewPort } from 'src/gfx/viewport';
import { TileSet, TileMap, TileType } from 'src/gfx/tiles';
import { WorldState } from 'src/world/state';
import { Player } from 'src/world/actor';
import { Rectangle, Renderer } from 'src/gfx/utils';
import { GameLoop } from 'src/tools/loop';
import { TheAssetManager } from 'src/tools/assets';
import { TheInput, Keys } from 'src/tools/input';

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
   }
   
   update(dt) {
      const nextX = this.viewport.metrics.x + (this.xMom === 0 ? 0 : this.xMom * dt);
      const nextY = this.viewport.metrics.y + (this.yMom === 0 ? 0 : this.yMom * dt);
      this.viewport.metrics.x = nextX;
      this.viewport.metrics.y = nextY;
      
      if(TheInput.pressed(Keys.RIGHT)) {
         this.xMom = 200; 
      } else if(TheInput.pressed(Keys.LEFT)) {
         this.xMom = -200; 
      }
      
      if(TheInput.pressed(Keys.UP)) {
         this.yMom = -200;
      } else if(TheInput.pressed(Keys.DOWN)) {
         this.yMom = 200;
      }
      this.xMom *= 0.95;
      this.yMom *= 0.95;   
   }
}

let socket = io.connect();

function init(assets) {
   let tileset = new TileSet(assets.get('tileset-overworld'), 16,16);
   let worldTileProps = tileset.makeTileProps();
   
   worldTileProps[6]  |= TileType.TILE_WALKABLE;
   worldTileProps[44] |= TileType.TILE_WALKABLE;
   worldTileProps[45] |= TileType.TILE_WALKABLE;
   
   let tilemap = new TileMap(256,84, assets.get('map-overworld'), tileset);
   tilemap.tileProps = worldTileProps;
   var world = new WorldState();
      
   world.layers.push([tilemap, tileset]);
   
   for(var i = 0; i < 800; i++) {
      let player =  new Player(world);
      
      do {
         player.x = Math.random() * 4000 | 0;
         player.y = Math.random() * 1400 | 0;
      } while(tilemap.isColliding(player));
          
      world.actors.push(player);
   }

   const viewport = new ViewPort(world, new Rectangle (0, 0, 256, 224));
   const cam = new Camera(viewport);
   loop.add(world);
   loop.add(cam);
   loop.add(new Renderer(viewport));
   

   loop.start();
}


