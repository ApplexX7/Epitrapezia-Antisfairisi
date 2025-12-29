import { db } from '../databases/db';
import { Tournament, TournamentPlayer, TournamentMatch } from '../interfaces/tournamentInterface';

export class TournamentController {
  static createTournament(name: string, creatorId: number, password: string): Promise<{ id: number; name: string }> {
    return new Promise((resolve, reject) => {
      if (!name || name.trim().length === 0) {
        return reject({ status: 400, message: 'Tournament name cannot be empty' });
      }
      if (!password || password.length < 3) {
        return reject({ status: 400, message: 'Password must be at least 3 characters' });
      }
      if (name.length > 100) {
        return reject({ status: 400, message: 'Tournament name too long (max 100 characters)' });
      }

      const verifyCreatorSql = `SELECT id FROM players WHERE id = ?`;
      db.get(verifyCreatorSql, [creatorId], (err, creator: any) => {
        if (err) return reject({ status: 400, message: 'Failed to verify creator', error: (err as any)?.message || String(err) });
        if (!creator) return reject({ status: 404, message: 'Creator not found in database' });

        const sql = `INSERT INTO tournaments (name, creator_id, password, status) VALUES (?, ?, ?, 'pending')`;
        db.run(sql, [name, creatorId, password], function (err) {
          if (err) return reject({ status: 400, message: 'Failed to create tournament', error: (err as any)?.message || String(err) });
          const tourId = this.lastID;
          const creatorName = 'Creator';
          const autoJoinSql = `INSERT INTO tournament_players (tournament_id, player_id, display_name) VALUES (?, ?, ?)`;
          db.run(autoJoinSql, [tourId, creatorId, creatorName], (err) => {
            if (err) console.warn('Failed to auto-join creator:', (err as any)?.message || err);
            resolve({ id: tourId, name });
          });
        });
      });
    });
  }

