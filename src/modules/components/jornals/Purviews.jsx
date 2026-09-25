import React from "react";
import { localize } from "../../../utils/i18n";

import "../../../styles/jornals/purview.scss";

const Purview = ({ purview }) => {
  return (
    <section className="purviews-section purview-journal-entry-content">
      <h2>{localize("LABELS.DESCRIPTION")}</h2>
      <div className="purviews-wrapper">
        <div className="purviews-description">
          <h2>{localize(purview.name)}</h2>
          <span
            dangerouslySetInnerHTML={{
              __html: localize(purview.description),
            }}
          />
        </div>
        <div className="pruview-list">
          {purview.purviews.map((item) => (
            <div key={item.name} className="purview-item">
              <h2>{localize(item.name)}</h2>
              <span
                className="purview-item-desciption"
                dangerouslySetInnerHTML={{
                  __html: localize(item.description),
                }}
              />
              <div className="boons">
                <ul className="boon-list">
                  {item.boons.map((boon) => (
                    <li
                      key={boon.name}
                      draggable
                      data-type="boon-power"
                      data-entry={boon.name}
                    >
                      <div className="boon-header">
                        <div className="boon-title">
                          <h3
                            dangerouslySetInnerHTML={{
                              __html: localize(boon.name),
                            }}
                          />
                          <div className="level">
                            <span>{localize("LABELS.LEVEL")}:</span>
                            <span>{boon.level}</span>
                          </div>
                        </div>
                        <div className="boon-header-column">
                          <div className="boon-header-row">
                            <span className="boon-header-label">
                              {localize("LABELS.DICE_POOL")}:
                            </span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: localize(boon.dice_pool),
                              }}
                            />
                          </div>
                        </div>
                        <div className="boon-header-column">
                          <div className="boon-header-row">
                            <span className="boon-header-label">
                              {localize("LABELS.COST")}:
                            </span>
                            <span
                              className="boon-header-value"
                              dangerouslySetInnerHTML={{
                                __html: localize(boon.cost),
                              }}
                            />
                          </div>
                        </div>
                        <div
                          className="boon-description"
                          dangerouslySetInnerHTML={{
                            __html: localize(boon.description),
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Purview;
