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
        const setDiffcultyButtons = function() {
            const difficultyButtons = document.querySelectorAll('input[name="difficulty"]');
            difficultyButtons.forEach(btn => {
                btn.disabled = !btn.disabled;
            })
        }

        const setPlayerTwo = function(playerCount) {
            const playerTwo = document.getElementById("player2-name");
            if (playerCount > 1) {
                playerTwo.disabled = false;
            } else {
                playerTwo.disabled = true;
            }
            setDiffcultyButtons();
        }

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
        
        newGameForm.addEventListener("change", (e) => {
            if (e.target.type === "radio" && e.target.name === "playerCount") {
                setPlayerTwo(parseInt(e.target.value));
            }
        })
    }
}