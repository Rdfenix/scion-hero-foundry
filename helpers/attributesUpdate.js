const bindAttributeCheckboxes = (checkboxes, groupKey, label, app) => {
  checkboxes.off("change.scion").on("change.scion", async function (ev) {
    const newValue = parseInt(this.value);
    if (!isNaN(newValue)) {
      await app.actor.update(
        {
          [`system.attributes.${groupKey}.${label}.value`]: newValue,
        },
      );
    }
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

export const attributesUpdate = (app, html, data) => {
  // Para cada grupo de atributos (physical, social, mental)
  html.find(".attribute-grid-item").each(function () {
    const gridItem = $(this);
    const groupKey = gridItem.find("h3").text().trim().toLowerCase();

    // Para cada linha de atributo (ex: strength, dexterity)
    gridItem.find(".attribute-row").each(function () {
      const row = $(this);
      const label = row.find("span").text().trim().toLowerCase();
      const checkboxes = row.find(".circle-checkbox");
      const target = `attributes.${groupKey}.${label}.value`;
      const currentValue = foundry.utils.getProperty(app.actor.system, target);

      // Usa a função para atualizar o checked dos círculos
      updateAttributeCheckboxes(checkboxes, currentValue);

      // Usa a função para bindar os eventos
      bindAttributeCheckboxes(checkboxes, groupKey, label, app);
    });
  });
};
