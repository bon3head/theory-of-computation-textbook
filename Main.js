import PlayerModel from "./Models/PlayerModel.js";
import PlayerView from "./Views/PlayerView.js";
import PlayerController from "./Controllers/PlayerController.js";

const run = () => {
  const model = new PlayerModel();
  const view = new PlayerView();
  const controller = new PlayerController(model, view);
};

document.addEventListener("DOMContentLoaded", run);
