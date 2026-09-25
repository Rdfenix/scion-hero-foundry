import React, { useState, useImperativeHandle } from "react";
import { localize, customLocalizeWord } from "./../../utils/i18n";

import "../../styles/dialog.scss";

const DifficultyDialog = ({
  title,
  subtitle,
  showAttribute,
  attrKeys,
  showMultipleAttack,
  showExtraDices,
  ref,
}) => {
  const [difficulty, setDifficulty] = useState("7");
  const [extraDices, setExtraDices] = useState("0");
  const [attr, setAttr] = useState(attrKeys[0]);
  const [isMultiple, setIsMultiple] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      getValues() {
        const parsedDifficulty = Number(difficulty);
        const parsedExtraDices = Number(extraDices);

        if (!Number.isInteger(parsedDifficulty) || parsedDifficulty < 1) {
          throw new Error("Informe uma dificuldade válida.");
        }

        if (!Number.isInteger(parsedExtraDices)) {
          throw new TypeError("Informe uma quantidade válida de dados extras.");
        }

        return {
          difficulty: parsedDifficulty,
          extraDices: parsedExtraDices,
          attr,
          isMultiple,
        };
      },
    }),
    [difficulty, extraDices, attr, isMultiple],
  );

  return (
    <form
      autoComplete="off"
      className="default-dialog-form"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="default-dialog-form-group">
        <div className="default-dialog-header">
          {title && <h1>{localize(title)}</h1>}
          {subtitle && <h2>{localize(subtitle)}</h2>}
        </div>
      </div>
      <div className="default-dialog-section">
        {showAttribute && (
          <select
            name="attr-dice-roll"
            value={attr}
            onChange={(event) => setAttr(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {attrKeys.map((attrKey) => (
              <option key={attrKey} value={attrKey}>
                {customLocalizeWord(attrKey, "ATTRIBUTES")}
              </option>
            ))}
          </select>
        )}
        {showMultipleAttack && (
          <div className="actions">
            <div className="multiple-atk">
              <select
                name="multiple-attack"
                value={isMultiple}
                onChange={(event) =>
                  setIsMultiple(JSON.parse(event.target.value))
                }
                onKeyDown={(event) => event.stopPropagation()}
              >
                <option value="" disabled selected>
                  {localize("LABELS.SELECT_MULTIPLE_ATTACK")}
                </option>
                <option value={true}>{localize("LABELS.YES")}</option>
                <option value={false}>{localize("LABELS.NO")}</option>
              </select>
            </div>
          </div>
        )}
        {showExtraDices && (
          <div className="extra-info">
            <label htmlFor="extra-dices">
              {localize("LABELS.EXTRA_DICES")}:
            </label>
            <input
              type="text"
              name="extra-dices"
              value={extraDices}
              onChange={(event) => setExtraDices(event.target.value)}
            />
          </div>
        )}
        <div className="difficulty">
          <label htmlFor="difficulty">{localize("LABELS.DIFFICULTY")}</label>
          <input
            type="number"
            name="difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          />
        </div>
      </div>
    </form>
  );
};

export default DifficultyDialog;
