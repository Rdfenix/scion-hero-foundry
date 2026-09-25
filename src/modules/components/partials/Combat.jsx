import React, { useState, useEffect, useMemo } from "react";
import { localize, customLocalizeWord } from "../../../utils/i18n";
import { multiply } from "../../../utils/math";
import { _debounce } from "../../../utils/debounce";
import { useActor, useDispatch } from "../../ActorContext";
import Shape from "./Shape";

import "../../../styles/combat.scss";

const Weapon = ({ data }) => {
  const dispatch = useDispatch();
  const [weapons, setWeapons] = useState(data.weapons);

  useEffect(() => {
    setWeapons(data.weapons);
  }, [data.weapons]);

  const debouncedHandler = useMemo(
    () =>
      _debounce(async (type, field, value) => {
        dispatch({
          type,
          payload: {
            field,
            value,
          },
        });
      }, 500),
    [data.weapons],
  );

  const handleWeaponChange = (event) => {
    const { weaponId, field } = event.target.dataset;
    const { value } = event.target;

    setWeapons((currentWeapons) =>
      currentWeapons.map((weapon) =>
        weapon._id === weaponId ? { ...weapon, [field]: value } : weapon,
      ),
    );

    updateWeapon(weaponId, field, value);
  };

  const addWeapon = () => {
    debouncedHandler("ADD_NEW_WEAPON");
  };

  const deleteWeapon = (event) => {
    const weaponId = event.target.dataset.weaponId;
    debouncedHandler("DELETE_WEAPON", "", weaponId);
  };

  const updateWeapon = (weaponId, field, data) => {
    debouncedHandler("UPDATE_WEAPON", field, { weaponId, data });
  };

  const callAtackWeapon = (event) => {
    const { action, weaponId } = event.target.dataset;
    const weapon = weapons.find((item) => item._id === weaponId);
    debouncedHandler("OPEN_DIFICULTY_DIALOG", action, {
      weapon,
      title:
        action === "attack" ? "LABELS.WEAPON_ATACK" : "LABELS.DAMAGE_VALUE",
    });
  };

  return (
    <div className="weapons">
      <div className="scion-label-title">
        <h2>{localize("STATS.WEAPONS")}</h2>
      </div>
      <div className="weapon-wrapper">
        <ul>
          {weapons.map((weapon) => (
            <li key={weapon._id}>
              <div className="weapon-name">
                <input
                  type="text"
                  placeholder="Weapon name"
                  data-action="update-weapon-field"
                  data-weapon-id={weapon._id}
                  data-field="name"
                  value={weapon.name}
                  onChange={handleWeaponChange}
                />
                <button
                  data-action="attack"
                  data-weapon-id={weapon._id}
                  onClick={callAtackWeapon}
                >
                  {localize("LABELS.ATTACK")}
                </button>
                <button
                  data-action="damage"
                  data-weapon-id={weapon._id}
                  onClick={callAtackWeapon}
                >
                  {localize("LABELS.DAMAGE")}
                </button>
              </div>
              <div className="weapon-specs">
                <div className="attr-skill">
                  <div>
                    <span>{localize("LABELS.ATTRIBUTE")}:</span>
                    <select
                      name="weapon-attr"
                      data-action="select-weapon-type"
                      data-field="attr"
                      data-weapon-id={weapon._id}
                      value={weapon.attr}
                      onChange={handleWeaponChange}
                    >
                      <option value="">{localize("LABELS.ATTRIBUTE")}</option>
                      {data.attrKeys.map((attrKey) => (
                        <option key={attrKey} value={attrKey}>
                          {customLocalizeWord(attrKey, "ATTRIBUTES")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span>{localize("LABELS.SKILL")}:</span>
                    <select
                      name="weapon-skill"
                      data-action="select-weapon-type"
                      data-field="skill"
                      data-weapon-id={weapon._id}
                      value={weapon.skill}
                      onChange={handleWeaponChange}
                    >
                      <option value="">{localize("LABELS.SKILL")}</option>
                      {data.skillsKeys.map((skill) => (
                        <option key={skill} value={skill}>
                          {customLocalizeWord(skill, "ABILITIES")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="weapon-stats">
                  <div>
                    <span>{localize("LABELS.SPEED")}:</span>
                    <input
                      type="text"
                      placeholder="Speed"
                      data-action="update-weapon-field"
                      data-weapon-id={weapon._id}
                      data-field="speed"
                      value={weapon.speed}
                      onChange={handleWeaponChange}
                    />
                  </div>
                  <div>
                    <span>{localize("LABELS.ACCURACY")}:</span>
                    <input
                      type="text"
                      placeholder="Accuracy"
                      data-action="update-weapon-field"
                      data-weapon-id={weapon._id}
                      data-field="acc"
                      value={weapon.acc}
                      onChange={handleWeaponChange}
                    />
                  </div>
                  <div>
                    <span>{localize("LABELS.DEFENSE")}:</span>
                    <input
                      type="text"
                      placeholder={localize("LABELS.DEFENSE")}
                      data-action="update-weapon-field"
                      data-weapon-id={weapon._id}
                      data-field="defense"
                      value={weapon.defense}
                      onChange={handleWeaponChange}
                    />
                  </div>
                  <div>
                    <span>{localize("LABELS.RANGE")}:</span>
                    <input
                      type="text"
                      placeholder={localize("LABELS.RANGE")}
                      data-action="update-weapon-field"
                      data-weapon-id={weapon._id}
                      data-field="range"
                      value={weapon.range}
                      onChange={handleWeaponChange}
                    />
                  </div>
                  <div className="damage">
                    <span>{localize("LABELS.DAMAGE_VALUE")}:</span>
                    <input
                      type="text"
                      placeholder={localize("LABELS.DAMAGE_VALUE")}
                      data-action="update-weapon-field"
                      data-weapon-id={weapon._id}
                      data-field="damage"
                      value={weapon.damage}
                      onChange={handleWeaponChange}
                    />
                  </div>
                </div>
              </div>
              <div className="damage-info">
                <div className="damage-attr">
                  <div>
                    <span>{localize("LABELS.DAMAGE_ATTRIBUTE")}:</span>
                    <select
                      data-action="select-weapon-type"
                      data-field="damageAttr"
                      data-weapon-id={weapon._id}
                      onChange={handleWeaponChange}
                      value={weapon.damageAttr}
                    >
                      <option value="">
                        {localize("LABELS.DAMAGE_ATTRIBUTE")}
                      </option>
                      {data.attrKeys.map((attr) => (
                        <option key={attr} value={attr}>
                          {customLocalizeWord(attr, "ATTRIBUTES")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span>{localize("LABELS.DAMAGE_TYPE")}:</span>
                    <select
                      data-action="select-weapon-type"
                      data-field="type"
                      data-weapon-id={weapon._id}
                      onChange={handleWeaponChange}
                      value={weapon.type}
                    >
                      <option value="">{localize("LABELS.DAMAGE_TYPE")}</option>
                      {data.damageType.map((type) => (
                        <option key={type} value={type}>
                          {customLocalizeWord(type, "DAMAGE_TYPES")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button
                className="delete-button delete-button--absolute"
                data-action="delete-weapon"
                data-weapon-id={weapon._id}
                onClick={deleteWeapon}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </li>
          ))}
        </ul>
        <button
          className="add-weapon"
          data-action="button-weapon-add"
          onClick={addWeapon}
        >
          {localize("LABELS.ADD_WEAPON")}
        </button>
      </div>
    </div>
  );
};

const WillpowerLegend = ({ data }) => {
  const dispatch = useDispatch();
  const [willpowerLegend, setWillpowerLegend] = useState({
    willpower: data.willpower,
    legend: data.legend,
    legendPoints: data.legendPoints,
    willpowerPoints: data.willpowerPoints,
  });

  useEffect(() => {
    setWillpowerLegend({
      willpower: data.willpower,
      legend: data.legend,
      legendPoints: data.legendPoints,
      willpowerPoints: data.willpowerPoints,
    });
  }, [data.willpower, data.legend, data.legendPoints, data.willpowerPoints]);

  const debouncedSave = useMemo(
    () =>
      _debounce(async (field, value) => {
        dispatch({
          type: "SET_UPDATE_Will_LEGEND",
          payload: {
            field,
            value,
          },
        });
      }, 400),
    [data.willpower, data.legend, data.legendPoints, data.willpowerPoints],
  );

  const debouncedHandler = useMemo(
    () =>
      _debounce(async (type, field, value) => {
        dispatch({
          type,
          payload: {
            field,
            value,
          },
        });
      }, 500),
    [data.willpower, data.legend, data.legendPoints, data.willpowerPoints],
  );

  const handleWillpowerLegend = (type, value) => {
    setWillpowerLegend((prevData) => ({
      ...prevData,
      [type]: { ...prevData[type], value },
    }));

    debouncedSave(type, value);
  };

  const callDialog = (field) => {
    debouncedHandler("OPEN_DIFICULTY_DIALOG", field, {
      title: field === "willpower" ? "STATS.WILLPOWER" : "STATS.LEGEND",
    });
  };

  return (
    <div className="willpower-legend">
      <div className="scion-label-title">
        <h2>{localize("STATS.WILLPOWER_LEGEND")}</h2>
      </div>
      <div className="willpower-legend-wrapper">
        <div className="willpower">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="scion-label-subtitle"
            data-type="willpower"
            data-action="roll-willpower"
            onClick={() => callDialog("willpower")}
          >
            <h2>{localize("STATS.WILLPOWER")}</h2>
          </div>
          <div className="points">
            <Shape
              min={willpowerLegend.willpower.min}
              max={willpowerLegend.willpower.max}
              value={willpowerLegend.willpower.value}
              type="circles"
              onShapeChange={(value) =>
                handleWillpowerLegend("willpower", value)
              }
            />
            <Shape
              min={willpowerLegend.willpowerPoints.min}
              max={willpowerLegend.willpowerPoints.max}
              value={willpowerLegend.willpowerPoints.value}
              type="squares"
              onShapeChange={(value) =>
                handleWillpowerLegend("willpowerPoints", value)
              }
            />
          </div>
        </div>
        <div className="legend">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="scion-label-subtitle"
            data-type="legend"
            data-action="roll-legend"
            onClick={() => callDialog("legend")}
          >
            <h2>{localize("STATS.LEGEND")}</h2>
          </div>
          <div className="points">
            <Shape
              min={willpowerLegend.legend.min}
              max={willpowerLegend.legend.max}
              value={willpowerLegend.legend.value}
              type="circles"
              onShapeChange={(value) => handleWillpowerLegend("legend", value)}
            />
            <div className="point-to-spend">
              <span>{localize("LABELS.POINTS")}:</span>
              <span>{multiply(willpowerLegend.legend.value, 4)}</span>
              <input
                type="number"
                data-action="legend-point-change"
                min={willpowerLegend.legendPoints.min}
                max={willpowerLegend.legendPoints.max}
                value={willpowerLegend.legendPoints.value}
                onChange={(event) =>
                  handleWillpowerLegend("legendPoints", event.target.value)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Armor = ({ data }) => {
  const dispatch = useDispatch();
  const [combat, setCombat] = useState({
    dodgeDV: { value: data.combat.dodgeDV.value },
    parryDV: { value: data.combat.parryDV.value },
    soak: {
      Bashing: { value: data.combat.soak.Bashing.value },
      Lethal: { value: data.combat.soak.Lethal.value },
      Aggravated: { value: data.combat.soak.Aggravated.value },
    },
    armor: {
      name: { value: data.combat.armor.name.value },
      Bashing: { value: data.combat.armor.Bashing.value },
      Lethal: { value: data.combat.armor.Lethal.value },
      Aggravated: { value: data.combat.armor.Aggravated.value },
    },
  });

  useEffect(() => {
    setCombat({
      dodgeDV: { value: data.combat.dodgeDV.value },
      parryDV: { value: data.combat.parryDV.value },
      soak: {
        Bashing: { value: data.combat.soak.Bashing.value },
        Lethal: { value: data.combat.soak.Lethal.value },
        Aggravated: { value: data.combat.soak.Aggravated.value },
      },
      armor: {
        name: { value: data.combat.armor.name.value },
        Bashing: { value: data.combat.armor.Bashing.value },
        Lethal: { value: data.combat.armor.Lethal.value },
        Aggravated: { value: data.combat.armor.Aggravated.value },
      },
    });
  }, [data.combat]);

  const debouncedHandler = useMemo(
    () =>
      _debounce(async (type, field, value) => {
        dispatch({
          type,
          payload: {
            field,
            value,
          },
        });
      }, 500),
    [data.combat],
  );

  const handleCombatInput = (event) => {
    const { value } = event.target;
    const fields = event.target.dataset.field.split(".");

    setCombat((prevData) => {
      let data = { ...prevData };

      if (fields.length === 2) {
        data = {
          ...data,
          [fields[0]]: {
            ...data[fields[0]],
            [fields[1]]: {
              ...data[fields[0]][fields[1]],
              value,
            },
          },
        };
      } else {
        data = {
          ...data,
          [fields[0]]: {
            ...data[fields[0]],
            value,
          },
        };
      }

      return data;
    });
  };

  const saveInputChanges = (event) => {
    const { value } = event.target;
    const { field } = event.target.dataset;
    const newField = `system.combat.${field}.value`;

    debouncedHandler("SET_UPDATE_ARMOR", newField, value);
  };

  const callDialog = () => {
    debouncedHandler("OPEN_DIFICULTY_DIALOG", "battle", {
      title: "LABELS.JOIN_BATTLE",
    });
  };

  return (
    <div className="combat-armor">
      <div className="scion-label-title">
        <h2>{localize("STATS.COMBAT_SOAK_ARMOR")}</h2>
      </div>
      <div className="join-battle">
        <button data-action="join-battle" onClick={callDialog}>
          {localize("LABELS.JOIN_BATTLE")}
        </button>
      </div>
      <div className="combat-armor-grid">
        <div className="combat-armor-grid-item">
          <div className="scion-label-small-subtitle">
            <h2>{localize("STATS.DEFENSE_VALUES")}</h2>
          </div>
          <div className="defense-value-dodge">
            <span>{localize("STATS.DODGE")}:</span>
            <input
              type="text"
              data-field="dodgeDV"
              data-action="defense-value-update"
              placeholder={localize("LABELS.VALUE")}
              value={combat.dodgeDV.value}
              onChange={handleCombatInput}
              onBlur={saveInputChanges}
            />
          </div>
          <div className="defense-value-parry">
            <span>{localize("STATS.PARRY")}:</span>
            <input
              type="text"
              data-field="parryDV"
              data-action="defense-value-update"
              placeholder={localize("LABELS.VALUE")}
              value={combat.parryDV.value}
              onChange={handleCombatInput}
              onBlur={saveInputChanges}
            />
          </div>
        </div>
        <div className="combat-armor-grid-item">
          <div className="scion-label-small-subtitle">
            <h2>{localize("STATS.ARMOR")}</h2>
          </div>
          <div className="armor-wrapper">
            <div className="armor-name">
              <input
                type="text"
                placeholder={localize("LABELS.ARMOR_NAME")}
                data-field="armor.name"
                data-action="armor-update"
                value={combat.armor.name.value}
                onChange={handleCombatInput}
                onBlur={saveInputChanges}
              />
            </div>
            <div className="armor-stats">
              <div className="aggraveted">
                <span>A</span>
                <input
                  type="text"
                  data-field="armor.Aggravated"
                  data-action="armor-update"
                  value={combat.armor.Aggravated.value}
                  onChange={handleCombatInput}
                  onBlur={saveInputChanges}
                />
              </div>
              <div className="lethal">
                <span>L</span>
                <input
                  type="text"
                  data-field="armor.Lethal"
                  data-action="armor-update"
                  value={combat.armor.Lethal.value}
                  onChange={handleCombatInput}
                  onBlur={saveInputChanges}
                />
              </div>
              <div className="bashing">
                <span>B</span>
                <input
                  type="text"
                  data-field="armor.Bashing"
                  data-action="armor-update"
                  value={combat.armor.Bashing.value}
                  onChange={handleCombatInput}
                  onBlur={saveInputChanges}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="combat-armor-grid-item">
          <div className="scion-label-small-subtitle">
            <h2>{localize("STATS.SOAK")}</h2>
          </div>
          <div className="soak-wrapper">
            <div className="armor-stats">
              <div className="aggraveted">
                <span>A</span>
                <input
                  type="text"
                  value={combat.soak.Aggravated.value}
                  disabled
                />
              </div>
              <div className="lethal">
                <span>L</span>
                <input type="text" value={combat.soak.Lethal.value} disabled />
              </div>
              <div className="bashing">
                <span>B</span>
                <input type="text" value={combat.soak.Bashing.value} disabled />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Health = ({ data }) => {
  const dispatch = useDispatch();

  const [health, setHealth] = useState({
    conditions: {
      Bruised: {
        value: data.health.conditions.Bruised.value,
        damageType: data.health.conditions.Bruised.damageType,
      },
      Hurt: {
        value: data.health.conditions.Hurt.value,
        damageType: data.health.conditions.Hurt.damageType,
      },
      Injured: {
        value: data.health.conditions.Injured.value,
        damageType: data.health.conditions.Injured.damageType,
      },
      Wounded: {
        value: data.health.conditions.Wounded.value,
        damageType: data.health.conditions.Wounded.damageType,
      },
      Maimed: {
        value: data.health.conditions.Maimed.value,
        damageType: data.health.conditions.Maimed.damageType,
      },
      Crippled: {
        value: data.health.conditions.Crippled.value,
        damageType: data.health.conditions.Crippled.damageType,
      },
      Incapacitated: {
        value: data.health.conditions.Incapacitated.value,
        damageType: data.health.conditions.Incapacitated.damageType,
      },
    },
  });

  useEffect(() => {
    setHealth({
      conditions: {
        Bruised: {
          value: data.health.conditions.Bruised.value,
          damageType: data.health.conditions.Bruised.damageType,
        },
        Hurt: {
          value: data.health.conditions.Hurt.value,
          damageType: data.health.conditions.Hurt.damageType,
        },
        Injured: {
          value: data.health.conditions.Injured.value,
          damageType: data.health.conditions.Injured.damageType,
        },
        Wounded: {
          value: data.health.conditions.Wounded.value,
          damageType: data.health.conditions.Wounded.damageType,
        },
        Maimed: {
          value: data.health.conditions.Maimed.value,
          damageType: data.health.conditions.Maimed.damageType,
        },
        Crippled: {
          value: data.health.conditions.Crippled.value,
          damageType: data.health.conditions.Crippled.damageType,
        },
        Incapacitated: {
          value: data.health.conditions.Incapacitated.value,
          damageType: data.health.conditions.Incapacitated.damageType,
        },
      },
    });
  }, [data.health]);

  const debouncedHandler = useMemo(
    () =>
      _debounce(async (type, field, value) => {
        dispatch({
          type,
          payload: {
            field,
            value,
          },
        });
      }, 500),
    [data.health],
  );

  const healthHandler = (event) => {
    const key = event.target.dataset.key;
    const { value } = event.target;

    const newValue = value === "__none__" ? "" : value;

    const newData = {
      ...health,
      conditions: {
        ...health.conditions,
        [key]: {
          ...health.conditions[key],
          damageType: newValue,
        },
      },
    };

    setHealth(newData);
    saveHealthState(newData);
  };

  const saveHealthState = (healthData) => {
    debouncedHandler("UPDATE_HEALTH", "", healthData);
  };

  return (
    <div className="health">
      <div className="scion-label-title">
        <h2>{localize("LABELS.HEALTH")}</h2>
      </div>
      <div className="health-line">
        {Object.entries(health.conditions).map(([key, condition]) => (
          <div key={key} className="health-box">
            <span className="penalty">
              {key === "Incapacitated" ? "I" : condition.value}
            </span>
            <select
              data-key={key}
              data-action="change-health-damage"
              value={condition.damageType || "__none__"}
              onChange={healthHandler}
            >
              <option value="__none__">&nbsp;</option>
              <option value="/">&#8260;</option>
              <option value="X">✕</option>
              <option value="*">★</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

const Experience = ({ data }) => {
  const dispatch = useDispatch();

  const [experience, setExperience] = useState({
    value: data.experience.value,
  });

  useEffect(() => {
    setExperience({
      value: data.experience.value,
    });
  }, [data.experience]);

  const debouncedHandler = useMemo(
    () =>
      _debounce(async (type, field, value) => {
        dispatch({
          type,
          payload: {
            field,
            value,
          },
        });
      }, 500),
    [data.experience],
  );

  const handleExperience = (event) => {
    const { value } = event.target;

    setExperience({ value });
  };

  const saveExperience = (event) => {
    const { value } = event.target;
    debouncedHandler("UPDATE_EXPERIENCE", "system.experience.value", value);
  };

  return (
    <div className="experience">
      <div className="scion-label-title">
        <h2>{localize("STATS.EXPERIENCE")}</h2>
      </div>
      <input
        type="text"
        data-action="update-xp"
        value={experience.value}
        onChange={handleExperience}
        onBlur={saveExperience}
      />
    </div>
  );
};

const Combat = () => {
  const { system } = useActor();
  return (
    <>
      <Weapon data={system} />
      <WillpowerLegend data={system} />
      <Armor data={system} />
      <Health data={system} />
      <Experience data={system} />
    </>
  );
};

export default Combat;
