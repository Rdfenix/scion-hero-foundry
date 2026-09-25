import React from "react";
import Header from "./components/Header";
import Body from "./components/Body";
import { useActor } from "./ActorContext";

const CharacterSheet = () => {
  const actor = useActor();

  return (
    <div className="scion-wrapper" id={`scion-sheet-${actor.id}`}>
      <Header />
      <Body />
    </div>
  );
};

export default CharacterSheet;
