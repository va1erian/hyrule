
'use strict';

import "app-module-path/register";
import express from 'express';
import socketio from 'socket.io';
import morgan from 'morgan';
import http from 'http';
import Path from 'path';

import {Actor} from 'world/actor';
import {TheWorldState} from 'world/state';
import {TheAssetManager} from 'tools/assets';
import {TileSet, TileType, TileMap} from 'gfx/tiles';

let app = express();
let server = http.createServer(app);
let io = socketio().listen(server);

/* global __dirname */

TheWorldState.io = io;


TheAssetManager
   .push('map-overworld', 'data/overworld.map')
   .then(main);

function main(assets) {
   console.log('MMOZ server!')
   initWorld(assets);
   startServer(3000, '../../client/build', () => console.log('Server started'));
   tick();
}

function initWorld(assets) {
   let tileset = new TileSet(114); //114 tiles in tileset
   let worldTileProps = tileset.makeTileProps();
   worldTileProps[6]  |= TileType.TILE_WALKABLE;
   worldTileProps[44] |= TileType.TILE_WALKABLE;
   worldTileProps[45] |= TileType.TILE_WALKABLE;
   let tilemap = new TileMap(256, 84, assets.get('map-overworld'), tileset);
   tilemap.tileProps = worldTileProps;
  
   TheWorldState.layers.push([tilemap, tileset]); 
}

function startServer(port, path, callback) { 
   app.use(express.static(Path.join(__dirname, path)));
   app.use(morgan('combined'));
   io.sockets.on('connection', function (socket) {
        console.log('client connected : ', socket.handshake.address);
        TheWorldState.spawnPlayer(socket);

       socket.on('disconnect', function()  {
            console.log('client disconnected : ', socket.handshake.address);
            console.log('TODO remove from WorldState');
            let disconnectedActor = TheWorldState.rooms.get("overworld").playerBySocket(socket)
            if (disconnectedActor){
                disconnectedActor.active = false;
                //TheWorldState.rooms.get("overworld").removePlayer(disconnectedActor);
            }

        });

   });
   


    server.listen(port, callback);
}

function tick() {
    TheWorldState.update(1/60);
    setTimeout(tick, 17);
}

