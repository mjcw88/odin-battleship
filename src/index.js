import "./styles.css";
import { eventListeners } from "./eventsController.js";
import { renderGameboards } from "./displayController.js";

import { Player } from "./classes/player.js";
import { Game } from "./classes/game.js";
export const humanPlayer = new Player("Human", true);
export const cpuPlayer = new Player();
export const game = new Game();

game.players.push(humanPlayer);
game.players.push(cpuPlayer);

eventListeners.init();
renderGameboards.init();