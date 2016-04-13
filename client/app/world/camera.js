import {TheInput, Keys} from 'tools/input';
import {clamp} from 'gfx/utils';

export class FreeCamera {
   constructor(viewport) {
      this.viewport = viewport;
      this.xMom = 0;
      this.yMom = 0;
   }
   
   update(dt) {
      const nextX = this.viewport.metrics.x + (this.xMom === 0 ? 0 : this.xMom * dt);
      const nextY = this.viewport.metrics.y + (this.yMom === 0 ? 0 : this.yMom * dt);
      this.viewport.metrics.x = nextX;
      this.viewport.metrics.y = nextY;
      
      if(TheInput.pressed(Keys.RIGHT)) {
         this.xMom = 200; 
      } else if(TheInput.pressed(Keys.LEFT)) {
         this.xMom = -200; 
      }
      
      if(TheInput.pressed(Keys.UP)) {
         this.yMom = -200;
      } else if(TheInput.pressed(Keys.DOWN)) {
         this.yMom = 200;
      }
      this.xMom *= 0.95;
      this.yMom *= 0.95;   
   }
}

export class PlayerCamera {
   constructor(viewport, actor) {
      this.viewport = viewport;
      this.actor = actor;
      
      const worldLayer = actor.world.layers[0][0]; 
      this.xMax = (worldLayer.w * worldLayer.tileset.tileW) - viewport.metrics.w;
      this.yMax = (worldLayer.h * worldLayer.tileset.tileH) - viewport.metrics.h ;
   }
   
   update(dt) {
      this.viewport.metrics.x = clamp(0,this.actor.x - this.viewport.metrics.w / 2, this.xMax);
      this.viewport.metrics.y = clamp(0,this.actor.y - this.viewport.metrics.h / 2, this.yMax);
   }
}