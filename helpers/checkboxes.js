export const updateCheckboxes = (checkboxes, currentValue) => {
  checkboxes.each(function (_index, input) {
    const value = Number.parseInt(input.value);
    input.checked = !(
      Number.isNaN(currentValue) ||
      currentValue <= 0 ||
      value <= 0 ||
      value > currentValue
    );
  });
};

export const bindCheckboxes = (
  checkboxes,
  targetProp,
  app,
  actor,
  system,
  render = false,
) => {
  const debouncedUpdate = _debounce(async (valueToSet) => {
    const data = foundry.utils.deepClone(actor);
    data.value = valueToSet;

    await app.actor.update({ [system]: data }, { render: render });
  }, 150); // Espera 150ms após último clique

  checkboxes.off("click.scion").on("click.scion", async function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();

    const newValue = Number.parseInt(this.value);
    const currentValue = foundry.utils.getProperty(
      app.actor.system,
      targetProp,
    );

    let valueToSet = newValue > currentValue ? newValue : newValue - 1;

    updateCheckboxes(checkboxes, valueToSet);

    debouncedUpdate(valueToSet);
  });
};
