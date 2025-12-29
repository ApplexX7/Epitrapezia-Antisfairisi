export interface Tournament {
  id: number;
  name: string;
  creator_id: number;
  password: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TournamentPlayer {
  id: number;
  tournament_id: number;
  player_id: number;
  display_name: string;
  joined_at: string;
}

export interface TournamentMatch {
  id: number;
  tournament_id: number;
  stage: 'semi' | 'final' | 'third';
  match_number: number;
  player_a_id: number | null;
  player_b_id: number | null;
  winner_id: number | null;
  loser_id: number | null;
  status: 'idle' | 'in_progress' | 'finished';
  created_at: string;
}

export interface TournamentResult {
  tournament_id: number;
  first_place_id: number;
  second_place_id: number;
  third_place_id: number;
  fourth_place_id: number;
  completed_at: string;
}

// Tournament OTPs removed — OTP-based flows are deprecated for tournaments
