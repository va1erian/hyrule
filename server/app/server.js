
'use strict';

import "app-module-path/register";
import express from 'express';
import socketio from 'socket.io';
import morgan from 'morgan';
import http from 'http';
import Path from 'path';

import {Actor}  from 'world/actor';

var app = express();
var server = http.createServer(app);
var io = socketio().listen(server);

/* global __dirname */


class Player {
   constructor(socket) {
      this.socket = socket;
   }
}

class Room {
   constructor(id) {
      this.id = id;
      this.players = [];
      this.npcs    = [];
   }
   
   addPlayer(player) {
      this.players.push(player);
      player.socket.join(this.id);
      player.socket.on('player-act', msg => this.onPlayerAct(player, msg));
      io.to(this.id).emit('player-join');
   }
   
   onPlayerAct(player, msg) {
      console.log(msg);
   }
}

class WorldState {
   constructor() {
      this.rooms   = new Map();
      this.rooms.set('test', new Room('test'));
   }
   
   spawnPlayer(socket, room) {
      let player = new Player(socket);
      this.rooms.get(room).addPlayer(player);
      return player;
   }
}

function startServer(port, path, callback) {
   
   let world = new WorldState();

   app.use(express.static(Path.join(__dirname, path)));
   app.use(morgan('combined'));
   
   io.on('connection', (socket) => {
      console.log('client connected');
      world.spawnPlayer(socket ,'test');
   });

   server.listen(port, callback);
}

startServer(3000, '../../client/build', () => console.log('Server started'));