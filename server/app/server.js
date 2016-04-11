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
        this.players = new Map();
        this.npcs = [];
    }

    addPlayer(player) {
        if (player !== undefined && !this.isUsernameAlreadyUsed(player.socket.username)) {
            this.players.set(player.socket.username, player);
            player.socket.join(this.id);
            player.socket.on('player-act', msg => this.onPlayerAct(player, msg));
            io.to(this.id).emit('player-join');
            return true;
        } else {
            return false;
        }
    }

    onPlayerAct(player, msg) {
        console.log(msg);
    }

    isUsernameAlreadyUsed(playerUsername) {
        console.log("Try to connect with username:", playerUsername);
        return this.players.has(playerUsername);
    }

}

class WorldState {
    constructor() {
        this.rooms = new Map();
        this.rooms.set('test', new Room('test'));
    }

    spawnPlayer(socket, room) {
        socket.room = room;
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
        console.log("nouvelle connexion socket...");
        socket.on('connect-user', function (data) {
            if (!(data.username === undefined) && !(data.skin === undefined)) {
                socket.username = data.username;
                socket.skin = data.skin;
                let result = world.spawnPlayer(socket, 'test');
                console.log("Player added?", result);
                socket.emit('is-user-connected', result);
                result ? console.log('client ' + data.username + ' connected') : console.log('client ' + data.username + ' already connected');
            }
        });

        nbParticipants++;
        socket.nbParticipants = nbParticipants;
        console.log("nbParticipants:", socket.nbParticipants);

        // world.spawnPlayer(socket, 'test');

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
            nbParticipants--;
            console.log("disconnect:", socket.username);
            if (!(socket.username === undefined)) {
                world.rooms.get(socket.room).players.delete(socket.username);
                console.log('user ' + socket.username + ' disconnected');
                socket.broadcast.emit(socket.username + 'has disconnected');
            } else {
                console.log('Unknown user disconnected');
                socket.broadcast.emit('Unknown user has disconnected');
            }
        });

    });

    server.listen(port, callback);
}


startServer(3000, '../../client/build', () => console.log('Server started'));