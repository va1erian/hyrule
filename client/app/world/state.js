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

   setActorList(serverRoom) {
      //this.actors.clear();
      for(let i of this.actors.keys()) {
         let checkActor = this.actors.get(i);
         let findActor = false;
         for(let j of serverRoom.actors) {
            if (j.uuid === checkActor.uuid){
               findActor = true;
            }
         }
         if (findActor === false){
            this.actors.delete(i);
         }
      }

      for(let i of serverRoom.actors) {
         let actor = this.actors.get(i.uuid);
         if(actor !== undefined) {
            actor.setState(i);
         } else {
            let newActor = new Player(i.uuid, i.color, TheWorldState);
            newActor.setState(i);
            this.actors.set(i.uuid, newActor);
         }
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
