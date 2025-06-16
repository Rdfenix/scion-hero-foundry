const updateBirthCheckboxes = (checkboxes, currentValue) => {
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

const bindBirthCheckboxes = (checkboxes, index, app) => {
  checkboxes.off("click.scion").on("click.scion", async function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const newValue = parseInt(this.value);
    const currentValue = foundry.utils.getProperty(
      app.actor.system,
      `birthrights.${index}.level.value`
    );

    let valueToSet = newValue > currentValue ? newValue : newValue - 1;

    const birthrights = foundry.utils.deepClone(app.actor.system.birthrights);
    birthrights[index].level.value = valueToSet;

    await app.actor.update(
      { "system.birthrights": birthrights },
      { render: false }
    );

    updateBirthCheckboxes(checkboxes, valueToSet);
  });
};

const mountingBirthrightcheckboxes = (row, index, app) => {
  const circleCheckboxes = row.find(".circle-checkbox");
  const targetbirth = `birthrights.${index}.level.value`;
  const currentValue = foundry.utils.getProperty(app.actor.system, targetbirth);

  updateBirthCheckboxes(circleCheckboxes, currentValue);
  bindBirthCheckboxes(circleCheckboxes, index, app);
};

export const birthrightUpdate = (app, html, data) => {
  html.find(".birthright-input-area").each(function () {
    const row = $(this);
    const index = row.data("index");
    mountingBirthrightcheckboxes(row, index, app);
  });
};