  static getAllTournaments(): Promise<Tournament[]> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tournaments WHERE status IN ('pending', 'in_progress') ORDER BY created_at DESC LIMIT 20`;
      db.all(sql, (err, rows) => {
        if (err) return reject({ status: 400, message: 'Failed to fetch tournaments', error: (err as any)?.message || String(err) });
        resolve((rows as Tournament[]) || []);
      });
    });
  }

  static getTournamentById(tournamentId: number): Promise<Tournament & { players: TournamentPlayer[] }> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tournaments WHERE id = ?`;
      db.get(sql, [tournamentId], (err, tournament: any) => {
        if (err) return reject({ status: 400, message: 'Failed to fetch tournament', error: (err as any)?.message || String(err) });
        if (!tournament) return reject({ status: 404, message: 'Tournament not found' });
        const playerSql = `SELECT id, tournament_id, player_id, display_name, joined_at FROM tournament_players WHERE tournament_id = ? ORDER BY joined_at ASC`;
        db.all(playerSql, [tournamentId], (err, players: any) => {
          if (err) return reject({ status: 400, message: 'Failed to fetch players', error: (err as any)?.message || String(err) });
          resolve({ ...tournament, players: players || [] });
        });
      });
    });
  }

  static joinTournament(tournamentId: number, playerId: number, displayName: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const verifyPlayerSql = `SELECT id, username FROM players WHERE id = ?`;
      db.get(verifyPlayerSql, [playerId], (err, player: any) => {
        if (err) return reject({ status: 400, message: 'Failed to verify player', error: (err as any)?.message || String(err) });
        if (!player) return reject({ status: 404, message: 'Player not found. You must be registered to join tournaments.' });

        const verifySql = `SELECT id, password, status FROM tournaments WHERE id = ?`;
        db.get(verifySql, [tournamentId], (err, tournament: any) => {
          if (err) return reject({ status: 400, message: 'Failed to verify tournament', error: (err as any)?.message || String(err) });
          if (!tournament) return reject({ status: 404, message: 'Tournament not found' });
          if (tournament.password !== password) return reject({ status: 401, message: 'Invalid password' });
          if (tournament.status !== 'pending') return reject({ status: 409, message: 'Tournament already started' });

          const checkSql = `SELECT id FROM tournament_players WHERE tournament_id = ? AND player_id = ?`;
          db.get(checkSql, [tournamentId, playerId], (err, exists: any) => {
            if (err) return reject({ status: 400, message: 'Failed to check player', error: (err as any)?.message || String(err) });
            if (exists) return reject({ status: 409, message: 'Already joined this tournament' });

            const countSql = `SELECT COUNT(*) as count FROM tournament_players WHERE tournament_id = ?`;
            db.get(countSql, [tournamentId], (err, result: any) => {
              if (err) return reject({ status: 400, message: 'Failed to count players', error: (err as any)?.message || String(err) });
              if (result.count >= 4) return reject({ status: 409, message: 'Tournament is full (4/4 players)' });

              const joinSql = `INSERT INTO tournament_players (tournament_id, player_id, display_name) VALUES (?, ?, ?)`;
              db.run(joinSql, [tournamentId, playerId, displayName], function (err) {
                if (err) {
                  if ((err as any)?.message?.includes('UNIQUE')) return reject({ status: 409, message: 'Already joined this tournament' });
                  return reject({ status: 400, message: 'Failed to join tournament', error: (err as any)?.message || String(err) });
                }
                resolve();
              });
            });
          });
        });
      });
    });
  }

  static addPlayerByUsername(tournamentId: number, username: string, password: string, requesterId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!username || username.trim().length === 0) return reject({ status: 400, message: 'Username is required' });

      const verifySql = `SELECT id, password, status, creator_id FROM tournaments WHERE id = ?`;
      db.get(verifySql, [tournamentId], (err, tournament: any) => {
        if (err) return reject({ status: 400, message: 'Failed to verify tournament', error: (err as any)?.message || String(err) });
        if (!tournament) return reject({ status: 404, message: 'Tournament not found' });
        // If requester is the creator, they may add players without supplying the password
        const isCreator = tournament.creator_id === requesterId;
        if (!isCreator) {
          if (tournament.password !== password) return reject({ status: 401, message: 'Invalid password' });
          if (tournament.creator_id !== requesterId) return reject({ status: 403, message: 'Only the creator can add players' });
        }
        if (tournament.status !== 'pending') return reject({ status: 409, message: 'Tournament already started' });

        const playerSql = `SELECT id FROM players WHERE username = ?`;
        db.get(playerSql, [username], (err, player: any) => {
          if (err) return reject({ status: 400, message: 'Failed to lookup player', error: (err as any)?.message || String(err) });
          if (!player) return reject({ status: 404, message: 'Player not found. Username must belong to a registered player.' });

          const playerId = player.id;
          const checkSql = `SELECT id FROM tournament_players WHERE tournament_id = ? AND player_id = ?`;
          db.get(checkSql, [tournamentId, playerId], (err, exists: any) => {
            if (err) return reject({ status: 400, message: 'Failed to check player', error: (err as any)?.message || String(err) });
            if (exists) return reject({ status: 409, message: 'Player already joined this tournament' });

            const countSql = `SELECT COUNT(*) as count FROM tournament_players WHERE tournament_id = ?`;
            db.get(countSql, [tournamentId], (err, result: any) => {
              if (err) return reject({ status: 400, message: 'Failed to count players', error: (err as any)?.message || String(err) });
              if (result.count >= 4) return reject({ status: 409, message: 'Tournament is full (4/4 players)' });

              const joinSql = `INSERT INTO tournament_players (tournament_id, player_id, display_name) VALUES (?, ?, ?)`;
              db.run(joinSql, [tournamentId, playerId, username], function (err) {
                if (err) {
                  if ((err as any)?.message?.includes('UNIQUE')) return reject({ status: 409, message: 'Player already joined this tournament' });
                  return reject({ status: 400, message: 'Failed to add player', error: (err as any)?.message || String(err) });
                }
                resolve();
              });
            });
          });
        });
      });
    });
  }
  /**
   * Check if player is in tournament
   */
  static isPlayerInTournament(tournamentId: number, playerId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id FROM tournament_players WHERE tournament_id = ? AND player_id = ?`;
      db.get(sql, [tournamentId, playerId], (err, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!result);
        }
      });
    });
  }

  /**
   * Get tournament with join status
   */
  static getTournamentWithStatus(tournamentId: number, playerId?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tournaments WHERE id = ?`;
      db.get(sql, [tournamentId], (err, tournament: any) => {
        if (err) {
          return reject({ status: 400, message: 'Failed to fetch tournament', error: (err as any)?.message || String(err) });
        }
        if (!tournament) {
          return reject({ status: 404, message: 'Tournament not found' });
        }

        // Fetch players
        const playerSql = `SELECT id, tournament_id, player_id, display_name, joined_at FROM tournament_players WHERE tournament_id = ? ORDER BY joined_at ASC`;
        db.all(playerSql, [tournamentId], (err, players: any) => {
          if (err) {
            return reject({ status: 400, message: 'Failed to fetch players', error: (err as any)?.message || String(err) });
          }

          const result = {
            ...tournament,
            players: (players as any[]) || [],
            playerCount: (players as any[])?.length || 0,
            isUserJoined: false,
          };

          // Check if current user is in tournament
          if (playerId) {
            result.isUserJoined = (players as any[])?.some((p: any) => p.player_id === playerId) || false;
          }

          resolve(result);
        });
      });
    });
  }

  /**
   * Get tournament matches
   */
  static getTournamentMatches(tournamentId: number): Promise<TournamentMatch[]> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tournament_matches WHERE tournament_id = ? ORDER BY stage, match_number`;
      db.all(sql, [tournamentId], (err, rows) => {
        if (err) {
          reject({ status: 400, message: 'Failed to fetch matches', error: (err as any)?.message || String(err) });
        } else {
          resolve((rows as TournamentMatch[]) || []);
        }
      });
    });
  }

  /**
   * Initialize tournament bracket (when 4 players are ready)
   */
  static initializeBracket(tournamentId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get the tournament first
      const tourSql = `SELECT status FROM tournaments WHERE id = ?`;
      db.get(tourSql, [tournamentId], (err, tournament: any) => {
        if (err) {
          return reject({ status: 400, message: 'Failed to fetch tournament', error: (err as any)?.message || String(err) });
        }
        if (!tournament) {
          return reject({ status: 404, message: 'Tournament not found' });
        }
        if (tournament.status !== 'pending') {
          return reject({ status: 409, message: 'Tournament already started' });
        }

        // Get the 4 players
        const playerSql = `SELECT id, player_id FROM tournament_players WHERE tournament_id = ? ORDER BY joined_at ASC LIMIT 4`;
        db.all(playerSql, [tournamentId], (err, players: any) => {
          if (err) {
            return reject({ status: 400, message: 'Failed to fetch players', error: (err as any)?.message || String(err) });
          }
          if (!players || players.length < 4) {
            return reject({ status: 400, message: `Need 4 players to initialize bracket (${players?.length || 0}/4)` });
          }

          // Verify all 4 players actually exist in database
          const playerIds = players.map((p: any) => p.player_id);
          const placeholders = playerIds.map(() => '?').join(',');
          const verifyPlayersSql = `SELECT COUNT(*) as count FROM players WHERE id IN (${placeholders})`;
          db.get(verifyPlayersSql, playerIds, (err, result: any) => {
            if (err) {
              return reject({ status: 400, message: 'Failed to verify players', error: (err as any)?.message || String(err) });
            }
            if (result.count !== 4) {
              return reject({ status: 400, message: 'One or more players do not exist in the database' });
            }

            // Check if bracket already exists
            const checkSql = `SELECT COUNT(*) as count FROM tournament_matches WHERE tournament_id = ?`;
            db.get(checkSql, [tournamentId], (err, result: any) => {
              if (err) {
                return reject({ status: 400, message: 'Failed to check matches', error: (err as any)?.message || String(err) });
              }
              if (result.count > 0) {
                return reject({ status: 409, message: 'Bracket already initialized' });
              }

              // Create semi-final matches
              const p = players.map((p: any) => p.player_id);
              const matches = [
                { stage: 'semi', match_number: 1, player_a: p[0], player_b: p[1] },
                { stage: 'semi', match_number: 2, player_a: p[2], player_b: p[3] },
              ];

              let completed = 0;
              let hasError = false;

              matches.forEach((match) => {
                const sql = `
                  INSERT INTO tournament_matches (tournament_id, stage, match_number, player_a_id, player_b_id, status)
                  VALUES (?, ?, ?, ?, ?, 'idle')
                `;
                db.run(sql, [tournamentId, match.stage, match.match_number, match.player_a, match.player_b], (err) => {
                  completed++;
                  if (err && !hasError) {
                    hasError = true;
                    reject({ status: 400, message: 'Failed to initialize bracket', error: (err as any)?.message || String(err) });
                  } else if (completed === matches.length && !hasError) {
                    // Update tournament status to in_progress
                    const updateSql = `UPDATE tournaments SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
                    db.run(updateSql, [tournamentId], (err) => {
                      if (err) {
                        reject({ status: 400, message: 'Failed to update tournament status', error: (err as any)?.message || String(err) });
                      } else {
                        resolve();
                      }
                    });
                  }
                });
              });
            });
          });
        });
      });
    });
  }
  /**
   * Start a match (mark as in_progress) — only tournament creator may start.
   * Returns match info (ids and usernames) so the client can launch the local game.
   */
  static startMatch(tournamentId: number, matchId: number, requesterId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const tourSql = `SELECT creator_id FROM tournaments WHERE id = ?`;
      db.get(tourSql, [tournamentId], (err, tour: any) => {
        if (err) return reject({ status: 400, message: 'Failed to fetch tournament', error: (err as any)?.message || String(err) });
        if (!tour) return reject({ status: 404, message: 'Tournament not found' });
        if (tour.creator_id !== requesterId) return reject({ status: 403, message: 'Only the tournament creator can start matches' });

        const matchSql = `SELECT id, player_a_id, player_b_id, status FROM tournament_matches WHERE id = ? AND tournament_id = ?`;
        db.get(matchSql, [matchId, tournamentId], (err, match: any) => {
          if (err) return reject({ status: 400, message: 'Failed to fetch match', error: (err as any)?.message || String(err) });
          if (!match) return reject({ status: 404, message: 'Match not found' });
          if (match.status === 'finished') return reject({ status: 409, message: 'Match already finished' });

          // mark match as in_progress
          const updateMatch = `UPDATE tournament_matches SET status = 'in_progress' WHERE id = ? AND tournament_id = ?`;
          db.run(updateMatch, [matchId, tournamentId], (err) => {
            if (err) return reject({ status: 400, message: 'Failed to mark match in progress', error: (err as any)?.message || String(err) });

            // ensure tournament marked in_progress
            const updateTour = `UPDATE tournaments SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            db.run(updateTour, [tournamentId], (err) => {
              if (err) console.warn('Failed to update tournament status:', (err as any)?.message || String(err));

              // fetch player usernames
              const playersSql = `SELECT id, username FROM players WHERE id IN (?, ?)`;
              db.all(playersSql, [match.player_a_id, match.player_b_id], (err, rows: any) => {
                if (err) return resolve({ matchId: match.id, playerA: { id: match.player_a_id }, playerB: { id: match.player_b_id } });
                const pmap: any = {};
                (rows || []).forEach((r: any) => { pmap[r.id] = r.username; });
                resolve({ matchId: match.id, playerA: { id: match.player_a_id, username: pmap[match.player_a_id] || null }, playerB: { id: match.player_b_id, username: pmap[match.player_b_id] || null } });
              });
            });
          });
        });
      });
    });
  }

  /**
   * Record match result
   */
  static recordMatchResult(
    tournamentId: number,
    matchId: number,
    winnerId: number,
    loserId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Validate winner and loser are different
      if (winnerId === loserId) {
        return reject({ status: 400, message: 'Winner and loser must be different players' });
      }

      // Fetch match to validate
      const matchSql = `SELECT * FROM tournament_matches WHERE id = ? AND tournament_id = ?`;
      db.get(matchSql, [matchId, tournamentId], (err, match: any) => {
        if (err) {
          return reject({ status: 400, message: 'Failed to fetch match', error: (err as any)?.message || String(err) });
        }
        if (!match) {
          return reject({ status: 404, message: 'Match not found' });
        }
        if (match.status === 'finished') {
          return reject({ status: 409, message: 'Match already finished' });
        }

        // Validate winner/loser are actually in this match
        if (
          (match.player_a_id !== winnerId && match.player_b_id !== winnerId) ||
          (match.player_a_id !== loserId && match.player_b_id !== loserId)
        ) {
          return reject({ status: 400, message: 'Winner and loser must be players in this match' });
        }

        // Verify both players exist in database
        const verifyPlayersSql = `SELECT COUNT(*) as count FROM players WHERE id IN (?, ?)`;
        db.get(verifyPlayersSql, [winnerId, loserId], (err, result: any) => {
          if (err) {
            return reject({ status: 400, message: 'Failed to verify players', error: (err as any)?.message || String(err) });
          }
          if (result.count !== 2) {
            return reject({ status: 400, message: 'One or both players do not exist in the database' });
          }

          // Record result
          const sql = `
            UPDATE tournament_matches 
            SET winner_id = ?, loser_id = ?, status = 'finished'
            WHERE tournament_id = ? AND id = ?
          `;
          db.run(sql, [winnerId, loserId, tournamentId, matchId], (err) => {
            if (err) {
              reject({ status: 400, message: 'Failed to record match result', error: (err as any)?.message || String(err) });
            } else {
              resolve();
            }
          });
        });
      });
    });
  }

  /**
   * Create final and 3rd place matches
   */
  static createFinalMatches(tournamentId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get semi-final winners and losers
      const sql = `
        SELECT stage, match_number, winner_id, loser_id 
        FROM tournament_matches 
        WHERE tournament_id = ? AND stage = 'semi'
        ORDER BY match_number
      `;
      db.all(sql, [tournamentId], (err, semis: any) => {
        if (err) {
          reject({ status: 400, message: 'Failed to fetch semi-finals', error: (err as any)?.message || String(err) });
        } else if (!semis || semis.length < 2 || !semis[0].winner_id || !semis[1].winner_id) {
          reject({ status: 400, message: 'Both semi-finals must be finished' });
        } else {
          // Create final and 3rd place
          const finalSql = `
            INSERT INTO tournament_matches (tournament_id, stage, match_number, player_a_id, player_b_id, status)
            VALUES (?, 'final', 1, ?, ?, 'idle')
            ON CONFLICT DO NOTHING
          `;
          const thirdSql = `
            INSERT INTO tournament_matches (tournament_id, stage, match_number, player_a_id, player_b_id, status)
            VALUES (?, 'third', 1, ?, ?, 'idle')
            ON CONFLICT DO NOTHING
          `;

          db.run(finalSql, [tournamentId, semis[0].winner_id, semis[1].winner_id], (err) => {
            if (err) {
              reject({ status: 400, message: 'Failed to create final', error: (err as any)?.message || String(err) });
            } else {
              db.run(thirdSql, [tournamentId, semis[0].loser_id, semis[1].loser_id], (err) => {
                if (err) {
                  reject({ status: 400, message: 'Failed to create 3rd place match', error: (err as any)?.message || String(err) });
                } else {
                  resolve();
                }
              });
            }
          });
        }
      });
    });
  }

  /**
   * Complete tournament
   */
  static completeTournament(
    tournamentId: number,
    firstId: number,
    secondId: number,
    thirdId: number,
    fourthId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Validate all placement IDs are provided and different
      if (!firstId || !secondId || !thirdId || !fourthId) {
        return reject({ status: 400, message: 'All 4 players must be ranked' });
      }

      const uniqueIds = new Set([firstId, secondId, thirdId, fourthId]);
      if (uniqueIds.size !== 4) {
        return reject({ status: 400, message: 'All placements must be different players' });
      }

      // Step 1: Verify all players exist in database
      const verifyPlayersSql = `SELECT COUNT(*) as count FROM players WHERE id IN (?, ?, ?, ?)`;
      db.get(verifyPlayersSql, [firstId, secondId, thirdId, fourthId], (err, result: any) => {
        if (err) {
          return reject({ status: 400, message: 'Failed to verify players in database', error: (err as any)?.message || String(err) });
        }
        if (result.count !== 4) {
          return reject({ status: 400, message: 'One or more players do not exist in the database' });
        }

        // Step 2: Verify all players are in tournament
        const playerCheckSql = `
          SELECT COUNT(DISTINCT player_id) as count FROM tournament_players 
          WHERE tournament_id = ? AND player_id IN (?, ?, ?, ?)
        `;
        db.get(playerCheckSql, [tournamentId, firstId, secondId, thirdId, fourthId], (err, result: any) => {
          if (err) {
            return reject({ status: 400, message: 'Failed to verify players', error: (err as any)?.message || String(err) });
          }
          if (result.count !== 4) {
            return reject({ status: 400, message: 'Not all placement players are in tournament' });
          }

          // Step 3: Insert results
          const sql = `
            INSERT INTO tournament_results (tournament_id, first_place_id, second_place_id, third_place_id, fourth_place_id)
            VALUES (?, ?, ?, ?, ?)
          `;
          db.run(sql, [tournamentId, firstId, secondId, thirdId, fourthId], (err) => {
            if (err) {
              reject({ status: 400, message: 'Failed to complete tournament', error: (err as any)?.message || String(err) });
            } else {
              // Update tournament status
              const updateSql = `UPDATE tournaments SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
              db.run(updateSql, [tournamentId], (err) => {
                if (err) {
                  reject({ status: 400, message: 'Failed to update tournament status', error: (err as any)?.message || String(err) });
                } else {
                  resolve();
                }
              });
            }
          });
        });
      });
    });
  }

  /**
   * Get tournament results
   */
  static getTournamentResults(tournamentId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tournament_results WHERE tournament_id = ?`;
      db.get(sql, [tournamentId], (err, results) => {
        if (err) {
          reject({ status: 400, message: 'Failed to fetch results', error: (err as any)?.message || String(err) });
        } else {
          resolve(results);
        }
      });
    });
  }
}
