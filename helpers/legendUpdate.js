import { bindCheckboxes, updateCheckboxes } from "./checkboxes.js";

const mountingLegendcheckboxes = (row, app) => {
  const circleCheckboxes = row.find(".circle-checkbox");
  const targetProp = "legend.value";
  const system = "system.legend";
  const currentValue = foundry.utils.getProperty(app.actor.system, targetProp);
  const actor = app.actor.system.legend;

  updateCheckboxes(circleCheckboxes, currentValue);
  bindCheckboxes(circleCheckboxes, targetProp, app, actor, system, true);
};

export const legendUpdate = (app, html, data) => {
  html.find(".legend").each(function () {
    const row = $(this);

    mountingLegendcheckboxes(row, app);
  });
};
