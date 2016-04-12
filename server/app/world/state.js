import {PlayerActor} from 'world/actor';

class Room {
   constructor(id) {
      this.id     = id;
      this.actors = [];
   }

   addPlayer(player) {
      this.actors.push(player);
      player.socket.join(this.id);
      player.socket.on('player-act', msg => this.onPlayerAct(msg, player));
      TheWorldState.io.to(this.id).emit('player-join', this);
   }

   onPlayerAct(msg, player) {
      player.setState(msg);
   }
   
   update(dt) {
      for(const actor of this.actors) {
         actor.update(dt);
         
         if (actor.changed) {
            this.broadcastActorUpdate(actor);
         }
      }
   }

   broadcastActorUpdate(actor) {
      TheWorldState.io.to(this.id).emit('player-update', actor);
   }
}

class WorldState {
   constructor() {
      this.layers = [];
      this.rooms  = new Map();
      this.rooms.set('overworld', new Room('overworld'));
   }

   spawnPlayer(socket) {
      let player = new PlayerActor(socket, this);
      player.x = 1904;
      player.y = 1328;
      this.rooms.get('overworld').addPlayer(player);
      player.socket.emit('player-welcome', player.uuid);

      return player;
   }

   update(dt) {
      for(const room of this.rooms.values()) room.update(dt);
   }
}

export const TheWorldState = new WorldState();
