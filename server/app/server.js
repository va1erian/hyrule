'use strict';

import "app-module-path/register";
import express from 'express';
import socketio from 'socket.io';
import morgan from 'morgan';
import http from 'http';
import Path from 'path';

var app = express();
var server = http.createServer(app);
var io = socketio().listen(server);

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
    let nbParticipants = 0;

   app.use(express.static(Path.join(__dirname, path)));
   app.use(morgan('combined'));
      
   io.on('connection', (socket) => {
       console.log('client connected : ', socket.handshake.address);

       socket.on('connect-user', function (data) {
           if (!(data.username === undefined) && !(data.skin === undefined)) {
               socket.username = data.username;
               socket.skin = data.skin;
               TheWorldState.spawnPlayer(socket);
               socket.emit('is-user-connected', true);
               //result ? console.log('client ' + data.username + ' connected') : console.log('client ' + data.username + ' already connected');
           }
       });

       nbParticipants++;
       socket.nbParticipants = nbParticipants;
       
       socket.broadcast.emit('user joined', {
           username: "Thug",
           nbParticipants: nbParticipants
       });

      socket.on('chat message', function (data) {
            console.log('new message:' + data);
            socket.broadcast.emit('chat message', {
               username: "Thug",
               message: data
            });
         });

      socket.on('disconnect', function (data) {
         console.log('user ' +socket.username+' disconnected');
         nbParticipants--;
         socket.broadcast.emit('user disconnected', {
            username: "Anonymous", //replace with socket.username
            nbParticipants: nbParticipants
         });
      });

   });

   server.listen(port, callback);
}


startServer(3000, '../../client/build', () => console.log('Server started'));