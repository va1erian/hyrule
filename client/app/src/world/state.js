

export class WorldState {
   constructor() {
      this.layers = [];
      this.actors = [];
      this.worldSector = 0;
      this.subSector   = 0;
   }
   
   update(dt) {
      for(const actor of this.actors) actor.update(dt);
   }
}