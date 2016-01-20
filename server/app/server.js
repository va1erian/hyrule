
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

function startServer(port, path, callback) {

   app.use(express.static(Path.join(__dirname, path)));
   app.use(morgan('combined'));
   
   io.on('connection', function(socket) {
      console.log('client connected');
   });

   server.listen(port, callback);
}

startServer(3000, '../../client/build', () => console.log('Server started'));