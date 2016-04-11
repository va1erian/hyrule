import {Actor} from 'world/actor';

class Player {
   // TODO : Completer la classe player
   /**
    * couleur, nom, coordonnées
    * @param socket
    */
   constructor(socket) {
      this.socket = socket;
      this.color = "green";
      this.actor = new Actor();
   }

   get stringified() {
      return JSON.stringify(this, (k, v) => {
             if(k === 'socket')
         return undefined;
      else
         return v;
      });
   }


   get id() {
      return this.actor.uuid;
   }
}


class Room {
   constructor(id) {
      this.id     = id;
      this.actors = [];
   }

   addPlayer(player) {
      this.actors.push(player);
      player.socket.join(this.id);
      player.socket.on('player-act', msg => this.onPlayerAct(msg, player));

      TheWorldState.io.to(this.id).emit('player-join', this.stringified);
   }

   onPlayerAct(msg, player) {
      console.log(msg);
      player.actor.setState(msg);
   }

   get stringified() {
      return JSON.stringify(this, (k,v) => {
         if(k === 'socket')
            return undefined;
         else
            return v;
      });
   }


   update(dt) {
      for(const player of this.actors) {
         player.actor.update(dt);

         if (player.actor.changed) {
            this.broadcastPlayerUpdate(player);
         }
      }
   }

   broadcastPlayerUpdate(player) {
      TheWorldState.io.to(this.id).emit('player-update', player.stringified);
   }
}

class WorldState {
   constructor() {
      this.layers = [];
      this.rooms  = new Map();
      this.rooms.set('test', new Room('test'));

   }

   spawnPlayer(socket) {
      let player = new Player(socket);
      this.rooms.get('test').addPlayer(player);
      return player;
   }

   update(dt) {
      for(const room of this.rooms.values()) room.update(dt);
   }
}

export const TheWorldState = new WorldState();
