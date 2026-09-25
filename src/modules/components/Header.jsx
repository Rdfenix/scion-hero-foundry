import React, { useState, useEffect } from "react";
import { useActor, useSheetContext, useDispatch } from "../ActorContext";
import { localize } from "../../utils/i18n";
import Nav from "./Nav";

import "../../styles/header.scss";

const Header = () => {
  const actor = useActor();
  const context = useSheetContext();
  const dispatch = useDispatch();
  const INVISIBLE_CHAR = "\u200B";
  const [formData, setFormData] = useState({
    name: actor.name === INVISIBLE_CHAR ? "" : actor.name,
    "system.player":
      actor.system?.player || game.user?.name || context.currentUserName || "",
    "system.calling": actor.system?.calling || "",
    "system.nature": actor.system?.nature || "",
    "system.pantheon.name": actor.system?.pantheon?.name || "",
    "system.pantheon.god": actor.system?.pantheon?.god || "",
  });

  useEffect(() => {
    setFormData({
      name: actor.name === INVISIBLE_CHAR ? "" : actor.name,
      "system.player":
        actor.system?.player ||
        game.user?.name ||
        context.currentUserName ||
        "",
      "system.calling": actor.system?.calling || "",
      "system.nature": actor.system?.nature || "",
      "system.pantheon.name": actor.system?.pantheon?.name || "",
      "system.pantheon.god": actor.system?.pantheon?.god || "",
    });
  }, [
    actor,
    actor.name,
    actor.system?.player,
    actor.system?.calling,
    actor.system?.nature,
    actor.system?.pantheon?.name,
    actor.system?.pantheon?.god,
    context.currentUserName,
  ]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const saveFormData = (event) => {
    const { name } = event.target;
    const value = formData[name];

    const finalValue =
      name === "name" && value.trim() === "" ? INVISIBLE_CHAR : value;

    dispatch({
      type: "SET_UPDATE_HEADER",
      payload: {
        field: name,
        value: finalValue,
      },
    });
  };

  const openDialog = (event) => {
    const { action } = event.target.dataset;
    dispatch({
      type: action === "pantheon" ? "OPEN_PANTHEON_DIALOG" : "OPEN_GOD_DIALOG",
      payload: {},
    });
  };

  return (
    <header className="sheet-header">
      <div className="scion-header">
        <h1>{localize("HERO")}</h1>
      </div>

      <div className="profile-image">
        <img
          className="profile"
          src={actor.img}
          data-action="editImage"
          data-edit="img"
          title={actor.name}
          width="135"
          height="135"
          alt={actor.name}
        />
      </div>

      <div className="sheet-header-character-info">
        <div className="column">
          <div className="row">
            <div className="column">
              <label htmlFor="name">{localize("HEADER.NAME")}</label>
              <input
                type="text"
                id="name"
                className="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={saveFormData}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <label htmlFor="player">{localize("HEADER.PLAYER")}</label>
              <input
                type="text"
                id="player"
                name="system.player"
                value={formData["system.player"]}
                placeholder=""
                onChange={handleInputChange}
                onBlur={saveFormData}
              />
            </div>
          </div>
        </div>
        <div className="column">
          <div className="row">
            <div className="column">
              <label htmlFor="calling">{localize("HEADER.CALLING")}</label>
              <input
                type="text"
                id="calling"
                name="system.calling"
                value={formData["system.calling"]}
                placeholder=""
                onChange={handleInputChange}
                onBlur={saveFormData}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <label htmlFor="nature">{localize("HEADER.NATURE")}</label>
              <input
                type="text"
                id="nature"
                name="system.nature"
                value={formData["system.nature"]}
                placeholder=""
                onChange={handleInputChange}
                onBlur={saveFormData}
              />
            </div>
          </div>
        </div>
        <div className="column">
          <div className="row">
            <div className="column">
              <label htmlFor="pantheon">{localize("HEADER.PANTHEON")}</label>
              <input
                type="text"
                id="pantheon"
                name="system.pantheon.name"
                value={formData["system.pantheon.name"]}
                data-field="name"
                data-action="update-pantheon-name"
                placeholder=""
                onChange={handleInputChange}
                onBlur={saveFormData}
              />

              {actor.system?.pantheon?.logo && (
                <div className="pantheon-image">
                  <img src={actor.system?.pantheon?.logo} alt="pantheon logo" />
                </div>
              )}
            </div>
            <button
              type="button"
              className="scion-pantheon-button"
              data-action="pantheon"
              onClick={openDialog}
            >
              <i className="fa fa-book" aria-hidden="true"></i>
            </button>
          </div>
          <div className="row">
            <div className="column">
              <label htmlFor="god">{localize("HEADER.GOD")}</label>
              <input
                type="text"
                id="god"
                name="system.pantheon.god"
                value={formData["system.pantheon.god"]}
                data-action="update-pantheon-god"
                data-field="god"
                placeholder=""
                onChange={handleInputChange}
                onBlur={saveFormData}
              />
            </div>
            <button
              type="button"
              className="scion-pantheon-button"
              data-action="god"
              onClick={openDialog}
            >
              <i className="fa fa-book" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
      <Nav />
    </header>
  );
};

export default Header;
