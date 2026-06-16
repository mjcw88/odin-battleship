import "./styles.css";
import { Game } from "./classes/game.js";
import { renderGameboard } from "./displayController.js";

const game = new Game();
game.createNewGame();
renderGameboard(game);