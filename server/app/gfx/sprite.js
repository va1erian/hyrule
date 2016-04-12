export class Sprite {
   constructor(animations) {
      this.sheets = animations;
      this.currentSheet = this.sheets[0];
      this.currentAnimation = 0;

      this.maxFrame = this.sheets[0].h;
      this.currentFrame = 0;
      this.animSpeed = 0.2;
      this.timer = 0;

      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
      
      this.hsX = 0;
      this.hsY = 0;

   }
   
   
   update(dt) {
      this.timer += dt;
      if(this.timer >= this.animSpeed || this.timer < 0) {
         this.timer = 0;
         this.currentFrame = (this.currentFrame + 1) % this.maxFrame;

      }

   }
   
   paint(ctx, x, y) {
      const tileId = this.currentFrame * this.currentSheet.w + this.currentAnimation;
      this.currentSheet.paintTile(ctx, tileId, (x + this.x) | 0, (y + this.y) | 0 );
   }
}

class SpriteAnimation {
   constructor(frames) {
      this.frames = frames;
   }
}