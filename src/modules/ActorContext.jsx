import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

import { reducer, updateSoak } from "./reducer";

const ActorContext = createContext(null);

export const ActorProvider = ({ actor, context, children }) => {
  const [activeTab, setActiveTab] = useState(context.tabs?.primary || "stats");

  const dispatch = useCallback(
    async (action) => {
      const actorUpdate = await reducer(action, actor);

      if (foundry.utils.isEmpty(actorUpdate)) return;

      const updatedActor = await actor.update(actorUpdate);

      if (action.type === "UPDATE_ATTR") {
        await updateSoak(updatedActor);
      }

      return updatedActor;
    },
    [actor],
  );

  const value = useMemo(
    () => ({ actor, context, activeTab, setActiveTab, dispatch }),
    [actor, context, activeTab, dispatch],
  );

  return (
    <ActorContext.Provider value={value}>{children}</ActorContext.Provider>
  );
};

export const useActor = () => {
  const value = useContext(ActorContext);
  if (!value) {
    throw new Error("useActor must be used within an ActorProvider");
  }
  return value.actor;
};

export const useSheetContext = () => {
  const value = useContext(ActorContext);

  if (!value) {
    throw new Error("useSheetContext must be used within an ActorProvider");
  }

  return value.context;
};

export const useTabs = () => {
  const value = useContext(ActorContext);
  if (!value) {
    throw new Error("useTabs must be used within an ActorProvider");
  }
  return { activeTab: value.activeTab, setActiveTab: value.setActiveTab };
};

export const useDispatch = () => {
  const value = useContext(ActorContext);
  if (!value)
    throw new Error("useDispatch must be used within an ActorProvider");
  return value.dispatch;
};
