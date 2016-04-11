/* global io */
'use strict';

import { ViewPort } from 'gfx/viewport';
import { TileSet, TileMap, TileType } from 'gfx/tiles';
import { TheWorldState } from 'world/state';
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
  
   let tilemap = new TileMap(256,84, assets.get('map-overworld'), tileset);
   tilemap.tileProps = worldTileProps;

   TheWorldState.layers.push([tilemap, tileset]);

   socket.on('player-join', (el)  => TheWorldState.setActorList(el));
   socket.on('player-update', (el) => TheWorldState.refreshActor(el));
   socket.on('player-welcome', (el) =>  {
      TheWorldState.playerUUID = el;
      const controller =  new KeyboardController(socket);
      const viewport = new ViewPort(TheWorldState, new Rectangle (0, 0, 256, 224));
            
      const cam = new PlayerCamera(viewport, TheWorldState.localPlayer);
      loop.add(TheWorldState);
      loop.add(controller);
      loop.add(cam);
      loop.add(new Renderer(viewport));
   });
   loop.start();
}


