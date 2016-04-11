
import {Rectangle} from 'gfx/utils';
import {TheAssetManager} from 'tools/assets';
import {TileSet} from 'gfx/tiles';
import {Sprite} from 'gfx/sprite';

let uuid = require('node-uuid');

var Direction = {
   NORTH : 0,
   EAST: 1,
   SOUTH: 2,
   WEST: 3
};

export class Actor {
   constructor(sprite, world) {
      this.uuid = uuid.v1();
      this.sprites = [sprite];
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
      this.layer = 0;
      this.xMom = 0;
      this.yMom = 0;
      this.world = world;
      this.changed = true;
   }
   
   get currentLayer() {
      return this.world.layers[this.layer];
   }
   
   update(dt) {
      const nextX = this.x + (this.xMom === 0 ? 0 : this.xMom * dt);
      const nextY = this.y + (this.yMom === 0 ? 0 : this.yMom * dt);
     
      //if(this.currentLayer[0].isColliding(new Rectangle(nextX,nextY, this.w, this.h))) {
         //this.colliding(nextX,nextY);
      //} else {
         this.x = nextX;
         this.y = nextY;
      //}
   }

   setState(state) {
      this.dir = state.dir;
      if(!state.moving) {
         this.xMom = 0;
         this.yMom = 0;
         return;
      }

      switch(state.dir) {
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
   }
   
   colliding(x,y) {
   }
   
   
   paint(ctx, x, y) {
      for(const sprite of this.sprites) sprite.paint(ctx, Math.round(this.x) - x, Math.round(this.y) - y);
   } 
}

export class Moblin extends Actor {
   constructor(world) {
      const sheet = TheAssetManager.get('sprite-moblin');
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
