import Input from './input';
import tilemap from './tilemap';

/** @class Game
  * A class representing the high-level functionality
  * of a game - the game loop, buffer swapping, etc.
  */
export default class Game {
  /** @constructor
    * Creates the game instance
    * @param {integer} width - the width of the game screen in pixels
    * @param {integer} heght - the height of the game screen in pixels
    */
  constructor(width, height,options) {
    this._start = null;
    this.WIDTH = width;
    this.HEIGHT = height;
    this.input = new Input();
    this.entities = [];
    this.offsetx = 25;
    this.offsety = 5;
    this.scrollspeed = .01;
    // Set up the back buffer
    this.backBuffer = document.createElement('canvas');
    this.backBuffer.width = this.WIDTH;
    this.backBuffer.height = this.HEIGHT;
    this.backBufferCtx = this.backBuffer.getContext('2d');

    // Set up the screen buffer
    this.screenBuffer = document.createElement('canvas');
    this.screenBuffer.width = this.WIDTH;
    this.screenBuffer.height = this.HEIGHT;
    this.screenBufferCtx = this.screenBuffer.getContext('2d');
    document.body.append(this.screenBuffer);
    this.tilemapData = require('../res/mountain.json');
    this.tilemap = new tilemap(this.tilemapData,options);
  }


  /** @method addEntity
    * Adds an entity to the game world
    * Entities should have an update() and render()
    * method.
    * @param {Object} entity - the entity.
    */
  addEntity(entity) {
    this.entities.push(entity);
  }
  /** @method update
    * Updates the game state
    * @param {integer} elapsedTime - the number of milliseconds per frame
    */
  update(elapsedTime) {

    // Update game entitites
    this.entities.forEach(function(entity) 
      {
        var leftwall = false,
            rightwall = false,
            ground = false,
            ceil = false,
            slow = 1;
        var pos = entity.get_position();
        if (pos.x - this.offsetx*this.tilemapData.tilewidth < 300) {
          this.offsetx -= this.scrollspeed*elapsedTime;
        }
        if (pos.y - this.offsety*this.tilemapData.tileheight < 300) {
          this.offsety -= this.scrollspeed*elapsedTime;
        }
        if (this.offsetx*this.tilemapData.tilewidth + this.WIDTH - pos.x< 300) {
          this.offsetx += this.scrollspeed*elapsedTime;
        }
        if (this.offsety*this.tilemapData.tileheight + this.HEIGHT - pos.y< 300) {
          this.offsety += this.scrollspeed*elapsedTime;
        }
        var tiley = Math.floor(pos.y/this.tilemapData.tilewidth)
        var tilex = Math.floor(pos.x/this.tilemapData.tilewidth)
        var data = this.tilemap.tileAt(tilex,tiley,0)
        if (data) {
          if (data.solid) {
            ceil = true;
            leftwall = true;
          }
          if (data.slow) {
            slow = Math.min(slow,data.slow);
          }
        }
        data = this.tilemap.tileAt(tilex+1,tiley,0)
        if (data) {
          if (data.solid) {
            ceil = true;
            rightwall = true;
          }
          if (data.slow) {
            slow = Math.min(slow,data.slow);
          }
        }
        data = this.tilemap.tileAt(tilex,tiley+1,0)
        if (data) {
          if (data.solid) {
            ground = true;
          }
          if (data.slow) {
            slow = Math.min(slow,data.slow);
          }
        }
        data = this.tilemap.tileAt(tilex+1,tiley+1,0)
        if (data) {
          if (data.solid) {
            ground = true;
          }
          if (data.slow) {
            slow = Math.min(slow,data.slow);
          }
        }
        var surroundings = {
          left : leftwall,
          right : rightwall,
          up : ceil,
          down : ground,
          tilew : this.tilemapData.tilewidth,
          tileh : this.tilemapData.tileheight,
          slow : slow
        }
        entity.update(elapsedTime, this.input,surroundings)
      },this);

    // Swap input buffers
    this.input.update();
  }
  /** @method render
    * Renders the game state
    * @param {integer} elapsedTime - the number of milliseconds per frame
    */
  render(elapsedTime) {
    // Clear the back buffer
    this.backBufferCtx.fillStyle = "white";
    this.backBufferCtx.fillRect(0,0,this.WIDTH, this.HEIGHT);

    // TODO: Render game

    // Render entities
    this.tilemap.render(this.backBufferCtx,this.offsetx,this.offsety,1);
    this.entities.forEach(entity => entity.render(elapsedTime, this.backBufferCtx,this.offsetx*this.tilemapData.tilewidth,this.offsety*this.tilemapData.tilewidth));

    // Flip the back buffer
    this.screenBufferCtx.drawImage(this.backBuffer, 0, 0);
  }
  /** @method loop
    * Updates and renders the game,
    * and calls itself on the next draw cycle.
    * @param {DOMHighResTimestamp} timestamp - the current system time
    */
  loop(timestamp) {
    var elapsedTime = this._frame_start ? timestamp - this._frame_start : 0;
    this.update(elapsedTime);
    this.render(elapsedTime);
    this._frame_start = timestamp;
    window.requestAnimationFrame((timestamp) => {this.loop(timestamp)});
  }
}
