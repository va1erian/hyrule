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
    worldTileProps[6] |= TileType.TILE_WALKABLE;
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
        let userAdded = false;
        console.log('client connected : ', socket.handshake.address);

        socket.on('connect-user', function (data) {
            if(userAdded) return;
            if (!(data.username === undefined) && !(data.skin === undefined)) {
                console.log("uA.connect-user", userAdded);
                socket.username = data.username;
                socket.skin = data.skin;
                TheWorldState.spawnPlayer(socket);
                userAdded = true;
                socket.emit('is-user-connected', true);
                
                nbParticipants++;
                socket.nbParticipants = nbParticipants;

                console.log("uA.user-joined", userAdded);
                socket.broadcast.emit('user joined', {
                    username: "Thug", // TODO: use real username
                    nbParticipants: nbParticipants
                });
            }
        });

        socket.on('chat message', function (data) {
            console.log("uA.chat-msg", userAdded);
            if (userAdded) {
                console.log('new message:' + data);
                socket.broadcast.emit('chat message', {
                    username: "Thug",
                    message: data
                });
            }
        });

        socket.on('disconnect', function (data) {
            if (userAdded) {
                console.log('user ' + socket.username + ' disconnected');
                nbParticipants--; // FIXME: do not decrement if zero
                console.log('client disconnected : ', socket.handshake.address);
                console.log('TODO remove from WorldState');
                let disconnectedActor = TheWorldState.rooms.get("overworld").playerBySocket(socket)
                if (disconnectedActor) {
                    disconnectedActor.active = false;
                    //TheWorldState.rooms.get("overworld").removePlayer(disconnectedActor);
                }
                socket.broadcast.emit('user disconnected', {
                    username: "Anonymous", //replace with socket.username
                    nbParticipants: nbParticipants
                });
            }
        });
    });

    server.listen(port, callback);
}

function tick() {
    TheWorldState.update(1 / 60);
    setTimeout(tick, 17);
}