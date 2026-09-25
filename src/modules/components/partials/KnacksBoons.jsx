import React, { useState, useEffect, useMemo } from "react";
import { localize } from "../../../utils/i18n";
import { useActor, useDispatch } from "../../ActorContext";
import RichTextEditor from "../RichTextEditor";
import { _debounce } from "../../../utils/debounce";

import "../../../styles/knacks-boons.scss";

const Knacks = ({ data }) => {
  const dispatch = useDispatch();
  const [knacks, setKnacks] = useState(data.knacks);

  useEffect(() => {
    setKnacks(data.knacks);
  }, [data.knacks]);

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
    [data.knacks],
  );

  const handleKnacks = (value, id, field) => {
    setKnacks((prev) =>
      prev.map((knack) =>
        knack._id === id ? { ...knack, [field]: value } : knack,
      ),
    );
  };

  const addKack = () => {
    debouncedHandler("ADD_KNACK");
  };

  const updateKnack = (id, field, value) => {
    const nextKnacks = knacks.map((item) =>
      item._id === id ? { ...item, [field]: value } : item,
    );

    debouncedHandler("UPDATE_KNACK", "", nextKnacks);
  };

  const deleteKnack = (event) => {
    const { knackId } = event.target.dataset;
    const newList = knacks.filter((knack) => knack._id !== knackId);
    debouncedHandler("UPDATE_KNACK", "", newList);
  };

  return (
    <div className="knacks">
      <div className="scion-label-title">
        <h2>{localize("STATS.KNACKS")}</h2>
      </div>
      <div className="knacks-wrapper">
        <div className="knack-list" data-drop-target="knack-list">
          <ul>
            {knacks.map((knack, index) => (
              <li key={knack._id}>
                {/* Área de texto da descrição -- input text */}
                <RichTextEditor
                  value={knack.name}
                  placeholder={localize("LABELS.KNACK")}
                  className="rich-text-editor--name"
                  onChange={(html) => handleKnacks(html, knack._id, "name")}
                  onBlur={(html) => updateKnack(knack._id, "name", html)}
                />
                {/* Área de texto da descrição -- TextArea */}
                <RichTextEditor
                  value={knack.description}
                  placeholder={localize("LABELS.DESCRIPTION")}
                  className="rich-text-editor--description"
                  onChange={(html) =>
                    handleKnacks(html, knack._id, "description")
                  }
                  onBlur={(html) => updateKnack(knack._id, "description", html)}
                />
                <button
                  className="delete-button delete-button--absolute"
                  data-action="delete-knack"
                  data-knack-id={knack._id}
                  onClick={deleteKnack}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button data-action="button-knack-add" onClick={addKack}>
          {localize("LABELS.ADD_KNACK")}
        </button>
      </div>
    </div>
  );
};

const Boons = ({ data }) => {
  const dispatch = useDispatch();
  const [boons, setBoons] = useState(data.boons);

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
    [data.boons],
  );

  useEffect(() => {
    setBoons(data.boons);
  }, [data.boons]);

  const boonHandleRichText = (value, id, field) => {
    setBoons((prevData) =>
      prevData.map((item) =>
        item._id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const boonHadler = (event) => {
    const { boonId, field } = event.target.dataset;
    const { value } = event.target;

    setBoons((prevData) =>
      prevData.map((item) =>
        item._id === boonId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const updateBoon = () => {
    debouncedHandler("UPDATE_BOONS", "", boons);
  };

  const addBoon = () => {
    debouncedHandler("ADD_BOON", "", "");
  };

  const deleteBoon = (event) => {
    const { boonId } = event.target.dataset;
    const data = boons.filter((boon) => boon._id !== boonId);

    debouncedHandler("UPDATE_BOONS", "", data);
  };

  return (
    <div className="boons">
      <div className="scion-label-title">
        <h2>{localize("STATS.BOONS")}</h2>
      </div>
      <div className="boons-wrapper">
        <div className="boons" data-drop-target="boons-list">
          <ul className="boon-list">
            {boons.map((boon, index) => (
              <li key={boon._id}>
                <div className="boom-name-level">
                  <div className="boon-name">
                    {/* Área de texto da descrição -- input text */}
                    <RichTextEditor
                      value={boon.name}
                      placeholder={localize("LABELS.BOON_NAME")}
                      data-index={index}
                      data-boon-id={boon._id}
                      data-field="name"
                      className="rich-text-editor--name"
                      onChange={(value) =>
                        boonHandleRichText(value, boon._id, "name")
                      }
                      onBlur={updateBoon}
                    />
                  </div>
                  <div className="boon-level">
                    <span>{localize("LABELS.LEVEL")}:</span>
                    {/* Área de texto da descrição -- input text */}
                    <RichTextEditor
                      value={boon.level}
                      placeholder={localize("LABELS.BOON_LEVEL")}
                      data-index={index}
                      data-boon-id={boon._id}
                      data-field="level"
                      className="rich-text-editor--name"
                      onChange={(value) =>
                        boonHandleRichText(value, boon._id, "level")
                      }
                      onBlur={updateBoon}
                    />
                  </div>
                </div>
                <div className="boon-dice-pool">
                  <span>{localize("LABELS.DICE_POOL")}:</span>
                  {/* Área de texto da descrição -- input text */}
                  <RichTextEditor
                    value={boon.dice_pool}
                    placeholder={localize("LABELS.DICE_POOL")}
                    data-index={index}
                    data-boon-id={boon._id}
                    data-field="dice_pool"
                    className="rich-text-editor--name"
                    onChange={(value) =>
                      boonHandleRichText(value, boon._id, "dice_pool")
                    }
                    onBlur={updateBoon}
                  />
                </div>
                <div className="boon-cost">
                  <span>{localize("LABELS.COST")}:</span>
                  <input
                    type="text"
                    value={boon.cost}
                    placeholder={localize("LABELS.BOON_COST")}
                    data-boon-id={boon._id}
                    data-field="cost"
                    data-action="boon-change"
                    onChange={boonHadler}
                    onBlur={updateBoon}
                  />
                </div>
                <div className="boon-description">
                  {/* Área de texto da descrição -- TextArea */}
                  <RichTextEditor
                    value={boon.description}
                    placeholder={localize("LABELS.DESCRIPTION")}
                    data-index={index}
                    data-boon-id={boon._id}
                    data-field="description"
                    className="rich-text-editor--description"
                    onChange={(value) =>
                      boonHandleRichText(value, boon._id, "description")
                    }
                    onBlur={updateBoon}
                  />
                </div>
                <button
                  className="delete-button delete-button--absolute"
                  data-action="delete-boon"
                  data-boon-id={boon._id}
                  onClick={deleteBoon}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button data-action="button-boon-add" onClick={addBoon}>
          {localize("LABELS.ADD_BOON")}
        </button>
      </div>
    </div>
  );
};

const KnacksBoons = () => {
  const { system } = useActor();
  return (
    <>
      <Knacks data={system} />
      <Boons data={system} />
    </>
  );
};

export default KnacksBoons;
