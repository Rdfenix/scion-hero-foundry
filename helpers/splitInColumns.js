export const splitInColumns = (object, columns, options) => {
  const keys = Object.keys(object);
  const columnSize = Math.ceil(keys.length / columns);
  let output = "";

  output = Array(columns).reduce((acc, _, index) => {
    const slice = keys.slice(index * columnSize, (index + 1) * columnSize);
    acc += "<div class='skills-grid-item'>";

    slice.forEach((key) => {
      acc += options.fn({ key, value: object[key] });
    });

    acc += "</div>";

    return acc;
  }, "");

  return output;
};
