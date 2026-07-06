import "./styles.css";
import { renderNewGameForm, formEventListeners } from "./initController.js";
import { eventListeners } from "./gameController.js";

renderNewGameForm.init();
formEventListeners.init();
eventListeners.init();