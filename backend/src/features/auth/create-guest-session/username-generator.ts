/**
 * Generates a friendly, readable username
 * Creates a name in the format "[Adjective]-[Noun][Number]" (e.g. "Happy-Lion42")
 *
 * Total possibilities = 100 × 100 × 1000 = 10,000,000
 *
 * @returns A randomly generated username from lists of allowable words + integers
 */
export const generateUsername = (): string => {
  // prettier-ignore
  const adjectives = [
    "Happy", "Brave", "Clever", "Swift", "Gentle", "Jolly", "Kind", "Lively", "Mighty", "Noble",
    "Proud", "Quiet", "Smart", "Witty", "Zesty", "Bold", "Eager", "Calm", "Daring", "Honest",
    "Bright", "Cheerful", "Friendly", "Helpful", "Creative", "Curious", "Dynamic", "Energetic", "Funny", "Graceful",
    "Humble", "Inventive", "Joyful", "Loyal", "Magical", "Nimble", "Optimistic", "Patient", "Radiant", "Sincere",
    "Thoughtful", "Unique", "Vibrant", "Wise", "Wonderful", "Agile", "Balanced", "Cosmic", "Dazzling", "Elegant",
    "Fearless", "Giving", "Harmonious", "Inspiring", "Jubilant", "Keen", "Lucid", "Mindful", "Natural", "Outstanding",
    "Peaceful", "Quick", "Resilient", "Splendid", "Tenacious", "Upbeat", "Valiant", "Whimsical", "Xenial", "Youthful",
    "Zealous", "Ambitious", "Brilliant", "Charismatic", "Diligent", "Excellent", "Fabulous", "Genuine", "Heroic", "Innovative",
    "Jovial", "Knowledgeable", "Luminous", "Magnificent", "Nurturing", "Observant", "Poised", "Quirky", "Refreshing", "Serene"
  ];

  // prettier-ignore
  const nouns = [
    "Lion", "Tiger", "Eagle", "Dolphin", "Wolf", "Falcon", "Panda", "Koala", "Fox", "Owl",
    "Penguin", "Dragon", "Phoenix", "Unicorn", "Bear", "Hawk", "Whale", "Leopard", "Turtle", "Rabbit",
    "Squirrel", "Deer", "Lynx", "Raven", "Otter", "Knight", "Wizard", "Scholar", "Ranger", "Captain",
    "Puma", "Jaguar", "Cobra", "Panther", "Badger", "Beaver", "Cheetah", "Elephant", "Gazelle", "Hedgehog",
    "Ibis", "Jackal", "Kangaroo", "Lemur", "Mongoose", "Narwhal", "Ocelot", "Platypus", "Quokka", "Rhino",
    "Samurai", "Titan", "Voyager", "Warrior", "Explorer", "Archer", "Bard", "Cleric", "Druid", "Enchanter",
    "Paladin", "Sorcerer", "Alchemist", "Hunter", "Guardian", "Ninja", "Pirate", "Viking", "Nomad", "Sage",
    "Oracle", "Griffin", "Pegasus", "Mermaid", "Centaur", "Sphinx", "Kraken", "Hydra", "Chimera", "Minotaur",
    "Cyclops", "Gorgon", "Harpy", "Leviathan", "Werewolf", "Vampire", "Ghost", "Phantom", "Specter", "Wraith"
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);

  return `${randomAdjective}-${randomNoun}${randomNumber}`;
};
