import { createGame } from "./gameController.js";

export function submitForm(form) {
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    let playerOneName, playerTwoName;
    data.playerOneName?.trim() === "" ? playerOneName = "Player 1" : playerOneName = data.playerOneName;
    data.playerTwoName?.trim() === "" ? playerTwoName = "Player 2" : playerTwoName = data.playerTwoName;
    const difficulty = parseInt(data.difficulty);
    const playerCount = parseInt(data.playerCount);
    createGame(playerOneName, playerTwoName, difficulty, playerCount);
}

export function closeForm(dialog, form) {
    dialog.close();
    form.reset();

    document.getElementById("player2-name").disabled = true;

    const difficultyButtons = document.querySelectorAll('input[name="difficulty"]');
    difficultyButtons.forEach(btn => {
        btn.disabled = false;
    })
}