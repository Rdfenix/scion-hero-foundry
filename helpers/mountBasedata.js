export const mountingBasedata = (dataActorDefault, actor) => {
  return foundry.utils.mergeObject(
    foundry.utils.deepClone(dataActorDefault),
    actor.system || {}
  );
};
