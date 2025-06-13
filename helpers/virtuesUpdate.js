const bindVirtuesCheckboxes = (checkboxes, label, app) => {
  checkboxes.off("click.scion").on("click.scion", async function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const newValue = parseInt(this.value);
    const currentValue = foundry.utils.getProperty(
      app.actor.system,
      `virtues.${label}.value`
    );

    let valueToSet = newValue > currentValue ? newValue : newValue - 1;

    await app.actor.update(
      {
        [`system.virtues.${label}.value`]: valueToSet,
      },
      { render: false }
    );

    updateVirtuesCheckboxes(checkboxes, valueToSet);
  });
};

const updateVirtuesCheckboxes = (checkboxes, currentValue) => {
  checkboxes.each(function () {
    const input = this;
    const value = parseInt(input.value);
    input.checked = !(
      isNaN(currentValue) ||
      currentValue <= 0 ||
      value <= 0 ||
      value > currentValue
    );
  });
};

const mountingVirtues = (row, label, app) => {
  const circleCheckboxes = row.find(".circle-checkbox");
  const targetVirtues = `virtues.${label}.value`;
  const currentValue = foundry.utils.getProperty(
    app.actor.system,
    targetVirtues
  );

  updateVirtuesCheckboxes(circleCheckboxes, currentValue);
  bindVirtuesCheckboxes(circleCheckboxes, label, app);
};

export const virtuesUpdate = (app, html, data) => {
  html.find(".virtues-row").each(function () {
    const row = $(this);
    const label = row.data("key");
    mountingVirtues(row, label, app);
  });
};
