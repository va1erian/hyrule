import { Actor, Player } from 'world/actor';

class WorldState {
   constructor() {
      this.layers = [];
      this.actors = new Map();
      this.worldSector = 0;
      this.subSector   = 0;
   }
   
   update(dt) {
      for(const actor of this.actors.values()) actor.update(dt);
   }

   setActorList(room) {
      for(let i of room.actors) {
         let actor = new Player(i.actor.uuid,TheWorldState);
         actor.setState(i.actor);
         this.actors.set(actor.uuid, actor);
      }
   }

   updateActor(msg) {
      let actor = this.actors.get(msg.actor.uuid);
      actor.setState(msg.actor);
   }
}

export var TheWorldState = new WorldState();
