import React, { useState, useEffect, useMemo } from "react";
import { localize, customLocalizeWord } from "../../../utils/i18n";
import { splitInColumns } from "../../../utils/split";
import { useActor, useDispatch } from "../../ActorContext";
import { _debounce } from "../../../utils/debounce";
import Shape from "./Shape";

import "../../../styles/Stats.scss";

const Attributes = ({ data }) => {
  const dispatch = useDispatch();

  const [attributes, setAttributes] = useState(data.attributes);
  const [epicAttributes, setEpicAttributes] = useState(data.epicAttributes);

  useEffect(() => {
    setAttributes(data.attributes);
    setEpicAttributes(data.epicAttributes);
  }, [data.attributes, data.epicAttributes]);

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
    [data.attributes],
  );

  const changeAtt = (value, type, key) => {
    const newAttr = {
      ...attributes,
      [type]: {
        ...attributes[type],
        [key]: {
          ...attributes[type][key],
          value,
        },
      },
    };
    setAttributes(newAttr);
    debouncedHandler("UPDATE_ATTR", "system.attributes", newAttr);
  };

  const changeEpicAtt = (value, type, key) => {
    const newEpicAttr = {
      ...epicAttributes,
      [type]: {
        ...epicAttributes[type],
        [key]: {
          ...epicAttributes[type][key],
          value,
        },
      },
    };

    setEpicAttributes(newEpicAttr);
    debouncedHandler("UPDATE_ATTR", "system.epicAttributes", newEpicAttr);
  };

  const openDialog = (event) => {
    const { field, type, key } = event.target.dataset;
    debouncedHandler("OPEN_DIFICULTY_DIALOG", field, { type, key });
  };

  return (
    <div className="attributes">
      <div className="scion-label-title">
        <h2>{localize("STATS.ATTRIBUTES")}</h2>
      </div>
      <div className="attributes-types-grid">
        {Object.entries(attributes).map(([type, attributes]) => (
          <div key={type} className="attribute-grid-item">
            <h3>{customLocalizeWord(type, "ATTRIBUTE_TYPES")}</h3>
            {Object.entries(attributes).map(([key, value]) => {
              const epicAttribute = epicAttributes?.[type]?.[key];
              return (
                <div key={key} className="attribute-row">
                  <button
                    className="attribute-column"
                    data-field="attribute"
                    data-type={type}
                    data-key={key}
                    onClick={openDialog}
                  >
                    <span>{customLocalizeWord(key, "ATTRIBUTES")}</span>
                  </button>
                  <div className="attribute-column">
                    <Shape
                      min={value.min}
                      max={value.max}
                      value={value.value}
                      type="circles"
                      onShapeChange={(value) => changeAtt(value, type, key)}
                    />
                    {epicAttribute && (
                      <Shape
                        min={epicAttribute.min}
                        max={epicAttribute.max}
                        value={epicAttribute.value}
                        type="squares"
                        onShapeChange={(value) =>
                          changeEpicAtt(value, type, key)
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const Skills = ({ data }) => {
  const dispatch = useDispatch();

  const [abilities, setAbilities] = useState(data.abilities);

  useEffect(() => {
    setAbilities(data.abilities);
  }, [data.abilities]);

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
    [data.abilities],
  );

  const handleAbilitie = (value, field) => {
    const newAbilitie = {
      ...abilities,
      [field]: {
        ...abilities[field],
        value,
      },
    };

    setAbilities(newAbilitie);
    debouncedHandler("UPDATE_SKILL", "system.abilities", newAbilitie);
  };

  const handleFavorite = (event) => {
    const { key } = event.target.dataset;
    const { checked } = event.target;

    const newAbilitie = {
      ...abilities,
      [key]: {
        ...abilities[key],
        favored: checked,
      },
    };

    setAbilities(newAbilitie);
    debouncedHandler("UPDATE_SKILL", "system.abilities", newAbilitie);
  };

  const openDialog = (skillName) => {
    debouncedHandler("OPEN_DIFICULTY_DIALOG", "ability", {
      skillName,
      title: "STATS.ABILITIES",
    });
  };

  return (
    <div className="skills">
      <div className="scion-label-title">
        <h2>{localize("STATS.ABILITIES")}</h2>
      </div>
      <div className="skills-types-grid">
        {splitInColumns(abilities, 3).map((column, columnIndex) => {
          const columnKey = column.map(([skillName]) => skillName).join("-");

          return (
            <div className="skills-grid-item" key={columnKey}>
              {column.map(([skillName, skillValue]) => (
                <div key={skillName} className="skills-row">
                  <input
                    type="checkbox"
                    className="square-checkbox"
                    checked={skillValue.favored}
                    data-key={skillName}
                    onClick={handleFavorite}
                  />
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                  <div
                    className="skills-column"
                    onClick={() => openDialog(skillName)}
                  >
                    <span>{customLocalizeWord(skillName, "ABILITIES")}</span>
                  </div>
                  <div className="skills-column">
                    <Shape
                      min={skillValue.min}
                      max={skillValue.max}
                      value={skillValue.value}
                      type="circles"
                      onShapeChange={(value) =>
                        handleAbilitie(value, skillName)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Stats = () => {
  const { system } = useActor();

  return (
    <>
      <Attributes data={system} />
      <Skills data={system} />
    </>
  );
};

export default Stats;
