// @ts-check

import Point from "./Point.js";

/**
 * Description placeholder
 *
 * @export
 * @class PlayerModel
 * @typedef {Object} playerBounds
 * @property {Point} p containing the x and y of our player
 * @property {Number} h height
 * @property {Number} w width
 */
export default class PlayerModel {
  // default builder
  /**
   * Creates an instance of PlayerModel.
   *
   * @constructor
   */
  constructor() {
    /**
     * @type Number
     */
    // an appropiate amount
    this.lives = 3;

    this.score = 0;

    // view prompts user -> controller listens -> updates model
    this.currentExpression = "";

    // on canvas
    this.position = new Point(0, 0);

    // Bounds for a rectangular hitbox, idk how hitboxes work but I imagine 2 rectangles slapping each other
    // shouldn't be 0
    this.width = 0;
    this.height = 0;
  }

  /**
   *
   * @param {String} newString the current text in the players input box
   */
  updateCurrentExpression(newString) {
    this.currentExpression = newString;
  }

  /**
   * @returns {void} this clears the input box, probably on submit but defintely to clean state
   */
  clearExpression() {
    this.currentExpression = "";
  }

  /**
   * @returns {void} on collision with enemy to decrement health, idk if we always want to take one maybe param here for amount
   */
  takeDamage() {
    this.lives -= 1;
  }

  /**
   * @returns {void} update our score, maybe take param for pos and neg values, for now -1 is fine
   */
  updateScore() {
    this.score += 1;
  }

  /**
   *
   * @returns {playerBounds}
   */
  getBounds() {
    return {
      p: this.position,
      h: this.height,
      w: this.width,
    };
  }
}
