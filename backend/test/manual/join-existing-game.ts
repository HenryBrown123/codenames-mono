import { ApiClient } from "./test-common";

const GAME_ID = process.argv[2] || "RSYrf4f6a";

async function joinExistingGame() {
  console.log(`🎮 Joining game ${GAME_ID} with 3 AI players...\n`);

  // Create 3 guest users
  const clients = [
    new ApiClient(true),
    new ApiClient(true),
    new ApiClient(true),
  ];

  const playerNames = ["ClaudeBot1", "ClaudeBot2", "ClaudeBot3"];
  const teams = ["Team Red", "Team Blue", "Team Red"];

  for (let i = 0; i < 3; i++) {
    console.log(`\n📝 Creating guest user: ${playerNames[i]}`);

    const guestResponse = await clients[i].post("/auth/guests", {});

    if (!guestResponse.data?.data?.session?.token) {
      console.error(`❌ Failed to create guest`);
      console.error(guestResponse.data);
      continue;
    }

    const token = guestResponse.data.data.session.token;
    const username = guestResponse.data.data.user.username;
    clients[i].setAuthToken(token);

    console.log(`✅ Created ${username}, joining ${teams[i]}...`);

    try {
      const joinResponse = await clients[i].post(`/games/${GAME_ID}/players`, {
        playerName: username,
        teamName: teams[i],
      });

      console.log(`✅ ${username} joined ${teams[i]}!`);
    } catch (error: any) {
      console.error(`❌ Failed to join: ${error.response?.data?.error || error.message}`);
    }
  }

  console.log("\n🎉 All bots joined! Check your lobby!");
}

joinExistingGame().catch(console.error);
