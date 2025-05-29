const bindAbilitieCheckboxes = (checkboxes, label, app, abilities, type) => {
  checkboxes.off("click.scion").on("click.scion", async function (ev) {
    ev.preventDefault();

    const newValue = parseInt(this.value);
    const currentValue = foundry.utils.getProperty(
      app.actor.system,
      `${type}.${label}.value`
    );

    let valueToSet = newValue > currentValue ? newValue : newValue - 1;

    await app.actor.update(
      {
        [abilities]: valueToSet,
      },
      { render: false }
    );

    updateAbilitieCheckboxes(checkboxes, valueToSet);
  });
};

const updateAbilitieCheckboxes = (checkboxes, currentValue) => {
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

const mountingAbilities = (row, label, app) => {
  const circleCheckboxes = row.find(".circle-checkbox");
  const targetSkills = `abilities.${label}.value`;
  const currentSkillsValue = foundry.utils.getProperty(
    app.actor.system,
    targetSkills
  );
  const systemAbilities = `system.abilities.${label}.value`;

  updateAbilitieCheckboxes(circleCheckboxes, currentSkillsValue);

  bindAbilitieCheckboxes(
    circleCheckboxes,
    label,
    app,
    systemAbilities,
    "abilities"
  );
};

export const abilitiesUpdate = (app, html, data) => {
  html.find(".skills-grid-item").each(function () {
    const gridItem = $(this);

    // Para cada linha de atributo (ex: strength, dexterity)
    gridItem.find(".skills-row").each(function () {
      const row = $(this);
      const label = row.data("key");

      mountingAbilities(row, label, app);
    });
  });
};
