import React from "react";

const Shape = ({ min, max, type = "circles", value, onShapeChange }) => {
  const handleClick = (i) => {
    // Clicar acima do valor atual -> define para 'i'
    // Clicar igual ou abaixo do valor atual -> define para 'i - 1'
    const valueToSet = i > value ? i : i - 1;

    if (onShapeChange) {
      onShapeChange(valueToSet);
    }
  };

  return (
    <div className={`${type}`}>
      {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((i) => (
        <input
          key={i}
          type="checkbox"
          className={`${type === "circles" ? "circle-checkbox" : "square-checkbox"}`}
          checked={i <= value}
          onClick={() => handleClick(i)}
        />
      ))}
    </div>
  );
};

export default Shape;
