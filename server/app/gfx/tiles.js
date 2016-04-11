'use strict';

import {Rectangle} from 'gfx/utils';

export class TileSet {
   constructor(count, tileH = 16, tileW = 16, padding = 0) {
      this.tileH = tileH;
      this.tileW = tileW;
      this.count = count;
      this.padding = padding;
   }   
   
   makeTileProps() {
      return new Uint16Array(this.count);
   }
   
}

export const TileType = {
   TILE_WALKABLE : 1 << 0
}

export class TileMap {
   constructor(w, h, array, tileset) {
      this.w = w;
      this.h = h;
      this.array = array;   
      this.tileset = tileset;   
      this.tileProps = [];
   }  
   
   isRectOnTileFlag(rect, flag) {
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
}