// Constants for game stages and teams:
const STAGE = {
  INTRO: "INTRO",
  PLAYING: "PLAYING",
  COMPLETED: "COMPLETED",
};

const TEAM = {
  RED: "RED",
  GREEN: "GREEN",
  ASSASSIN: "ASSASSIN",
  BYSTANDER: "BYSTANDER",
};

// Example game object with only one round (currentRound = 1)
const newGameObj = {
  // Global game state: overall stage and pointer to the current round.
  state: {
    stage: STAGE.INTRO, // Game is in the INTRO stage.
    currentRound: 1, // Currently, only round 1 is active.
  },
  // Rounds array: only one round is included since currentRound is 1.
  rounds: [
    {
      roundNumber: 1, // This is the first (and only) round
      // Cards specific to round 1:
      cards: [
        { word: "nebula", team: TEAM.RED, selected: false },
        { word: "galaxy", team: TEAM.RED, selected: false },
        { word: "meteor", team: TEAM.RED, selected: false },
        { word: "supernova", team: TEAM.RED, selected: false },
        { word: "asteroid", team: TEAM.RED, selected: false },
        { word: "comet", team: TEAM.RED, selected: false },
        { word: "eclipse", team: TEAM.RED, selected: false },
        { word: "orbit", team: TEAM.RED, selected: true },
        { word: "solstice", team: TEAM.RED, selected: false },
        { word: "zenith", team: TEAM.GREEN, selected: true },
        { word: "quasar", team: TEAM.GREEN, selected: false },
        { word: "pulsar", team: TEAM.GREEN, selected: false },
        { word: "satellite", team: TEAM.GREEN, selected: false },
        { word: "asterism", team: TEAM.GREEN, selected: false },
        { word: "cosmos", team: TEAM.GREEN, selected: false },
        { word: "gravity", team: TEAM.GREEN, selected: false },
        { word: "blackhole", team: TEAM.ASSASSIN, selected: false },
        { word: "void", team: TEAM.BYSTANDER, selected: false },
        { word: "comet-tail", team: TEAM.BYSTANDER, selected: false },
        { word: "nebular", team: TEAM.BYSTANDER, selected: false },
        { word: "sol", team: TEAM.BYSTANDER, selected: false },
        { word: "lunar", team: TEAM.BYSTANDER, selected: false },
        { word: "stellar", team: TEAM.BYSTANDER, selected: false },
        { word: "orbiting", team: TEAM.BYSTANDER, selected: false },
      ],
      // Turns for the current round:
      turns: [
        {
          team: TEAM.RED,
          clue: { word: "eclipse", number: 2 },
          guesses: [{ word: "orbit" }, { word: "zenith" }],
        },
        {
          team: TEAM.GREEN,
          clue: {},
          guesses: [],
        },
      ],
    },
  ],
};
