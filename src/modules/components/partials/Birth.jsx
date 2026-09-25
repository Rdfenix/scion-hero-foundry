import React, { useState, useEffect, useMemo } from "react";
import { localize } from "../../../utils/i18n";
import { useActor, useDispatch } from "../../ActorContext";
import { _debounce } from "../../../utils/debounce";
import Shape from "./Shape";

import "../../../styles/birth.scss";

const Birthright = ({ data }) => {
  const dispatch = useDispatch();
  const birthrightTypes = Object.values(data.birthrightTypes ?? {});

  const [birthrights, setBirthrights] = useState(data.birthrights);
  const [birthrightType, setBirthrightType] = useState("");

  useEffect(() => {
    setBirthrights(data.birthrights);
  }, [data.birthrights]);

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
    [data.birthrights],
  );

  const birthrightTypeHandler = (event) => {
    event.stopPropagation();
    event.nativeEvent?.stopImmediatePropagation();
    const { value } = event.target;

    setBirthrightType(value);
  };

  const birthrightHandler = (event) => {
    const { field, index } = event.target.dataset;
    const { value } = event.target;

    const newBirths = birthrights.map((birthright, birthrightIndex) =>
      String(birthrightIndex) === index
        ? { ...birthright, [field]: value }
        : birthright,
    );

    setBirthrights(newBirths);
  };

  const birthBoonHandler = (event) => {
    const { birthIndex, boonIndex, field } = event.target.dataset;
    const { value } = event.target;

    const births = birthrights.map((birthright, birthrightIndex) =>
      Number(birthrightIndex) === Number(birthIndex)
        ? {
            ...birthright,
            boons: (birthright.boons ?? []).map((boon, index) =>
              Number(index) === Number(boonIndex)
                ? { ...boon, [field]: value }
                : boon,
            ),
          }
        : birthright,
    );

    setBirthrights(births);
  };

  const updateBirthLevel = (index, value) => {
    const newBirths = birthrights.map((birthright, birthrightIndex) =>
      birthrightIndex === index
        ? {
            ...birthright,
            level: {
              ...birthright.level,
              value,
            },
          }
        : birthright,
    );

    setBirthrights(newBirths);
    debouncedHandler("UPDATE_BIRTH", "", newBirths);
  };

  const updateBirthright = () => {
    debouncedHandler("UPDATE_BIRTH", "", birthrights);
  };

  const addBirthright = () => {
    debouncedHandler("ADD_BIRTH", birthrightType, "");
    setBirthrightType("");
  };

  const addBoon = (event) => {
    const { index } = event.target.dataset;
    debouncedHandler("ADD_BOON_BIRTH", index, "");
  };

  const deleteBirth = (event) => {
    const { birthId } = event.target.dataset;

    const births = birthrights.filter((birth) => birth._id !== birthId);

    debouncedHandler("UPDATE_BIRTH", "", births);
  };

  const deleteBoon = (event) => {
    const { birthId, boonId } = event.target.dataset;
    const births = birthrights.map((birth) =>
      birth._id === birthId
        ? {
            ...birth,
            boons: (birth.boons || []).filter((boon) => boon._id !== boonId),
          }
        : birth,
    );

    debouncedHandler("UPDATE_BIRTH", "", births);
  };

  return (
    <div className="birth">
      <div className="scion-label-title">
        <h2>{localize("STATS.BIRTHRIGHTS")}</h2>
      </div>
      <div className="birth-wrapper">
        <div className="births">
          <ul>
            {birthrights.map((birthright, index) => (
              <li key={birthright?._id ?? index}>
                <div className="birthright-input-area">
                  <button
                    className="delete-button delete-button--absolute"
                    data-action="delete-birthright"
                    data-birth-id={birthright._id}
                    onClick={deleteBirth}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  <div className="row">
                    <div className="birthright-name">
                      <input
                        type="text"
                        placeholder={localize("LABELS.BIRTHRIGHT")}
                        value={birthright.name}
                        data-action="update-birthright-name"
                        data-field="name"
                        data-index={index}
                        onChange={birthrightHandler}
                        onBlur={updateBirthright}
                      />
                    </div>
                    <div className="types">
                      <span>{localize("LABELS.TYPE")}</span>
                      <span className="birth-type">{birthright.type}</span>
                    </div>
                    <div className="birthright-level">
                      <span>{localize("LABELS.LEVEL")}</span>
                      <Shape
                        min={birthright.level.min}
                        max={birthright.level.max}
                        value={birthright.level.value}
                        type="circles"
                        onShapeChange={(value) =>
                          updateBirthLevel(index, value)
                        }
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="birthright-description">
                      <span>{localize("LABELS.DESCRIPTION")}:</span>
                      <textarea
                        data-action="update-birthright-description"
                        data-field="description"
                        data-index={index}
                        defaultValue={birthright.description || ""}
                        onChange={birthrightHandler}
                        onBlur={updateBirthright}
                      />
                      {birthright?.boons && (
                        <div
                          className="boons-area"
                          data-drop-target="birth-boons-list"
                          data-index={index}
                        >
                          <span>{localize("STATS.BOONS")}:</span>
                          <ul>
                            {birthright.boons.map((boon, bonnIndex) => (
                              <li key={boon?._id}>
                                <input
                                  type="text"
                                  value={boon.name}
                                  data-field="name"
                                  data-birth-index={index}
                                  data-boon-index={bonnIndex}
                                  data-action="update-birthright-boon"
                                  placeholder={localize("LABELS.BOON_NAME")}
                                  onChange={birthBoonHandler}
                                  onBlur={updateBirthright}
                                />
                                <span>{localize("LABELS.LEVEL")}:</span>
                                <input
                                  type="text"
                                  value={boon.level}
                                  data-field="level"
                                  data-birth-index={index}
                                  data-boon-index={bonnIndex}
                                  data-action="update-birthright-boon"
                                  placeholder={localize("LABELS.LEVEL")}
                                  onChange={birthBoonHandler}
                                  onBlur={updateBirthright}
                                />
                                <button
                                  className="delete-button delete-button--inline"
                                  data-action="delete-birth-boon"
                                  data-birth-id={birthright._id}
                                  data-boon-id={boon._id}
                                  onClick={deleteBoon}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </li>
                            ))}
                          </ul>
                          <button
                            data-action="button-birthright-boon"
                            data-index={index}
                            onClick={addBoon}
                          >
                            {localize("LABELS.ADD_BOON")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="button">
          <div className="birthright-types">
            <label htmlFor="birthright-type">
              {localize("LABELS.CHOOSE_THE_TYPE")}
            </label>
            <select
              name=""
              id="birthright-type"
              data-action="select-birthright-type"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={birthrightTypeHandler}
              onKeyDown={(event) => event.stopPropagation()}
              value={birthrightType}
            >
              <option value="" disabled selected>
                {localize("LABELS.SELECT_TYPE_OF_BIRTHRIGHT")}
              </option>
              {birthrightTypes.map((birthrightType) => (
                <option key={birthrightType.type} value={birthrightType.type}>
                  {birthrightType.type}
                </option>
              ))}
            </select>
          </div>
          <button data-action="button-birthright-type" onClick={addBirthright}>
            {localize("LABELS.ADD_BIRTHRIGHT")}
          </button>
        </div>
      </div>
    </div>
  );
};

const Virtues = ({ data }) => {
  const dispatch = useDispatch();

  const [virtues, setVirtues] = useState(data.virtues);

  useEffect(() => {
    setVirtues(data.virtues);
  }, [data.virtues]);

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
    [data.virtues],
  );

  const updateVirtueField = (event) => {
    const { field } = event.target.dataset;
    const { value } = event.target;

    const newVirtues = {
      ...virtues,
      [field]: {
        ...virtues[field],
        name: value,
      },
    };

    setVirtues(newVirtues);
  };

  const saveVirtue = () => {
    debouncedHandler("UPDATE_VIRTUE", "", virtues);
  };

  const updateVirtueLevel = (field, value) => {
    const newVirtues = {
      ...virtues,
      [field]: {
        ...virtues[field],
        value: value,
      },
    };

    setVirtues(newVirtues);

    debouncedHandler("UPDATE_VIRTUE", "", newVirtues);
  };

  return (
    <div className="virtues">
      <div className="scion-label-title">
        <h2>{localize("STATS.VIRTUES")}</h2>
      </div>
      <div className="virtues-wrapper">
        {Object.entries(virtues).map(([key, attr]) => (
          <div className="virtues-row" key={key}>
            <div className="virtues-column">
              <input
                type="text"
                data-action="update-virtue-field"
                data-field={key}
                value={attr.name}
                placeholder={localize("LABELS.VIRTUE")}
                onChange={updateVirtueField}
                onBlur={saveVirtue}
              />
            </div>
            <div className="virtues-column">
              <Shape
                min={attr.min}
                max={attr.max}
                value={attr.value}
                type="circles"
                onShapeChange={(value) => updateVirtueLevel(key, value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Birth = () => {
  const { system } = useActor();
  return (
    <>
      <Birthright data={system} />
      <Virtues data={system} />
    </>
  );
};

export default Birth;
