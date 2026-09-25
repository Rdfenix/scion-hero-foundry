import React, { useState, useImperativeHandle } from "react";
import { localize, customLocalizeWord } from "./../../utils/i18n";
import { splitInColumns } from "../../utils/split";

import "../../styles/pantheon.scss";

const Pantheon = ({ pantheons, ref }) => {
  const [pantheonName, setPantheonName] = useState("");

  const handleSelectPantheon = (event) => {
    const { value } = event.target;
    setPantheonName(value);
  };

  useImperativeHandle(
    ref,
    () => ({
      getValues: () => ({ pantheonName }),
    }),
    [pantheonName],
  );

  return (
    <form
      autoComplete="off"
      onSubmit={(event) => event.preventDefault()}
      className="pantheon-form"
    >
      <div className="pantheon-group form-group">
        <header className="pantheon-group-header">
          <h1>{localize("LABELS.CHOOSE_PANTHEON")}</h1>
        </header>
        <section className="pantheon-group-content">
          <ul className="pantheon-list">
            {pantheons.map((pantheon) => (
              <li key={pantheon.name} className="pantheon-item">
                <input
                  type="radio"
                  name="pantheon-option"
                  id={pantheon.name}
                  value={pantheon.name}
                  data-target={pantheon.name}
                  hidden
                  onClick={handleSelectPantheon}
                />
                <label htmlFor={pantheon.name}>
                  <div className="pantheon-name">
                    {pantheon.name}
                    <img
                      className="pantheon-logo"
                      src={pantheon.logo}
                      alt={pantheon.name}
                    />
                  </div>
                  <div className="virtues-label">
                    <span>{localize("STATS.VIRTUES")}</span>
                  </div>
                  <div className="pantheon-virtues">
                    {splitInColumns(pantheon.virtues, 2).map((column) => (
                      <div
                        className="pantheon-virtue-column"
                        key={column.map(([name]) => name).join("-")}
                      >
                        {column.map(([virtueKey, virtue]) => (
                          <div className="pantheon-virtue-item" key={virtueKey}>
                            <div className="pantheon-virtue-item-row">
                              {customLocalizeWord(virtue?.name, "VIRTUES")}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="description-label">
                    <span>{localize("LABELS.DESCRIPTION")}</span>
                  </div>
                  <div className="pantheon-description">
                    {pantheon.description ? (
                      <p
                        dangerouslySetInnerHTML={{
                          __html: localize(pantheon.description),
                        }}
                      />
                    ) : (
                      <p>{localize("LABELS.NO_DESCRIPTION")}</p>
                    )}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </form>
  );
};

export default Pantheon;
