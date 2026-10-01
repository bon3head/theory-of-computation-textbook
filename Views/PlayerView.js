// @ts-check

export default class PlayerView {
  constructor() {
    this.inputBox =
      /**@type {HTMLInputElement} */
      (document.getElementById("playerInput"));
    this.submissionButton = /**@type {HTMLButtonElement} */ (
      document.getElementById("submitButton")
    );

    if (!this.inputBox) {
      console.error(
        "PlayerView: #player-input element was not found in the DOM!",
      );
    }
  }

  /**
   *
   * @param {function(string): void} handler this function updates textbox on keystroke
   */
  onInput(handler) {
    this.inputBox?.addEventListener("input", (event) => {
      const target = /**
       * @type {HTMLInputElement}
       */ (event.target);
      handler(target.value);
    });
  }

  /**
   *
   * @param {function(): void} handler
   */
  onSubmission(handler) {
    this.submissionButton?.addEventListener("click", () => {
      handler();
    });

    this.inputBox?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handler();
      }
    });
  }

  /**
   * @return {void} clear the textbox visually for user
   */
  clearInput() {
    this.inputBox.value = "";
  }
}
