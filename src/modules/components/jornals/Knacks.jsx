import React from "react";
import { localize } from "../../../utils/i18n";

import "../../../styles/jornals/knack.scss";

const Knack = ({ knacks }) => {
  return (
    <section className="knacks-section knack-journal-entry-content">
      <div className="knack-wrapper-list">
        {knacks.map((knack) => (
          <React.Fragment key={knack.name}>
            <h2>{localize(knack.name)}</h2>
            <div className="knack-list">
              <ul>
                {knack.powers.map((power) => (
                  <li
                    key={power.name}
                    draggable
                    data-type="knack-power"
                    data-entry={power.name}
                  >
                    <h3>{localize(power.name)}</h3>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: localize(power.description),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default Knack;
