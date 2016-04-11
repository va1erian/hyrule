
'use strict';

import "app-module-path/register";
import express from 'express';
import socketio from 'socket.io';
import morgan from 'morgan';
import http from 'http';
import Path from 'path';

import {Actor} from 'world/actor';
import {TheWorldState} from 'world/state';

var app = express();
var server = http.createServer(app);
var io = socketio().listen(server);

/* global __dirname */

TheWorldState.io = io;

function startServer(port, path, callback) {

   app.use(express.static(Path.join(__dirname, path)));
   app.use(morgan('combined'));
   
   io.on('connection', (socket) => {
       console.log('client connected : ' + socket.handshake.address);
       TheWorldState.spawnPlayer(socket);
   });

    server.listen(port, callback);
    update();
}

function update() {
    TheWorldState.update(1/60);
    setTimeout(update, 17);
}

startServer(3000, '../../client/build', () => console.log('Server started'));