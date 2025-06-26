import { bindCheckboxes, updateCheckboxes } from "./checkboxes.js";

const mountingWillpowercheckboxes = (row, app) => {
  const circleCheckboxes = row.find(".circle-checkbox");
  const targetProp = "willpower.value";
  const system = "system.willpower";
  const currentValue = foundry.utils.getProperty(app.actor.system, targetProp);
  const actor = app.actor.system.willpower;

  updateCheckboxes(circleCheckboxes, currentValue);
  bindCheckboxes(circleCheckboxes, targetProp, app, actor, system);
};

const mountingWillpowerPointsCheckboxes = (row, app) => {
  const squareCheckboxes = row.find(".square-checkbox");
  const targetProp = "willpowerPoints.value";
  const system = "system.willpowerPoints";
  const currentValue = foundry.utils.getProperty(app.actor.system, targetProp);
  const actor = app.actor.system.willpowerPoints;

  updateCheckboxes(squareCheckboxes, currentValue);
  bindCheckboxes(squareCheckboxes, targetProp, app, actor, system);
};

export const willpowerUpdate = (app, html, data) => {
  html.find(".willpower").each(function () {
    const row = $(this);

    mountingWillpowercheckboxes(row, app);
    mountingWillpowerPointsCheckboxes(row, app);
  });
};
