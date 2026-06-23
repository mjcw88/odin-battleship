export const renderNewGameForm = {
    init() {
        const newGameForm = document.getElementById("new-game-form");
        const closeBtn = document.getElementById("close-btn");

        closeBtn.hidden = true;
        newGameForm.showModal();
    }
}