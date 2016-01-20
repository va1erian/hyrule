
import {Rectangle} from 'src/gfx/utils';
import {TheAssetManager} from 'src/tools/assets';
import {TileSet} from 'src/gfx/tiles';
import {Sprite} from 'src/gfx/sprite';

var Direction = {
   NORTH : 0,
   EAST: 1,
   SOUTH: 2,
   WEST: 3
};

export class Actor {
   constructor(sprite) {
      this.sprites = [sprite];
      this.bbox = new Rectangle();
      this.x = 0;
      this.y = 0;
      this.xMom = 0;
      this.yMom = 0;
   }
   
   update(dt) { 
      for(const sprite of this.sprites) sprite.update(dt);
      
      const nextX = this.x + (this.xMom === 0 ? 0 : this.xMom * dt);
      const nextY = this.y + (this.yMom === 0 ? 0 : this.yMom * dt);
      this.x = nextX;
      this.y = nextY;
   }  
   
   paint(ctx, x, y) {
      for(const sprite of this.sprites) sprite.paint(ctx, Math.round(this.x) - x, Math.round(this.y) - y);
   } 
}



export class Player extends Actor {
   constructor() {
      const sheet = TheAssetManager.get('sprite-link');
      const tileset = new TileSet(sheet, 16, 16);      
      super(new Sprite([tileset]));
      this.bbox.w = 16;
      this.bbox.h = 16;
      this.direction = Direction.NORTH;
      
      var dirChange = function() {
         this.direction = Math.floor(Math.random() * 4);
         setTimeout(dirChange, Math.floor(Math.random() * 1000));
      }.bind(this);
      
      dirChange();
   }
   
   update(dt) {
      this.sprites[0].currentAnimation = this.direction;
      switch(this.direction) {
         case Direction.NORTH:
         this.yMom = -30;
         this.xMom = 0;
         break;
         case Direction.SOUTH:
         this.yMom = 30;
         this.xMom = 0;
         break;
         case Direction.WEST:
         this.xMom = -30;
         this.yMom = 0;
         break;
         case Direction.EAST:
         this.xMom = 30;
         this.yMom = 0;
         break;
      }
      

      super.update(dt);
   }
   
}