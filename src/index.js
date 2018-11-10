import Game from './game';
import Player from './player';

// Create the game
var game = new Game(1024, 768,{
    fastmap: "mapfast.png",
    onload: function() {
        game.addEntity(new Player(900, 180, 32, 32));
        game.loop();
    }
  });

// Create the player and add it to the game


// Start the main game loop

