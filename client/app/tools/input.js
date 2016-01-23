
export const Keys = {
   LEFT : 37,
   UP: 38,
   RIGHT: 39,
   DOWN: 40,
   ATTACK: 90
}

class Input {
   constructor() {
      this._pressed = [];
      
      window.addEventListener('keyup', (e) => {
         e.preventDefault();
         delete this._pressed[e.keyCode];
      }, false)
      
      window.addEventListener('keydown', (e) => {
         e.preventDefault();
         this._pressed[e.keyCode] = true;
      }, false)
   }
   
   pressed(key) {
      return this._pressed[key];
   }
}

export let TheInput = new Input();