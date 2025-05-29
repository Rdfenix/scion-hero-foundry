export const splitInColumns = (object, columns, columnClass, options) => {
  if (!object || typeof object !== "object") return "";
  const keys = Object.keys(object);
  const columnSize = Math.ceil(keys.length / columns);
  let output = "";

  for (let i = 0; i < columns; i++) {
    const slice = keys.slice(i * columnSize, (i + 1) * columnSize);
    output += `<div class='${columnClass}'>`;
    slice.forEach((key) => {
      console.log(`Key: ${key}, Value: `, object[key], options);
      output += options.fn({ key, data: object[key] });
    });
    output += "</div>";
  }

  return output;
};
