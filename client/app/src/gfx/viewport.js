import { Rectangle } from 'src/gfx/utils';

export class ViewPort {
   constructor(world, metrics = new Rectangle()) {
      this.world = world;
      this.metrics = metrics;
   }
   
   paint(ctx, x = 0, y = 0) {
      for(let [tmap, tset] of this.world.layers) {
         tmap.paint(ctx,tset,x,y,this.metrics);
      }
      
      for(let actor of this.world.actors) {
         actor.paint(ctx, this.metrics.x, this.metrics.y);
      }
   }
}