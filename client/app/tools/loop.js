'use strict';

export class GameLoop {

  constructor() {
    this._idRAF = -1;
    this._count = 0;

    this.oldTime  = 0;
    this.time     = 0;
    this._listeners = [];

    this._binds = {};
    this._binds.update = this._update.bind( this );
  }

  _update(time) {
    this.oldTime = this.time;
    this.time = time == undefined ? new Date().getTime() : time;
    
    let listener = null;
    let i = this._count;
    while( --i >= 0 ) {
      listener = this._listeners[ i ];
      if( listener ) {
        listener.apply( this, [(this.time - this.oldTime) / 1000] );
      }
    }
    this._idRAF = requestAnimationFrame( this._binds.update );
  }

  start() {
    this._update();
  }

  stop() {
    cancelAnimationFrame( this._idRAF );
  }

  add( listener ) {
    if(listener.update == undefined) {
       throw new Error("object has no update method");
    }
    const cb = listener.update.bind(listener);
    const idx = this._listeners.indexOf( cb );
    if( idx >= 0 ) {
      return;
    }
    this._listeners.push(cb );
    this._count++;
  }

  remove( listener ) {
    if(listener.update == undefined) {
       throw new Error("object has no update method");
    }
    const cb = listener.update.bind(listener);
    const idx = this._listeners.indexOf( cb );
    if( idx >= 0 ) {
      return;
    }
    
    this._listeners.splice( idx, 1 );
    this._count--;
  }
}