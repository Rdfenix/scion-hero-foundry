import React from "react";
import { useTabs } from "../ActorContext";
import Stats from "./partials/Stats";
import Birth from "./partials/Birth";
import KnacksBoons from "./partials/KnacksBoons";
import Combat from "./partials/Combat";

const Body = () => {
  const { activeTab } = useTabs();

  return (
    <div className="sheet-content">
      {activeTab === "stats" && <Stats />}
      {activeTab === "birth" && <Birth />}
      {activeTab === "knacks" && <KnacksBoons />}
      {activeTab === "combat" && <Combat />}
    </div>
  );
};

export default Body;
