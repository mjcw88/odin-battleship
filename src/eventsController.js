import { submitForm, closeForm } from "./formController.js";

export const eventListeners = {
    init() {
        const newGameFormDialog = document.getElementById("new-game-form");
        const newGameForm = newGameFormDialog.querySelector("form");
        newGameFormDialog.addEventListener("submit", (e) => {
            e.preventDefault();
            submitForm(newGameForm);
            closeForm(newGameFormDialog, newGameForm);
        });
    }
}

// const randomiseBtn = document.getElementById("randomise-ships-btn");
// randomiseBtn.addEventListener("click", () => {
    // game.randomiseShipPlacement(humanPlayer);
    // game.randomiseShipPlacement(cpuPlayer);
    // renderGameBoard(game);
    // game.playerOneTurn = true;
    // game.winner = null;
// })