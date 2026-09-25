import React, { useState, useImperativeHandle } from "react";
import { localize } from "../../utils/i18n";

const CombatWheel = ({ options, ref }) => {
  const [tick, setTick] = useState("1");

  const handleTicker = (event) => {
    const { value } = event.target;
    setTick(value);
  };

  useImperativeHandle(
    ref,
    () => ({
      getValues: () => ({ tick: Number(tick) }),
    }),
    [tick],
  );

  return (
    <form autoComplete="off" className="combat-wheel-dialog-form">
      <div className="combat-wheel-dialog-header">
        <h2>
          {localize("LABELS.TICK_DIRECTION")}: {options.action}
        </h2>
      </div>
      <section className="combat-wheel-dialog-section">
        <div className="combat-wheel-dialog-column">
          <label for="action-select">{localize("LABELS.STEP")}:</label>
        </div>
        <select id="action-select" name="tick-value" onChange={handleTicker}>
          {options.ticks.map((tick) => (
            <option value={tick}>{tick}</option>
          ))}
        </select>
      </section>
    </form>
  );
};

export default CombatWheel;
