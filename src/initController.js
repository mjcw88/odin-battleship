import { submitForm, closeForm } from "./formController.js";

export const renderNewGameForm = {
    init() {
        const newGameForm = document.getElementById("new-game-form");
        const closeBtn = document.getElementById("close-new-game-btn");

        closeBtn.hidden = true;
        newGameForm.showModal();
    }
}

export const formEventListeners = {
    init() {
        const setDiffcultyButtons = function(playerCount) {
            const difficultyButtons = document.querySelectorAll('input[name="difficulty"]');
            difficultyButtons.forEach(btn => {
                btn.disabled = playerCount > 1;
            })
        };

        const setPlayerTwo = function(playerCount) {
            const playerTwo = document.getElementById("player2-name");
            playerTwo.disabled = playerCount === 1;
            setDiffcultyButtons(playerCount);
        }

        const newGameFormDialog = document.getElementById("new-game-form");
        const newGameForm = newGameFormDialog.querySelector("form");
        newGameFormDialog.addEventListener("submit", (e) => {
            e.preventDefault();
            document.getElementById("close-new-game-btn").hidden = false;
            submitForm(newGameForm);
            closeForm(newGameFormDialog, newGameForm);
        });

        const closeBtn = document.getElementById("close-new-game-btn");
        closeBtn.addEventListener("click", () => {
            const playerCount = parseInt(document.querySelector('input[name="playerCount"]:checked').value);
            setPlayerTwo(playerCount);
            setDiffcultyButtons(playerCount);
            closeForm(newGameFormDialog, newGameForm);
        });
        
        newGameForm.addEventListener("change", (e) => {
            if (e.target.type === "radio" && e.target.name === "playerCount") {
                setPlayerTwo(parseInt(e.target.value));
            }
        });
    }
}