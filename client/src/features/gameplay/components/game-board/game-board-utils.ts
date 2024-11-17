import { Card, Stage, Team } from "@game/game-common-types";
import { TEAM, STAGE } from "@game/game-common-constants";
import { GameCardProps } from "./game-card";

export const getCardColor = (team: Team): string => {
  switch (team) {
    case TEAM.ASSASSIN:
      return "#1d2023";
    case TEAM.BYSTANDER:
      return "#4169E1";
    case TEAM.RED:
      return "#B22222";
    case TEAM.GREEN:
      return "#228B22";
    default:
      console.warn("Unknown team:", team);
      return "#4b7fb3";
  }
};

export const getGameCardProps = (
  cardData: Card,
  gameStage: Stage,
  readOnly?: boolean,
  handleClick?: () => void
): GameCardProps => {
  return {
    cardText: cardData.word,
    cardColor: getCardColor(cardData.team),
    clickable: gameStage === STAGE.CODEBREAKER && !cardData.selected,
    selected: cardData.selected,
    showTeamColorAsBackground: !readOnly && gameStage === STAGE.CODEMASTER,
    onClick: handleClick,
  };
};
