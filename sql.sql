delete

-- Users Table
CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Lookup Table: Game Status
CREATE TABLE game_status (
    id INTEGER PRIMARY KEY,
    status_name TEXT NOT NULL UNIQUE
);

-- Games Table (Includes public_id for public-facing identifier)
CREATE TABLE games (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id TEXT NOT NULL UNIQUE, -- Public-facing identifier
    status_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    game_type TEXT NOT NULL,
    game_format TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT now(), -- Track last updated time
    CONSTRAINT games_status_id_fkey 
        FOREIGN KEY (status_id) REFERENCES game_status(id)
        DEFERRABLE INITIALLY DEFERRED
);

alter table games drop constraint games_status_id_fkey
ALTER TABLE games ADD CONSTRAINT games_status_id_fkey
        FOREIGN KEY (status_id) REFERENCES game_status(id)
        DEFERRABLE INITIALLY DEFERRED;

-- Teams Table (Corrected to include game_id reference)
CREATE TABLE teams (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    team_name TEXT NOT NULL,
    UNIQUE(game_id, team_name)
);

-- Lookup Table: Player Statuses
CREATE TABLE player_statuses (
    id INTEGER PRIMARY KEY,
    status_name TEXT NOT NULL UNIQUE
);

-- Players Table
CREATE TABLE players (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    game_id INTEGER NOT NULL REFERENCES games(id),
    public_name TEXT NOT NULL, 
    team_id INTEGER REFERENCES teams(id) NOT NULL,
    status_id INTEGER NOT NULL,
    status_last_changed TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(), 
    UNIQUE (game_id, public_name),
    CONSTRAINT players_status_id_fkey
        FOREIGN KEY (status_id) REFERENCES player_statuses(id)
        DEFERRABLE INITIALLY DEFERRED
);

-- Lookup Table: Round Status
CREATE TABLE round_status (
    id INTEGER PRIMARY KEY,
    status_name TEXT NOT NULL UNIQUE
);

-- Rounds Table
CREATE TABLE rounds (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    round_number INTEGER NOT NULL,
    status_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (game_id, round_number), -- Unique round number within each game
    CONSTRAINT rounds_status_id_fkey
        FOREIGN KEY (status_id) REFERENCES round_status(id)
        DEFERRABLE INITIALLY DEFERRED
);

-- Lookup Table: Player Roles
CREATE TABLE player_roles (
    id INTEGER PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE
);

-- Player Round Roles Table
CREATE TABLE player_round_roles (
    player_id INTEGER NOT NULL REFERENCES players(id),
    round_id INTEGER NOT NULL REFERENCES rounds(id),
    role_id INTEGER NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (player_id, round_id), -- Ensures one role per player per round
    CONSTRAINT player_round_roles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES player_roles(id)
        DEFERRABLE INITIALLY DEFERRED
);

-- Turns Table
CREATE TABLE turns (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    round_id INTEGER NOT NULL REFERENCES rounds(id),
    team_id INTEGER NOT NULL REFERENCES teams(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (round_id, team_id) -- Ensures one turn per team per round
);

CREATE TABLE cards (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    round_id INTEGER NOT NULL REFERENCES rounds(id),
    word TEXT NOT NULL,
    team_id INTEGER REFERENCES teams(id), -- For team cards
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('TEAM', 'BYSTANDER', 'ASSASSIN')),
    selected BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(round_id, word),
    -- Ensure team_id is only set for team cards
    CONSTRAINT check_team_card CHECK (
        (card_type = 'TEAM' AND team_id IS NOT NULL) OR 
        (card_type != 'TEAM' AND team_id IS NULL)
    )
);

-- Clues Table (renamed from Codewords)
CREATE TABLE clues (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    turn_id INTEGER NOT NULL REFERENCES turns(id),
    player_id INTEGER NOT NULL REFERENCES players(id),
    clue TEXT NOT NULL,
    clue_number INTEGER NOT NULL CHECK (clue_number > 0),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (turn_id) -- Only one codeword per turn
);

-- Guesses Table
CREATE TABLE guesses (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    turn_id INTEGER NOT NULL REFERENCES turns(id),
    player_id INTEGER NOT NULL REFERENCES players(id),
    card_id INTEGER NOT NULL REFERENCES cards(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_guess_turn FOREIGN KEY (turn_id) REFERENCES clues(turn_id) -- Ensures guesses only after codeword
);

-- Decks Table
CREATE TABLE decks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    deck TEXT not NULL,
    word TEXT NOT NULL,
    language_code VARCHAR(5) NOT NULL DEFAULT 'en',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(deck, word, language_code) -- Uniqueness constraint
);

-- Add Database Comments for Documentation
COMMENT ON TABLE users IS 'Users registered in the system';
COMMENT ON TABLE games IS 'Game sessions tracking';
COMMENT ON TABLE players IS 'Players participating in games';
COMMENT ON COLUMN players.public_name IS 'Public-facing name shown to other players';
COMMENT ON TABLE round_status IS 'Lookup table for round status values';
COMMENT ON COLUMN rounds.status_id IS 'Current status of the round (setup, in progress, completed)';

