import { updateCheckboxes } from './checkboxes.js';

const bindVirtuesCheckboxes = (checkboxes, label, app) => {
  checkboxes.off('click.scion').on('click.scion', async function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const newValue = Number.parseInt(this.value);
    const currentValue = foundry.utils.getProperty(app.actor.system, `virtues.${label}.value`);
    let valueToSet = newValue > currentValue ? newValue : newValue - 1;

    if (valueToSet !== currentValue) {
      await app.actor.update({ [`system.virtues.${label}.value`]: valueToSet });
      updateCheckboxes(checkboxes, valueToSet);
    }
  });
};

const mountingVirtues = (row, label, app) => {
  const circleCheckboxes = row.find('.circle-checkbox');
  const targetVirtues = `virtues.${label}.value`;
  const currentValue = foundry.utils.getProperty(app.actor.system, targetVirtues);

  updateCheckboxes(circleCheckboxes, currentValue);
  bindVirtuesCheckboxes(circleCheckboxes, label, app);
};

export const virtuesUpdate = (app, html, data) => {
  html.find('.virtues-row').each(function () {
    const row = $(this);
    const label = row.data('key');
    mountingVirtues(row, label, app);
  });
};
