import Game from "../models/game-model.js";
import Word from "../models/word-model.js";

// Default game settings object
const defaultGameSettings = {
  numberOfCards: 25,
  startingWithTeam: "green",
  numberOfAssassins: 1,
};

/**
 * Generates an array of colors to be allocated randomly to the game words for any number of total cards
 * @param {Object} settings - Game settings.
 * @param {String} otherTeam - The other team's color.
 * @returns {Array} - Array of colors.
 */
const generateColorsToAllocate = (settings, otherTeam) => {
  // Calculate the number of non-team, starting team, other team, assassin, and bystander cards
  // uses the same ratio as used in the default game settings
  const numberOfCardsNonTeam = Math.round((8 / 25) * settings.numberOfCards);
  const numberOfCardsStartingTeam = Math.ceil(
    (settings.numberOfCards - numberOfCardsNonTeam) / 2,
  );
  const numberOfCardsOtherTeam = Math.floor(
    (settings.numberOfCards - numberOfCardsNonTeam) / 2,
  );
  const numberOfCardsAssassins = settings.numberOfAssassins;
  const numberOfCardsBystander =
    settings.numberOfCards -
    numberOfCardsStartingTeam -
    numberOfCardsOtherTeam -
    numberOfCardsAssassins;

  // Create an array of colors based on the calculated numbers
  return Array(numberOfCardsStartingTeam)
    .fill(settings.startingWithTeam)
    .concat(
      Array(numberOfCardsOtherTeam).fill(otherTeam),
      Array(numberOfCardsAssassins).fill("black"),
      Array(numberOfCardsBystander).fill("blue"),
    );
};

/**
 * Creates a new game with the specified or default settings.
 * @param {Object} gameSettings - Custom game settings.
 * @returns {Object} - The newly created game.
 */
export async function createNewGame (gameSettings = defaultGameSettings) {
  // Merge custom settings with default settings
  const settings = { ...defaultGameSettings, ...gameSettings };
  console.log("default game settings: ", defaultGameSettings);
  console.log("passed in settings: ", gameSettings);
  console.log("final game settings: ", settings);
  const otherTeam = settings.startingWithTeam === "green" ? "red" : "green";
  const colorsToAllocate = generateColorsToAllocate(settings, otherTeam);

  try {
    const words = await getRandomWords(settings.numberOfCards);

    if (!words || words.length === 0) {
      throw new Error("No words found, please populate the database.");
    }

    // Assign colors to the fetched words randomly
    const gameWords = words.map((word) => {
      const randomIndex = Math.floor(Math.random() * colorsToAllocate.length);
      const wordColor = colorsToAllocate.splice(randomIndex, 1)[0];
      return { word: word.word, color: wordColor };
    });

    // Create a new game document with the settings and words
    const newGame = new Game({
      settings: settings,
      state: { words: gameWords },
    });

    // Save the new game to the database
    await newGame.save();
    return newGame;
  } catch (error) {
    // Handle errors during game creation
    throw new Error(`Failed to create new game: ${error.message}`);
  }
};

const getRandomWords = (numberOfWords) => {
  return new Promise((resolve, reject) => {
    Word.findRandom({}, {}, { limit: numberOfWords }, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};
