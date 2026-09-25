import React, { useState, useImperativeHandle } from "react";
import { localize, customLocalizeWord } from "./../../utils/i18n";
import { splitInColumns } from "../../utils/split";

import "../../styles/pantheon.scss";

const Gods = ({ gods, ref }) => {
  const [god, setGod] = useState("");

  const handleGodSelection = (event) => {
    const { value } = event.target;
    setGod(value);
  };

  useImperativeHandle(
    ref,
    () => ({
      getValues: () => ({ god }),
    }),
    [god],
  );

  return (
    <form
      autoComplete="off"
      onSubmit={(event) => event.preventDefault()}
      className="pantheon-form"
    >
      <header className="pantheon-group-header">
        <h1>{localize("LABELS.CHOOSE_GODS")}</h1>
      </header>
      <section className="pantheon-group-content">
        <ul className="pantheon-list">
          {gods.map((god, index) => (
            <li key={god.name} className="pantheon-item">
              <input
                type="radio"
                name="pantheon-option"
                id={god.name}
                value={god.name}
                data-target={god.name}
                hidden
                onClick={handleGodSelection}
              />
              <label htmlFor={god.name}>
                <div className="pantheon-name">{god.name}</div>
                <div className="skills-label">
                  <span>{localize("LABELS.FAVORED_SKILLS")}</span>
                </div>
                <div className="god-skills">
                  {splitInColumns(god.favoredSkills, 3).map((column) => (
                    <div
                      className="god-skill-column"
                      key={column.map(([name]) => name).join("-")}
                    >
                      {column.map(([skillKey, skill]) => (
                        <div
                          className="god-skill-item"
                          key={`${god.name}-${skillKey}`}
                        >
                          <div className="god-skill-item-row">
                            {customLocalizeWord(skill, "ABILITIES")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </form>
  );
};

export default Gods;
