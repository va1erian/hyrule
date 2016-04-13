
import {Rectangle} from 'gfx/utils';
import {TheAssetManager} from 'tools/assets';
import {TileSet} from 'gfx/tiles';

let uuid = require('node-uuid');

var Direction = {
   NORTH : 0,
   EAST: 1,
   SOUTH: 2,
   WEST: 3
};

export class Actor {
   constructor(world) {
      this.uuid = uuid.v1();
      this.x = 0;
      this.y = 0;
      this.dir = Direction.NORTH;

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
   
   get isPlayer() {
      return this.socket !== undefined;
   }
   
   update(dt) {
      const nextX = this.x + (this.xMom === 0 ? 0 : this.xMom * dt);
      const nextY = this.y + (this.yMom === 0 ? 0 : this.yMom * dt);
     
      //if(this.currentLayer[0].isColliding(new Rectangle(nextX,nextY, this.w, this.h))) {
         this.colliding(nextX,nextY);
      //} else {
         this.x = nextX;
         this.y = nextY;
      //}
   }

   colliding(x,y) { }
   
   toJSON() {
      return {
         uuid : this.uuid, x: this.x, y: this.y, 
         dir : this.dir, changed : this.changed,
         moving: (this.xMom !== 0 || this.yMom !== 0),
         color: this.color
      };
   }
}

export class PlayerActor extends Actor {
   constructor(socket,world) {
      super(world);
      this.socket = socket;
      this.color = "";
      this.active = true;
   }
   
   setState(state) {
      if(!state.moving) {
         this.xMom = 0;
         this.yMom = 0;
         return;
      }
      this.dir = state.dir;


      switch(state.dir) {
         case Direction.NORTH:
            this.yMom = -50;
            this.xMom = 0;
            break;
         case Direction.SOUTH:
            this.yMom = 50;
            this.xMom = 0;
            break;
         case Direction.WEST:
            this.xMom = -50;
            this.yMom = 0;
            break;
         case Direction.EAST:
            this.xMom = 50;
            this.yMom = 0;
            break;
      }
   }
}

export class Moblin extends Actor {
   constructor(world) {
      super(world);
      const tileset = new TileSet(sheet, 16, 16);      
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
