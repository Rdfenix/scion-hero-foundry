const bindAttributeCheckboxes = (
  checkboxes,
  groupKey,
  label,
  app,
  attributes,
  type
) => {
  checkboxes.off("click.scion").on("click.scion", async function (ev) {
    ev.preventDefault();

    const newValue = parseInt(this.value);
    const currentValue = foundry.utils.getProperty(
      app.actor.system,
      `${type}.${groupKey}.${label}.value`
    );

    let valueToSet = newValue > currentValue ? newValue : newValue - 1;

    await app.actor.update(
      {
        [attributes]: valueToSet,
      },
      { render: false }
    );

    updateAttributeCheckboxes(checkboxes, valueToSet);
  });
};

const updateAttributeCheckboxes = (checkboxes, currentValue) => {
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

const mountingAttributes = (row, groupKey, label, app) => {
  const circleCheckboxes = row.find(".circle-checkbox");
  const targetAttributes = `attributes.${groupKey}.${label}.value`;
  const currentAttrValue = foundry.utils.getProperty(
    app.actor.system,
    targetAttributes
  );
  const systemAttributes = `system.attributes.${groupKey}.${label}.value`;

  // Usa a função para atualizar o checked dos círculos
  updateAttributeCheckboxes(circleCheckboxes, currentAttrValue);

  // Usa a função para bindar os eventos
  bindAttributeCheckboxes(
    circleCheckboxes,
    groupKey,
    label,
    app,
    systemAttributes,
    "attributes"
  );
};

const mountingEpicAttributes = (row, groupKey, label, app) => {
  const squareCheckboxes = row.find(".square-checkbox");
  const targetEpicAttributes = `epicAttributes.${groupKey}.${label}.value`;
  const currentAttrValue = foundry.utils.getProperty(
    app.actor.system,
    targetEpicAttributes
  );
  const systemEpicAttributes = `system.epicAttributes.${groupKey}.${label}.value`;

  // Usa a função para atualizar o checked dos círculos
  updateAttributeCheckboxes(squareCheckboxes, currentAttrValue);
  // Usa a função para bindar os eventos
  bindAttributeCheckboxes(
    squareCheckboxes,
    groupKey,
    label,
    app,
    systemEpicAttributes,
    "epicAttributes"
  );
};

export const attributesUpdate = (app, html, data) => {
  // Para cada grupo de atributos (physical, social, mental)
  html.find(".attribute-grid-item").each(function () {
    const gridItem = $(this);
    const groupKey = gridItem.find("h3").text().trim().toLowerCase();

    // Para cada linha de atributo (ex: strength, dexterity)
    gridItem.find(".attribute-row").each(function () {
      const row = $(this);
      const label = row.find("span").text().trim().toLowerCase();

      mountingAttributes(row, groupKey, label, app);

      mountingEpicAttributes(row, groupKey, label, app);
    });
  });
};
