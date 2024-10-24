/**
 * Processes the 'intro' stage and returns an updated game object.
 *
 * @param {Object} inputGameObject - The current state of the game.
 * @returns {Object} - The updated game state after processing the intro stage.
 */
export function processIntroStage(inputGameObject) {
  const updatedGameObj = {
    state: {
      stage: "codemaster",
      rounds: [{ team: inputGameObject.settings.startingTeam }],
    },
  };

  return {
    ...inputGameObject,
    state: { ...inputGameObject.state, ...updatedGameObj.state },
  };
}

/**
 * Processes the 'codemaster' stage and returns an updated game object
 *
 * @param {Object} inputGameObject - The current state of the game.
 * @returns {Object} - The updated game state after processing the codemaster stage.
 */
export function processCodemasterStage(inputGameObject) {
  const updatedGameObj = {
    state: {
      stage: "codebreaker",
    },
  };
  return {
    ...inputGameObject,
    state: { ...inputGameObject.state, ...updatedGameObj.state },
  };
}

/**
 * Processes the 'codebreaker' stage and returns an updated game object
 *
 * @param {Object} inputGameObject - The current state of the game.
 * @returns {Object} - The updated game state after processing the codebreaker stage.
 */
export function processCodebreakerStage(inputGameObject) {
  // Get relevant details for the current round from the input object
  const lastRound = inputGameObject.state.rounds.at(-1);
  const selectedWord = lastRound.guessedWords.at(-1);
  const currentTeam = lastRound.team;
  const otherTeam = currentTeam === "red" ? "green" : "red";

  // Update the "selected" property of the corresponding card in the cards array
  const updatedCards = inputGameObject.state.cards.map((card) =>
    card.word === selectedWord ? { ...card, selected: true } : card
  );

  // Updated game object for merging with input game object
  const updatedGameObj = {
    state: {
      ...inputGameObject.state,
      cards: updatedCards,
    },
  };

  // Determine if there's a winning team based on the selected card(s).
  const determinedWinner = determineWinner(updatedCards);
  const actualWinningTeam =
    determinedWinner === "assassin" ? otherTeam : determinedWinner;

  if (actualWinningTeam) {
    updatedGameObj.state.stage = "gameover";
    updatedGameObj.state.winner = actualWinningTeam;
    return {
      ...inputGameObject,
      state: updatedGameObj.state,
    };
  }

  const numberOfGuessesRemaining =
    lastRound.guessesAllowed - lastRound.guessedWords.length;

  if (numberOfGuessesRemaining === 0) {
    updatedGameObj.state.stage = "codemaster";
    updatedGameObj.state.rounds = [
      ...inputGameObject.state.rounds,
      { team: otherTeam },
    ];

    return {
      ...inputGameObject,
      state: updatedGameObj.state,
    };
  }

  // Determine whether the last selected card is for the current team
  const isCardForCurrentTeam = updatedGameObj.state.cards.some(
    (card) =>
      card.selected &&
      card.team === lastRound.team &&
      card.word === selectedWord
  );

  // if the correct team, proceed with next codebreaker turn, otherwise, new round for codemaster
  updatedGameObj.state.stage = isCardForCurrentTeam
    ? "codebreaker"
    : "codemaster";

  if (updatedGameObj.state.stage === "codebreaker") {
    return {
      ...inputGameObject,
      state: updatedGameObj.state,
    };
  }

  if (updatedGameObj.state.stage === "codemaster") {
    updatedGameObj.state.rounds = [
      ...inputGameObject.state.rounds,
      { team: otherTeam },
    ];

    return {
      ...inputGameObject,
      state: updatedGameObj.state,
    };
  }
}

/**
 * Determines the winner based on the selected cards.
 *
 * @param {Array} cardArray - The array of cards in the game state.
 * @returns {string|null} - The winning team ('red' or 'green') or null if no winner.
 * @throws {Error} - If its determined that both teams win.
 */
function determineWinner(cardArray) {
  // .reduce() to prevent unnecessary iterations of the array
  const counts = cardArray.reduce(
    (acc, card) => {
      if (card.team === "green") acc.totalGreen += 1;
      if (card.team === "red") acc.totalRed += 1;
      if (card.team === "assassin") acc.totalAssassin += 1;
      if (card.selected && card.team === "green") acc.greenScore += 1;
      if (card.selected && card.team === "red") acc.redScore += 1;
      if (card.selected && card.team === "assassin") acc.assassinScore += 1;
      return acc;
    },
    {
      totalGreen: 0,
      totalRed: 0,
      totalAssassin: 0,
      greenScore: 0,
      redScore: 0,
      assassinScore: 0,
    }
  );

  const {
    totalGreen,
    totalRed,
    totalAssassin,
    greenScore,
    redScore,
    assassinScore,
  } = counts;

  if (redScore === totalRed && greenScore === totalGreen) {
    throw new Error("Failed to determine winner... both teams win!");
  }

  // all assassins selected (normally only a single assassin)
  if (totalAssassin === assassinScore) {
    return "assassin";
  }

  return redScore === totalRed
    ? "red"
    : greenScore === totalGreen
    ? "green"
    : null;
}
