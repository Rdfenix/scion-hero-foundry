import React from "react";
import { useTabs } from "../ActorContext";
import { localize } from "../../utils/i18n";
import "../../styles/nav.scss";

const Nav = () => {
  const { activeTab, setActiveTab } = useTabs();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <nav className="sheet-tabs tabs">
      <button
        type="button"
        className={`item ${activeTab === "stats" ? "active" : ""}`}
        onClick={() => handleTabClick("stats")}
      >
        {localize("LABELS.ATTRIBUTES_ABILITIES")}
      </button>
      <button
        type="button"
        className={`item ${activeTab === "birth" ? "active" : ""}`}
        onClick={() => handleTabClick("birth")}
      >
        {localize("LABELS.BIRTHRIGHTS_VIRTUES")}
      </button>
      <button
        type="button"
        className={`item ${activeTab === "knacks" ? "active" : ""}`}
        onClick={() => handleTabClick("knacks")}
      >
        {localize("LABELS.KNACKS_BOONS")}
      </button>
      <button
        type="button"
        className={`item ${activeTab === "combat" ? "active" : ""}`}
        onClick={() => handleTabClick("combat")}
      >
        {localize("LABELS.COMBAT")}
      </button>
    </nav>
  );
};

export default Nav;
