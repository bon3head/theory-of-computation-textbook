import PlayerModel from "../Models/PlayerModel.js";
import PlayerView from "../Views/PlayerView.js";

export default class PlayerController {
  /**
   *
   * @param {PlayerModel} model
   * @param {PlayerView} view
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.onInput((text) => this.onExpressionUpdate(text));
    this.view.onSubmission((finalExpression) =>
      this.onSubmission(finalExpression),
    );
  }

  /**
   *
   * @param {String} newExpression
   * @returns {void} tells model to update value
   */
  onExpressionUpdate(newExpression) {
    this.model.updateCurrentExpression(newExpression);
  }

  /**
   * @returns {void} tells model to clear expression when submitted
   */
  onSubmission() {
    this.model.clearExpression();
    this.view.clearInput();
  }
}
