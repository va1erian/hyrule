/* global io */
'use strict';

import { ViewPort } from 'gfx/viewport';
import { TileSet, TileMap, TileType } from 'gfx/tiles';
import { WorldState } from 'world/state';
import { Moblin, Player, KeyboardController } from 'world/actor';
import { Rectangle, Renderer } from 'gfx/utils';
import { GameLoop } from 'tools/loop';
import { TheAssetManager } from 'tools/assets';
import { TheInput, Keys } from 'tools/input';
import { PlayerCamera } from 'world/camera';

var loop = new GameLoop();

TheAssetManager.push('map-overworld', 'data/overworld.map')
   .push('tileset-overworld', 'img/overworld.gif')
   .push('sprite-link', 'img/link.png')
   .push('sprite-moblin', 'img/moblin.png')
   .then(init);

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
   
   let player = new Player(world, new KeyboardController());  
   
   do {
         player.x = Math.random() * 4000 | 0;
         player.y = Math.random() * 1400 | 0;
   } while(tilemap.isColliding(player));
   
   world.actors.push(player);
      
   for(var i = 0; i < 800; i++) {
      let mob =  new Moblin(world);
      
      do {
         mob.x = Math.random() * 4000 | 0;
         mob.y = Math.random() * 1400 | 0;
      } while(tilemap.isColliding(mob));
          
      world.actors.push(mob);
   }

   const viewport = new ViewPort(world, new Rectangle (0, 0, 256, 224));
   const cam = new PlayerCamera(viewport, player);
   loop.add(world);
   loop.add(cam);
   loop.add(new Renderer(viewport));
   

   loop.start();
}


