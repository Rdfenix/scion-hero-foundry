import React from "react";
import { localize, customLocalizeWord } from "../../utils/i18n";
import "../../styles/dice-result.scss";

import D10Icon from "../../assets/svg/d10.svg";

const DiceResult = ({ data }) => {
  let resultTemplate;

  const getDiceValueClass = (value) => {
    if (value === 1) return "dice-value dice-value--one";
    if (value === 10) return "dice-value dice-value--ten";
    if (value < 7) return "dice-value dice-value--low";
    return "dice-value";
  };

  const renderDicesResults = () => (
    <div className="dice-values">
      {(data.dicesResults ?? []).map((dice) => {
        const value = Number(dice);
        const valueClass = getDiceValueClass(value);

        return (
          <span className={valueClass} key={dice}>
            {dice}
          </span>
        );
      })}
    </div>
  );

  if (data.epicAttribute === 0 && data.criticalFail) {
    resultTemplate = (
      <div className="critical-fail">
        <details className="roll-breakdown">
          <summary className="critical-fail">
            <span>{localize("LABELS.CRITICAL_FAIL")}:</span>
            <span>{data.totalSuccess}</span>
          </summary>
          {renderDicesResults()}
        </details>
      </div>
    );
  } else if (data.fail) {
    resultTemplate = (
      <div className="fail">
        <details className="roll-breakdown">
          <summary className="fail">
            <span>{localize("LABELS.FAIL")}:</span>
            <span>{data.totalSuccess}</span>
          </summary>
          {renderDicesResults()}
        </details>
      </div>
    );
  } else {
    resultTemplate = (
      <div className="success">
        <details className="roll-breakdown">
          <summary className="success">
            <span>{localize("LABELS.NORMAL_SUCCESSES")}:</span>
            <span>{data.totalSuccess}</span>
          </summary>
          {renderDicesResults()}
        </details>
      </div>
    );
  }

  return (
    <div className="dice-result">
      <h3
        dangerouslySetInnerHTML={{
          __html: data.title || localize("LABELS.DICE_ROLL_RESULT"),
        }}
      />
      <div className="dice-result-wrapper">
        {data.explodedDices.length > 0 && (
          <div className="exploded-dices">
            <span>{localize("LABELS.EXPLODED_DICE")}:</span>
            <span>{data.explodedDices}</span>
          </div>
        )}
        {resultTemplate}
        {data.epicAttribute > 0 && data.epicAttributeLabel && (
          <div className="epic-attribute">
            <span>
              {localize("LABELS.EPIC_ATTRIBUTE")} -{" "}
              {customLocalizeWord(data.epicAttributeLabel, "ATTRIBUTES")}:{" "}
            </span>
            <span>{data.epicAttribute}</span>
          </div>
        )}
      </div>
      <div className="total-result">
        <span>{localize("LABELS.TOTAL_RESULT")}:</span>
        <div className="total-result-dice">
          <img src={D10Icon} alt="" />
          <span>
            {Number(data.totalSuccess || 0) +
              Number(data.totalEpicSuccess || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiceResult;
