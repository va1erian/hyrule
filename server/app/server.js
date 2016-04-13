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

const DEFAULT_ROOM = TheWorldState.rooms.get("overworld");

function startServer(port, path, callback) {
    app.use(express.static(Path.join(__dirname, path)));
    app.use(morgan('combined'));

    io.on('connection', (socket) => {
        let userAdded = false;
        console.log('client connected : ', socket.handshake.address);

        socket.on('connect-user', function (data) {
            if(userAdded) return;
            if (!(data.username === undefined) && !(data.skin === undefined)) {
                let player = TheWorldState.spawnPlayer(socket, data.skin, data.username);

                userAdded = true;
                socket.emit('is-user-connected', true);

                socket.broadcast.emit('user joined', {
                    username: DEFAULT_ROOM.playerBySocket(socket).username,
                    nbParticipants: DEFAULT_ROOM.nbPlayers
                });
            }
        });

        socket.on('chat message', function (data) {
            //console.log("uA.chat-msg", userAdded);
            if (userAdded) {
                //console.log('new message:' + data);
                socket.broadcast.emit('chat message', {
                    username: DEFAULT_ROOM.playerBySocket(socket).username,
                    skin: DEFAULT_ROOM.playerBySocket(socket).color,
                    message: data
                });
            }
        });

        socket.on('disconnect', function (data) {
            const room = TheWorldState.rooms.get("overworld");
            if (userAdded) {
                console.log('user ' + socket.username + ' disconnected');
                console.log('client disconnected : ', socket.handshake.address);
                console.log('TODO remove from WorldState');
                let disconnectedActor = DEFAULT_ROOM.playerBySocket(socket);
                if (disconnectedActor) {
                    disconnectedActor.active = false;
                }
                socket.broadcast.emit('user disconnected', {
                    username: disconnectedActor.username, //replace with socket.username
                    nbParticipants: DEFAULT_ROOM.nbPlayers
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