-- Create index for faster lookups by deck
CREATE INDEX idx_decks_deck_number ON decks(deck);
CREATE INDEX idx_decks_language ON decks(language_code);

-- Create Recommended Indexes
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_games_public_id ON games(public_id);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_status_id ON players(status_id);
CREATE INDEX idx_rounds_game_id ON rounds(game_id);
CREATE INDEX idx_rounds_status_id ON rounds(status_id);
CREATE INDEX idx_rounds_game_status ON rounds(game_id, status_id);
CREATE INDEX idx_turns_round_id ON turns(round_id);
CREATE INDEX idx_player_round_roles_round_id ON player_round_roles(round_id);
CREATE INDEX idx_guesses_turn_id ON guesses(turn_id);
CREATE INDEX idx_guesses_player_id ON guesses(player_id);

-- Indexes for performance
CREATE INDEX idx_cards_round_id ON cards(round_id);
CREATE INDEX idx_cards_team_id ON cards(team_id);
CREATE INDEX idx_cards_type ON cards(card_type);

-- Insert initial values for game statuses
INSERT INTO game_status (id, status_name) VALUES 
    (1, 'LOBBY'),
    (2, 'IN_PROGRESS'),
    (3, 'COMPLETED'),
    (4, 'ABANDONED'),
    (5, 'PAUSED');

-- Insert initial values for player statuses
INSERT INTO player_statuses (id, status_name) VALUES 
    (1, 'ACTIVE'),
    (2, 'WAITING'),
    (3, 'DISCONNECTED'),
    (4, 'SPECTATOR'),
    (5, 'BANNED');

-- Insert initial values for round statuses
INSERT INTO round_status (id, status_name) VALUES 
    (1, 'SETUP'),
    (2, 'IN_PROGRESS'),
    (3, 'COMPLETED');

-- Insert initial values for player roles
INSERT INTO player_roles (id, role_name) VALUES 
    (1, 'CODEMASTER'),
    (2, 'CODEBREAKER'),
    (3, 'SPECTATOR');


ALTER TABLE games
ADD COLUMN host_user_id INTEGER REFERENCES users(id);

-- 2. Create index for host lookups
CREATE INDEX idx_games_host_user_id ON games(host_user_id);

delete from games g where not exists (select 1 from players where game_id = g.id) cascade;

UPDATE games g
SET host_user_id = (
  SELECT p.user_id
  FROM players p
  WHERE p.game_id = g.id
  ORDER BY p.id ASC
  LIMIT 1
)
WHERE g.host_user_id IS NULL;

-- 4. Make host_user_id NOT NULL after backfilling
ALTER TABLE games
ALTER COLUMN host_user_id SET NOT NULL;



-- Create ai_pipeline_runs table
CREATE TABLE ai_pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id),
    pipeline_type TEXT NOT NULL CHECK (pipeline_type IN ('SPYMASTER', 'GUESSER')),
    status TEXT NOT NULL CHECK (status IN ('RUNNING', 'COMPLETE', 'FAILED')),
    error TEXT,
    spymaster_response JSONB,
    prefilter_response JSONB,
    ranker_response JSONB,
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_ai_pipeline_runs_game_id ON ai_pipeline_runs(game_id);
CREATE INDEX idx_ai_pipeline_runs_player_id ON ai_pipeline_runs(player_id);
CREATE INDEX idx_ai_pipeline_runs_status ON ai_pipeline_runs(status);

COMMENT ON TABLE ai_pipeline_runs IS 'Tracks AI pipeline execution for status queries';
COMMENT ON COLUMN ai_pipeline_runs.spymaster_response IS 'Structured output from spymaster stage (audit/recovery)';
COMMENT ON COLUMN ai_pipeline_runs.prefilter_response IS 'Structured output from prefilter stage (audit/recovery)';
COMMENT ON COLUMN ai_pipeline_runs.ranker_response IS 'Structured output from ranker stage (audit/recovery)';


select * from games where public_id = '9oYW0RLeE'
select * from game_messages; -- 476



-- Create game_messages table
CREATE TABLE game_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id),
    team_id INTEGER REFERENCES teams(id),
    team_only BOOLEAN NOT NULL DEFAULT false,
    message_type TEXT NOT NULL CHECK (message_type IN ('CHAT', 'AI_THINKING', 'SYSTEM')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT check_team_only_requires_team
        CHECK (team_only = false OR team_id IS NOT NULL)
);

CREATE INDEX idx_game_messages_game_id ON game_messages(game_id);
CREATE INDEX idx_game_messages_game_created ON game_messages(game_id, created_at);
CREATE INDEX idx_game_messages_team_id ON game_messages(team_id);

COMMENT ON TABLE game_messages IS 'Chat log for games - player chat, AI narration, system messages';
COMMENT ON COLUMN game_messages.team_id IS 'Team of the message author';
COMMENT ON COLUMN game_messages.team_only IS 'If true, only visible to members of team_id';
