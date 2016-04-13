/* global io */
'use strict';

import { ViewPort } from 'gfx/viewport';
import { TileSet, TileMap, TileType } from 'gfx/tiles';
import { TheWorldState } from 'world/state';
import { Moblin, Player, KeyboardController } from 'world/actor';
import { Rectangle, Renderer } from 'gfx/utils';
import { GameLoop } from 'tools/loop';
import { TheAssetManager } from 'tools/assets';
import { TheInput, Keys } from 'tools/input';
import { PlayerCamera } from 'world/camera';
import { SkinColor } from 'tools/SkinColor';

$(document).ready(function() {
    let skinImg = document.getElementById('skinImg');
    let colorPicker = document.getElementById('color');
    
    // Live skin color edition
    let skinColor = new SkinColor(skinImg);
    // Listener on input color tag
    colorPicker.addEventListener("input", function() {
        skinImg.src = skinColor.changeColor(colorPicker.value);
    }, false);
});

var loop = new GameLoop();

TheAssetManager.push('map-overworld', 'data/overworld.map')
    .push('map-mmoz', 'data/map.json')
   .push('tileset-overworld', 'img/overworld.gif')
   .push('sprite-link', 'img/link.png')
   .push('sprite-moblin', 'img/moblin.png')
   .then(init);

let socket = io.connect();
let FADE_TIME = 130;
let username;
let skin;

function sendMessage () {
   var message = $('.inputMessage').val();
   if (message) {
      $('.inputMessage').val('');
      addChatMessage({
         username: (username) ? username : "User",
         message: message
      });

      socket.emit('chat message', message);
   }
}

function addChatMessage (data, options) {
    options = options || {};

    var $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css('color', (data.skin) ? data.skin : skin);
    var $messageBodyDiv = $('<span class="messageBody">')
        .text(data.message);

    var $messageDiv = $('<li class="message"/>')
        .data('username', data.username)
        .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
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
        $('.messages').prepend($el);
    } else {
        $('.messages').append($el);
    }
    $('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
}



function checkInputs(username, skin) {
   if(username === undefined || username.trim() === "") {
      return false;
   }
   if(skin === undefined) {
       return false;
   }
   return true;
}

function getValidInputs() {
   username = $('#username').val();
   skin = $('#color').val();
   if(!checkInputs(username, skin)) {
      alert('Veuillez saisir un pseudo et un skin valide ');
      return;
   }
   let inputs = {"username" : username, "skin" : skin};
   return inputs;
}

function connectUser() {
   let inputs = getValidInputs();
   if(inputs === undefined) {
      return;
   }
   socket.emit('connect-user', inputs);
}

function isUserConnected(data) {
    if(data) {
        $('#signin').css('display', 'none');
        $('#game').css('display', 'block');
    } else {
        alert("Nom d'utilisateur déjà utilisé");
    }
}


$(window).keypress(function(e) {
    if(e.which == 13) {
       connectUser();
       sendMessage();
    }
});

socket.on('is-user-connected', function (data) {
    isUserConnected(data);
});

socket.on('chat message', function (data) {
    console.log("chat:", data);
    addChatMessage(data);
});

socket.on('user joined', function (data) {
    logInfo(data.username + ' joined');
    addNewParticipantsMessage(data);
});

socket.on('user disconnected', function (data) {
    logInfo(data.username + ' left');
    addNewParticipantsMessage(data);
});

function init(assets) {
    const mapMmoz = assets.get('map-mmoz');
    
    let tileset = new TileSet(assets.get('tileset-overworld'), mapMmoz.tilesets[0].tileheight, mapMmoz.tilesets[0].tilewidth);
    let worldTileProps = tileset.makeTileProps();

    let tilemap = new TileMap(mapMmoz.width, mapMmoz.height, mapMmoz.layers[0].data, tileset);
    tilemap.tileProps = worldTileProps;

    TheWorldState.layers.push([tilemap, tileset]);

    socket.on('player-join', (el) => TheWorldState.setActorList(el));
    socket.on('player-update', (el) => TheWorldState.refreshActor(el));
    socket.on('player-welcome', (el) => {
        TheWorldState.playerUUID = el;
        const controller = new KeyboardController(socket);
        const viewport = new ViewPort(TheWorldState, new Rectangle(0, 0, 256, 224));

        const cam = new PlayerCamera(viewport, TheWorldState.localPlayer);
        loop.add(TheWorldState);
        loop.add(controller);
        loop.add(cam);
        loop.add(new Renderer(viewport));
    });
    loop.start();
}


