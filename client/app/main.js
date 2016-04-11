/* global io */
'use strict';

import { ViewPort } from 'gfx/viewport';
import { TileSet, TileMap, TileType } from 'gfx/tiles';
import { WorldState } from 'world/state';
import { Moblin, Player, KeyboardController } from 'world/actor';
import { Rectangle, Renderer } from 'gfx/utils';
import { GameLoop } from 'tools/loop';
import { TheAssetManager } from 'tools/assets';
import { TheInput, Keys } from 'tools/input';
import { PlayerCamera } from 'world/camera';

var loop = new GameLoop();

TheAssetManager.push('map-overworld', 'data/overworld.map')
   .push('tileset-overworld', 'img/overworld.gif')
   .push('sprite-link', 'img/link.png')
   .push('sprite-moblin', 'img/moblin.png')
   .then(init);

let socket = io.connect();
let FADE_TIME = 130;

function sendMessage () {
   var message = $('.inputMessage').val();
   if (message) {
      $('.inputMessage').val('');
      addChatMessage({
         username: "izi ouzo",
         message: message
      });

      socket.emit('chat message', message);
   }
}

function addChatMessage (data, options) {

   $('.messages').append($('<li>').text(data.message));
}

function addNewParticipantsMessage (data) {
   var message = '';
   if (data.nbParticipants === 1) {
      message += "there's 1 participant";
   } else {
      message += "there are " + data.nbParticipants + " participants";
   }
   logInfo(message);
}

function logInfo (message, options) {
    var $el = $('<li>').addClass('logInfo').text(message);
    addMessageElement($el, options);
}

function addMessageElement (element, options) {
    var $el = $(element);

    if (!options) {
        options = {};
    }
    if (typeof options.fade === 'undefined') {
        options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
        options.prepend = false;
    }

    if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
        $(messages).prepend($el);
    } else {
        $('.messages').append($el);
    }
    $('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
}


$(window).keypress(function(e) {
    if(e.which == 13) {
        sendMessage();
    }
});

socket.on('chat message', function (data) {
    addChatMessage(data);
});

socket.on('user joined', function (data) {
    console.log('joined');
    logInfo(data.username + ' joined');
    addNewParticipantsMessage(data);
});

socket.on('disconnect', function (data) {
    console.log('disconnected');
});

function init(assets) {
   let tileset = new TileSet(assets.get('tileset-overworld'), 16,16);
   let worldTileProps = tileset.makeTileProps();

   worldTileProps[6]  |= TileType.TILE_WALKABLE;
   worldTileProps[44] |= TileType.TILE_WALKABLE;
   worldTileProps[45] |= TileType.TILE_WALKABLE;

   let tilemap = new TileMap(256,84, assets.get('map-overworld'), tileset);
   tilemap.tileProps = worldTileProps;
   var world = new WorldState();

   world.layers.push([tilemap, tileset]);

   let player = new Player(world, new KeyboardController(socket));

   do {
      player.x = Math.random() * 4000 | 0;
      player.y = Math.random() * 1400 | 0;
   } while(tilemap.isColliding(player));

   world.actors.push(player);

   for(var i = 0; i < 800; i++) {
      let mob =  new Moblin(world);

      do {
         mob.x = Math.random() * 4000 | 0;
         mob.y = Math.random() * 1400 | 0;
      } while(tilemap.isColliding(mob));

      world.actors.push(mob);
   }

   const viewport = new ViewPort(world, new Rectangle (0, 0, 256, 224));
   const cam = new PlayerCamera(viewport, player);
   loop.add(world);
   loop.add(cam);
   loop.add(new Renderer(viewport));

   socket.on('player-join', () => console.log('zob'));

   loop.start();
}


