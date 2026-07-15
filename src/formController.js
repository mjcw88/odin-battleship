import { createGame } from "./gameController.js";

function createGameSetup() {
    let playerOneName = "";
    let playerTwoName = "";
    let difficulty = 0;
    let playerCount = 0;

    function isValid(form) {
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        return true;
    }

    function handleFormData(form) {
        if (!isValid(form)) return null;

        return Object.fromEntries(new FormData(form));
    }

    function create() {
        createGame(
            playerOneName,
            playerTwoName,
            difficulty,
            playerCount
        );
    }

    return {
        submitPlayerCount(value) {
            playerCount = Number(value);
        },

        submitPlayerOne(form) {
            const data = handleFormData(form);
            if (!data) return;

            playerOneName = data.playerName?.trim() || "Player 1";
        },

        submitPlayerTwo(form) {
            const data = handleFormData(form);
            if (!data) return;

            playerTwoName = data.playerName?.trim() || "Player 2";
            create();
        },

        submitCpuDifficulty(value) {
            difficulty = Number(value);
            create();
        },

        getState() {
            return {
                playerOneName,
                playerTwoName,
                difficulty,
                playerCount,
            };
        }
    };
}

export function closeForm(dialog) {
    dialog.close();
}

export const gameSetup = createGameSetup();