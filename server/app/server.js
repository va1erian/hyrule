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
    .push('map-mmoz', 'data/map.json')
    .then(main);

function main(assets) {
    console.log('MMOZ server!')
    initWorld(assets);
    startServer(3000, '../../client/build', () => console.log('Server started'));
    tick();
}

function initWorld(assets) {
    const mapMmoz = assets.get('map-mmoz');

    let tileset = new TileSet(103, mapMmoz.tilesets[0].tileheight, mapMmoz.tilesets[0].tilewidth); //114 tiles in tileset
    let worldTileProps = tileset.makeTileProps();
    worldTileProps[7] |= TileType.TILE_WALKABLE; // old: 6
    worldTileProps[45] |= TileType.TILE_WALKABLE; // old: 44
    worldTileProps[46] |= TileType.TILE_WALKABLE; // old: 45
    let tilemap = new TileMap(mapMmoz.width, mapMmoz.height, mapMmoz.layers[0].data, tileset);
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

