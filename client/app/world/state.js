import { Actor, Player } from 'world/actor';

class WorldState {
   constructor() {
      this.layers = [];
      this.playerUUID = undefined;
      this.actors = new Map();
      this.worldSector = 0;
      this.subSector   = 0;
   }
   
   update(dt) {
      for(const actor of this.actors.values()) actor.update(dt);
   }

   setActorList(room) {
      this.actors.clear();
      for(let i of room.actors) {
         let actor = new Player(i.uuid, i.color, TheWorldState);
         actor.setState(i);
         this.actors.set(actor.uuid, actor);
      }
   }

   refreshActor(msg) {
      let actor = this.actors.get(msg.uuid);
      actor.setState(msg);
   }
   
   get localPlayer() {
      return this.actors.get(this.playerUUID);
   }
}

export var TheWorldState = new WorldState();
