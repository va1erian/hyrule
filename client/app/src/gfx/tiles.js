'use strict';

import {Rectangle} from 'src/gfx/utils';

export class TileSet {
   constructor(pic, tileH, tileW, padding = 0) {
      this.pic = pic;
      this.tileH = tileH;
      this.tileW = tileW;
      this.h = pic.naturalHeight / tileH;
      this.w = pic.naturalWidth / tileW;
      this.padding = padding;
   }   
   
   paintTile(ctx, tile, x, y) {
      const tileX = tile % this.w;
      const tileY = Math.floor( tile / this.w);
      const xClip = tileX * (this.tileW + this.padding);
      const yClip = tileY * (this.tileH + this.padding);

      ctx.drawImage(this.pic, xClip, yClip, 
         this.tileW, this.tileH, x, y,
         this.tileW, this.tileH);      
   }
   
   makeTileProps() {
      return new Uint16Array(this.w * this.h);
   }
   
}

export const TileType = {
   TILE_WALKABLE : 1 << 0
}

export class TileMap {
   constructor(w, h, array, tileset) {
      this.w = w;
      this.h = h;
      this.array = new Int16Array(array);   
      this.tileset = tileset;   
      this.tileProps = [];

   }  
   
   isRectOnTileFlag(rect,flag) {
      return this.tileHasFlag(this.getTileAtPos(rect.x, rect.y), flag) 
         && this.tileHasFlag(this.getTileAtPos(rect.x + rect.w, rect.y),flag)
         && this.tileHasFlag(this.getTileAtPos(rect.x + rect.w, rect.y + rect.h),flag)
         && this.tileHasFlag(this.getTileAtPos(rect.x, rect.y + rect.h),flag);
   }
   
   tileHasFlag(tile, flag) {
      return this.tileProps[tile] & flag;
   }
   
   isColliding(rect) {
      return !this.isRectOnTileFlag(rect, TileType.TILE_WALKABLE);
   }
   
   getTileAtPos(x, y) {
      x = Math.floor(x / this.tileset.tileW);
      y = Math.floor(y / this.tileset.tileH);
      return this.array[y * this.w + x];
   }
   
   paint(ctx, tset, x, y, clip) {   
      const clipX = (clip.x / tset.tileW) | 0;
      const clipY = (clip.y / tset.tileH) | 0;
      
      for(var i = clipX; i < clipX + Math.floor(clip.w / tset.tileW) + 1; ++i) {
         for(var j = clipY; j < clipY + Math.floor(clip.h / tset.tileH) + 1; ++j) {
            const tile = this.array[this.w * j + i];
            tset.paintTile(ctx, tile, (i * tset.tileW - clip.x + x) | 0, (j * tset.tileH - clip.y + y) | 0);
         }
      }
   }
}