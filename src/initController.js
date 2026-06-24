import { submitForm, closeForm } from "./formController.js";

export const renderNewGameForm = {
    init() {
        const newGameForm = document.getElementById("new-game-form");
        const closeBtn = document.getElementById("close-new-game-btn");

        closeBtn.hidden = true;
        newGameForm.showModal();
    }
}

export const eventListeners = {
    init() {
        const newGameFormDialog = document.getElementById("new-game-form");
        const newGameForm = newGameFormDialog.querySelector("form");
        newGameFormDialog.addEventListener("submit", (e) => {
            e.preventDefault();
            submitForm(newGameForm);
            closeForm(newGameFormDialog, newGameForm);
        });

        const closeBtn = document.getElementById("close-new-game-btn");
        closeBtn.addEventListener("click", () => {
            closeForm(newGameFormDialog, newGameForm);
        })
    }
}