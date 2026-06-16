import "./styles.css";
import { Game } from "./gameController.js";
import { renderGameboard } from "./displayController.js";

const game = new Game();
game.createNewGame();
renderGameboard(game);