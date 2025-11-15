import axios from "axios";

const GAME_ID = process.argv[2];
const CLUE_WORD = process.argv[3];
const TARGET_COUNT = parseInt(process.argv[4]);

const API_URL = "http://localhost:3000";

// Radiant-Warrior358 (Blue codemaster)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ1OCwidXNlcm5hbWUiOiJSYWRpYW50LVdhcnJpb3IzNTgiLCJpYXQiOjE3NjMxNzQ2MjQsImV4cCI6MTc2Mzc3OTQyNCwiaXNzIjoiY29kZW5hbWVzLWFwcCJ9.mpYxZkS8ch9cgRZFT25DdIykpjlV_8VCbLXNR42UYFM";
const playerId = "0a45160c-3986-4aa4-81b1-c1704fd3ab16";

async function giveClue() {
  try {
    const response = await axios.post(
      `${API_URL}/api/games/${GAME_ID}/rounds/1/clues`,
      {
        playerId,
        word: CLUE_WORD,
        targetCardCount: TARGET_COUNT,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(`✅ Clue given: ${CLUE_WORD} ${TARGET_COUNT}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

giveClue();
