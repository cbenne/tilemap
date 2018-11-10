/** @module Player
  * A class representing the player.
  */
export default class Player {
  /** @constructor
    * Constructs a new player instance
    * @param {float} x - the player's x position
    * @param {float} y - the player's y position
    * @param {float} height - the player's x position
    * @param {float} width - the player's y position
    */
  constructor(x, y, height, width) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.vy = 0;
    this.speed = 0.3;
    this.gravity = 0.5;
    this.jumping = false;
    this.spritesheet = new Image();
    this.spritesheet.src = "sprite.png";
    this.sprite = 5;
    this.animationlast = 0;
    this.newanimate = 50;
  }

  /** @method update
    * Updates the player
    * @param {double} deltaT - the elapsed time
    * @param {Input} input - the input object
    */
  update(deltaT, input, surroundings) {
    var actualspeed = this.speed*surroundings.slow;
    if(input.keyPressed("ArrowLeft")) {
      if (!surroundings.left) {
      this.x -= actualspeed * deltaT;
      }
      if (this.sprite != 3 && this.animationlast > this.newanimate) {
        this.sprite = 3;
        this.animationlast = 0;
      } else if (this.animationlast > this.newanimate){
        this.sprite = 2;
        this.animationlast = 0;
      }
    }
    else if(input.keyPressed("ArrowRight")) { 
      if (!surroundings.right) {
        this.x += actualspeed * deltaT;
      }
      if (this.sprite != 6 && this.animationlast > this.newanimate) {
        this.sprite = 6;
        this.animationlast = 0;
      } else if (this.animationlast > this.newanimate){
        this.sprite = 7;
        this.animationlast = 0;
      }
    } else {
        if (this.sprite < 5 && this.animationlast > this.newanimate) {
          this.sprite = 4;
          this.animationlast = 0;
        } else if (this.animationlast > this.newanimate){
          this.sprite = 5;
          this.animationlast = 0;
        }
    }
    if (surroundings.down) {
      this.jumping = false;
      this.y = Math.floor(this.y/surroundings.tileh)*surroundings.tileh;
    }
    if (surroundings.left) {
      this.x = Math.ceil(this.x/surroundings.tilew)*surroundings.tilew +1;
    }
    if (surroundings.up) {
      this.y = Math.ceil(this.y/surroundings.tileh)*surroundings.tileh;
    }
    if (surroundings.right) {
      this.x = Math.floor(this.x/surroundings.tilew)*surroundings.tilew -1;
    }
    if(!(this.jumping) && (input.keyDown(" ") || input.keyDown("ArrowUp"))) {
      this.jumping = true;
      this.vy = -5;
    }
    
    if(this.jumping) {
      if (this.sprite < 5) {
        this.sprite = 1;
      } else {
        this.sprite = 8;
      }
    }
    this.vy = Math.min(this.vy + this.gravity,3);
    if ((this.vy > 0 && !surroundings.down) || (this.vy < 0 && !surroundings.up)) {
      this.y += this.vy * actualspeed * deltaT;
    }
    
    
    this.animationlast += deltaT;
  }

  get_position() {
    return {
      x : this.x,
      y : this.y
    }
  }
  /** @method render
    * Renders the player
    * @param {double} deltaT - elapsed time
    * @param {Context2D} context - the rendering context
    */
  render(deltaT, context, offsetx,offsety) {
    context.fillStyle = "blue";
    context.beginPath();
    context.drawImage(this.spritesheet,(this.sprite%5)* 32, (Math.floor(this.sprite/5))*32,32,32,this.x-offsetx,this.y-offsety,32,32);
    //context.arc(this.x - offsetx, this.y - offsety, this.width, 0, 2*Math.PI);
    context.fill();
  }

}
