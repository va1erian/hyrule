
'use strict';
import express from 'express';
import socketio from 'socket.io';
import morgan from 'morgan';
import http from 'http';
import Path from 'path';

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
   let nbParticipants = 0;
   let room = new Room();
   app.use(express.static(Path.join(__dirname, path)));
   app.use(morgan('combined'));

   io.on('connection', (socket) => {
      socket.on('connect-user', function (data) {
         socket.username = data.pseudo;
         socket.skin = data.skin;
         //TODO check if the user isn't already connected
         world.spawnPlayer(socket ,'test');
      });
      console.log('client connected');
      nbParticipants++;
      socket.nbParticipants = nbParticipants;

      world.spawnPlayer(socket ,'test');

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
         socket.broadcast.emit('user disconnected');
   });

   });

   server.listen(port, callback);
}


startServer(3000, '../../client/build', () => console.log('Server started'));