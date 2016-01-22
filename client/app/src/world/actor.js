
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
   constructor(sprite, world) {
      this.sprites = [sprite];
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
      this.layer = 0;
      this.xMom = 0;
      this.yMom = 0;
      this.world = world;
   }
   
   get currentLayer() {
      return this.world.layers[this.layer];
   }
   
   update(dt) { 
      for(const sprite of this.sprites) sprite.update(dt);
      
      const nextX = this.x + (this.xMom === 0 ? 0 : this.xMom * dt);
      const nextY = this.y + (this.yMom === 0 ? 0 : this.yMom * dt);
     
      if(this.currentLayer[0].isColliding(new Rectangle(nextX,nextY, this.w, this.h))) {
         this.colliding(nextX,nextY);
      } else {
         this.x = nextX;
         this.y = nextY;
      }
   }  
   
   colliding(x,y) {
      console.log('fail');
   }
   
   
   paint(ctx, x, y) {
      for(const sprite of this.sprites) sprite.paint(ctx, Math.round(this.x) - x, Math.round(this.y) - y);
   } 
}



export class Player extends Actor {
   constructor(world) {
      const sheet = TheAssetManager.get('sprite-link');
      const tileset = new TileSet(sheet, 16, 16);      
      super(new Sprite([tileset]),world);
      this.w = 16;
      this.h = 16;
      this.direction = Direction.NORTH;
      
      var dirChange = function() {
         this.direction = Math.floor(Math.random() * 4);
         setTimeout(dirChange, Math.floor(Math.random() * 1000) + 1000);
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
   
   colliding(x,y) {
         this.direction = Math.floor(Math.random() * 4);
   }
   
}