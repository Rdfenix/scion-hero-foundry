import React from "react";
import { useTabs } from "../ActorContext";
import Stats from "./partials/Stats";
import Birth from "./partials/Birth";
import KnacksBoons from "./partials/KnacksBoons";
import Combat from "./partials/Combat";

const Tabs = {
  stats: Stats,
  birth: Birth,
  knacks: KnacksBoons,
  combat: Combat,
};

const Body = () => {
  const { activeTab } = useTabs();
  const ActiveTab = Tabs[activeTab];

  return (
    <div className="sheet-content">
      {ActiveTab && <ActiveTab />}
    </div>
  );
};

export default Body;
