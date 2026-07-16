import { gameSetup, closeForm } from "./formController.js";

export const renderNewGameForm = {
    init() {
        const playerCountDialog = document.getElementById("player-count-dialog");
        const closeBtn = document.getElementById("close-new-game-btn");
        
        closeBtn.hidden = true;
        playerCountDialog.showModal();
    }
}

export const formEventListeners = {
    init() {
        const playerCountDialog = document.getElementById("player-count-dialog");
        const playerCountForm = playerCountDialog.querySelector("form");

        const playerOneDialog = document.getElementById("player-one-dialog");
        const playerOneForm = playerOneDialog.querySelector("form");
        const playerOneBackBtn = document.getElementById("player-one-back-btn");

        const playerTwoDialog = document.getElementById("player-two-dialog");
        const playerTwoForm = playerTwoDialog.querySelector("form");
        const playerTwoBackBtn = document.getElementById("player-two-back-btn");

        const cpuDialog = document.getElementById("cpu-dialog");
        const cpuForm = cpuDialog.querySelector("form");
        const cpuBackBtn = document.getElementById("cpu-back-btn");

        const closeBtn = document.getElementById("close-new-game-btn");

        let playerCount;

        playerCountForm.addEventListener("submit", (e) => {
            e.preventDefault();
            gameSetup.submitPlayerCount(e.submitter.value);
            playerCount = e.submitter.value;
            playerCountDialog.close();
            playerOneDialog.showModal();
        })
        
        playerOneForm.addEventListener("submit", (e) => {
            e.preventDefault();
            gameSetup.submitPlayerOne(playerOneForm);
            playerOneDialog.close();
            if (playerCount > 1) playerTwoDialog.showModal();
            else cpuDialog.showModal();
        })

        playerTwoForm.addEventListener("submit", (e) => {
            e.preventDefault();
            gameSetup.submitPlayerTwo(playerTwoForm);
            playerTwoDialog.close();
        })

        cpuForm.addEventListener("submit", (e) => {
            e.preventDefault();
            gameSetup.submitCpuDifficulty(e.submitter.value);
            cpuDialog.close();
        })

        closeBtn.addEventListener("click", () => {
            closeForm(playerCountDialog);
        });

        playerOneBackBtn.addEventListener("click", () => {
            playerOneDialog.close();
            playerCountDialog.showModal();
        })

        playerTwoBackBtn.addEventListener("click", () => {
            playerTwoDialog.close();
            playerOneDialog.showModal();
        })

        cpuBackBtn.addEventListener("click", () => {
            cpuDialog.close();
            playerOneDialog.showModal();
        })
    }
}