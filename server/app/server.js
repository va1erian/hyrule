
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
      this.username = "";
      this.skin = "";
      if(!this.socket === undefined) {
         this.username = this.socket.username;
         this.skin = this.socket.skin;
      }
   }
}

class Room {
   constructor(id) {
      this.id = id;
      this.players = [];
      this.npcs    = [];
   }
   
   addPlayer(player) {
      if(!this.isUsernameAlreadyUsed(player.username)) {
         this.players.push(player);
         player.socket.join(this.id);
         player.socket.on('player-act', msg => this.onPlayerAct(player, msg));
         io.to(this.id).emit('player-join');
         return true;
      }
      else {
         return false;
      }
   }
   
   onPlayerAct(player, msg) {
      console.log(msg);
   }

   isUsernameAlreadyUsed(playerUsername) {
      console.log(playerUsername);
      for(let i = 0; i < this.players.length; i++) {
         console.log(this.players[i].username);
         if(this.players[i].username === playerUsername) {
            return true;
         }
      }
      return false;
   }

}

class WorldState {
   constructor() {
      this.rooms   = new Map();
      this.rooms.set('test', new Room('test'));
   }
   
   spawnPlayer(socket, room) {
      let player = new Player(socket);
      return this.rooms.get(room).addPlayer(player);
   }
}

function startServer(port, path, callback) {
   
   let world = new WorldState();
   let nbParticipants = 0;
   app.use(express.static(Path.join(__dirname, path)));
   app.use(morgan('combined'));

   io.on('connection', (socket) => {
      socket.on('connect-user', function (data) {
         socket.username = data.username;
         socket.skin = data.skin;
         let result = world.spawnPlayer(socket ,'test');
         console.log(result);
         socket.emit('is-user-connected', result);
         result ? console.log('client ' + data.username + ' already connected') :  console.log('client ' + data.username + ' connected');
      });

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