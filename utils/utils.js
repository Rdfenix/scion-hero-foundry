export const cleanString = str => {
  return str
    .normalize('NFD') // Decompõe os caracteres acentuados (ex: 'á' vira 'a' + '´')
    .replaceAll(/[\u0300-\u036f]/g, '') // Remove apenas os acentos (os "sinais")
    .replaceAll(/[^a-zA-Z0-9\s]/g, '');
};

export const mountGodsList = async gods =>
  gods.map(god => ({
    name: god.name,
    favoredSkills: (god.favoredSkills || []).reduce((obj, skill, idx) => {
      obj[idx] = skill;
      return obj;
    }, {}),
  }));

export const mountFavoritiesSkills = async (deityPantheon, actor) => {
  const abilities = foundry.utils.getProperty(actor.system, 'abilities');
  const favoredSkillsArr = Object.values(deityPantheon.favoredSkills);
  const updatedAbilities = {};

  for (const [key, value] of Object.entries(abilities)) {
    updatedAbilities[key] = {
      ...value,
      favored: favoredSkillsArr.includes(key),
    };
  }

  return updatedAbilities;
};
