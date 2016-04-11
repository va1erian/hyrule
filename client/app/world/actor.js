
import {Rectangle} from 'gfx/utils';
import {TheAssetManager} from 'tools/assets';
import {TileSet} from 'gfx/tiles';
import {Sprite} from 'gfx/sprite';
import {TheInput, Keys} from 'tools/input';

var Direction = {
   NORTH : 0,
   EAST: 1,
   SOUTH: 2,
   WEST: 3
};

export class Actor {
   constructor(sprite, world) {
      this.sprites = [sprite];
      this.offX = 0;
      this.offY = 0;
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
      this.layer = 0;

      this.world = world;
   }
   
   get currentLayer() {
      return this.world.layers[this.layer];
   }
   
   update(dt) { 
      for(const sprite of this.sprites) sprite.update(dt);
      
      const nextX = this.x + (this.xMom === 0 ? 0 : this.xMom * dt);
      const nextY = this.y + (this.yMom === 0 ? 0 : this.yMom * dt);
     
      if(this.currentLayer[0].isColliding(
            new Rectangle(nextX  ,nextY , this.w, this.h, this.offX, this.offY))) {
         this.colliding(nextX,nextY);
      } else {
         this.x = nextX;
         this.y = nextY;
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
      this.offY = 8;
      this.offX = 2;
      this.w = 14;
      this.h = 8;
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

export class Player extends Actor {
   constructor(world, controller) {
      const sheet = TheAssetManager.get('sprite-link');
      const tileset = new TileSet(sheet, 16, 16);      
      super(new Sprite([tileset]),world);
      this.offY = 8;
      this.offX = 2;
      this.w = 14;
      this.h = 8;
      
      this.controller = controller;
      this.controller.actor = this;
      this.direction = Direction.NORTH;
   }
   
   update(dt) {
      this.controller.update(dt);
      this.sprites[0].currentAnimation = this.direction;
      super.update(dt);
   }
}

class MovementState {
   constructor() {
      this.moving    = false;
      this.attacking = false;
      this.dir    = Direction.NORTH;
   }
   
   equals(obj) {
      return this.moving === obj.moving &&
         this.attacking === obj.attacking &&
         this.dir === obj.dir;
   }
}

export class KeyboardController {
   constructor(socket) {
      this.socket = socket;
      this.oldState = new MovementState();
   }
   
   update(dt) {
      let moving = true;

      if(TheInput.pressed(Keys.RIGHT)) {
         this.actor.direction = Direction.EAST;
      } else if(TheInput.pressed(Keys.LEFT)) {
         this.actor.direction = Direction.WEST;
      }else if(TheInput.pressed(Keys.UP)) {
         this.actor.direction = Direction.NORTH;
      } else if(TheInput.pressed(Keys.DOWN)) {
         this.actor.direction = Direction.SOUTH;
      } else {
         moving = false;
      }

      const newState = new MovementState();
      newState.dir = this.actor.direction;
      newState.moving = moving;

      if(!this.oldState.equals(newState)) {
         this.socket.emit('player-act', newState);
         this.oldState = newState;
      }
   }
}