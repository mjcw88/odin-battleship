import "./styles.css";
// import { Game } from "./classes/game.js";
// import { Player } from "./classes/player.js";
// import { renderGameBoard } from "./initController.js";
// import { eventListeners } from "./eventsController.js";

import { renderNewGameForm } from "./initController.js";
import { eventListeners } from "./eventsController.js";

renderNewGameForm.init();
eventListeners.init();

// const game = new Game();
// const humanPlayer = new Player("Human", true);
// const cpuPlayer = new Player();
// game.players.push(humanPlayer, cpuPlayer);
// game.randomiseShipPlacement(humanPlayer);
// game.randomiseShipPlacement(cpuPlayer);
// renderGameBoard(game);
// eventListeners.init(game, humanPlayer, cpuPlayer);