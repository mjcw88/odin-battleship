import { createGame } from "./gameController.js";

export function submitForm(form) {
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    let playerOneName;
    data.playerOneName?.trim() === "" ? playerOneName = "Player 1" : playerOneName = data.playerOneName;
    const difficulty = parseInt(data.difficulty);

    createGame(playerOneName, difficulty);
}

export function closeForm(dialog, form) {
    dialog.close();
    form.reset();
}