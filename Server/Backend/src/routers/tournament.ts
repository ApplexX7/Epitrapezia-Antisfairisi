import { FastifyRequest, FastifyReply } from 'fastify';
import { TournamentController } from '../controllers/tournament';
import { db } from '../databases/db';
import jwt from 'jsonwebtoken';
// Use an any-typed reference to avoid TypeScript static member resolution issues during runtime
const TC: any = (TournamentController as any);
import { Server } from '../server';

export function registerTournamentRoutes() {
  // Create tournament - REQUIRES AUTHENTICATED USER
  Server.route('post', '/tournaments', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, password } = request.body as { name: string; password: string };
      let user: any = (request as any).user;

      // If no user from refresh-token middleware, try Authorization header (access token)
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            // fetch user by id
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err, row) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch (e) {
            // ignore and fall through to unauthenticated response
          }
        }
      }

      // Must be logged in to create tournament
      if (!user || !user.id) {
        return reply.status(401).send({ message: 'Must be logged in to create tournaments' });
      }

      if (!name || !password) {
        return reply.status(400).send({ message: 'Name and password are required' });
      }

      const result = await TournamentController.createTournament(name, user.id, password);
      reply.status(201).send(result);
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Get all tournaments with user join status
  Server.route('get', '/tournaments', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let user: any = (request as any).user;
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err, row) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch (e) {}
        }
      }
      const tournaments = await TC.getAllTournaments();
      
      // Add join status if user is authenticated
      if (user?.id) {
        const toursWithStatus = await Promise.all(
          tournaments.map(async (t: any) => {
            const isJoined = await TC.isPlayerInTournament(t.id, user.id);
            return { ...t, isUserJoined: isJoined };
          })
        );
        return reply.send({ tournaments: toursWithStatus });
      }
      
      reply.send({ tournaments: tournaments.map((t: any) => ({ ...t, isUserJoined: false })) });
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Get tournament by ID with status
  Server.route('get', '/tournaments/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      let user: any = (request as any).user;
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err, row) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch (e) {}
        }
      }
      const tournament = await TC.getTournamentWithStatus(parseInt(id), user?.id);
      reply.send(tournament);
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Join tournament - NOW REQUIRES AUTHENTICATED USER
  Server.route('post', '/tournaments/:id/join', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { password } = request.body as { password: string };
      let user: any = (request as any).user;

      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err, row) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch (e) {}
        }
      }

      if (!user || !user.id) {
        return reply.status(401).send({ message: 'Must be logged in to join tournaments' });
      }

      if (!password) {
        return reply.status(400).send({ message: 'Password is required' });
      }

      await TC.joinTournament(
        parseInt(id),
        user.id,
        user.username || 'Player',
        password
      );

      // Return updated tournament status
      const tournament = await TC.getTournamentWithStatus(parseInt(id), user.id);
      reply.send({ message: 'Joined tournament successfully', tournament });
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Add player to tournament by username (requires auth)
  Server.route('post', '/tournaments/:id/add-player', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { username, password } = request.body as { username: string; password: string };
      let user: any = (request as any).user;
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err, row) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch (e) {}
        }
      }

      if (!user || !user.id) {
        return reply.status(401).send({ message: 'Must be logged in to add players' });
      }

      if (!username || !password) {
        return reply.status(400).send({ message: 'Username and password are required' });
      }

      await TC.addPlayerByUsername(parseInt(id), username, password, user.id);
      // Return updated tournament status
      const tournament = await TC.getTournamentWithStatus(parseInt(id), user.id);
      reply.send({ message: 'Player added successfully', tournament });
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Get tournament matches
  Server.route('get', '/tournaments/:id/matches', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const matches = await TC.getTournamentMatches(parseInt(id));
      reply.send({ matches });
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Initialize bracket
  Server.route('post', '/tournaments/:id/initialize', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await TC.initializeBracket(parseInt(id));
      reply.send({ message: 'Bracket initialized' });
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Send OTP
  Server.route('post', '/tournaments/:id/send-otp', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { playerId, matchId } = request.body as { playerId: number; matchId?: number };

      if (!playerId) {
        return reply.status(400).send({ message: 'Player ID is required' });
      }

      const otp = await TC.sendOTPForMatch(parseInt(id), playerId, matchId || 0);
      // In dev, return OTP; in production, should be sent via email/SMS
      reply.send({ otp, message: 'OTP sent (dev mode)' });
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Send OTP to both players in a match (creator only)
  Server.route('post', '/tournaments/:id/send-otp/match', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { matchId } = request.body as { matchId: number };
      const user: any = (request as any).user;

      if (!user || !user.id) return reply.status(401).send({ message: 'Must be logged in' });
      if (!matchId) return reply.status(400).send({ message: 'matchId is required' });

      await TC.sendOTPToMatchPlayers(parseInt(id), matchId, user.id);
      reply.send({ message: 'OTPs sent to match players (dev: check emails)' });
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Verify OTP
  Server.route('post', '/tournaments/:id/verify-otp', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { playerId, otp, matchId } = request.body as { playerId: number; otp: string; matchId?: number };

      if (!playerId || !otp) {
        return reply.status(400).send({ message: 'Player ID and OTP are required' });
      }

      await TC.verifyOTP(parseInt(id), playerId, matchId || 0, otp);
      reply.send({ ok: true, message: 'OTP verified' });
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Record match result
  Server.route('post', '/tournaments/:id/result', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { matchId, winnerId, loserId } = request.body as { matchId: number; winnerId: number; loserId: number };

      if (!matchId || !winnerId) {
        return reply.status(400).send({ message: 'Match ID and Winner ID are required' });
      }

      await TC.recordMatchResult(parseInt(id), matchId, winnerId, loserId);
      
      // Check if we need to create final matches
      await TC.createFinalMatches(parseInt(id));

      reply.send({ message: 'Match result recorded' });
    } catch (error: any) {
      // Final matches may not be ready yet
      if (error.message.includes('Both semi-finals')) {
        reply.send({ message: 'Match result recorded, waiting for other semi-final' });
      } else {
        reply.status(error.status || 500).send({ message: error.message });
      }
    }
  });

  // Complete tournament - WITH VALIDATION
  Server.route('post', '/tournaments/:id/complete', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { winnerId, runnerUpId, thirdId, fourthId } = request.body as {
        winnerId: number;
        runnerUpId: number;
        thirdId: number;
        fourthId: number;
      };

      // Validate all placements provided
      if (!winnerId || !runnerUpId || !thirdId || !fourthId) {
        return reply.status(400).send({ message: 'All 4 player placements are required' });
      }

      // Validate all are different
      const ids = [winnerId, runnerUpId, thirdId, fourthId];
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== 4) {
        return reply.status(400).send({ message: 'All placements must be different players' });
      }

      await TC.completeTournament(
        parseInt(id),
        winnerId,
        runnerUpId,
        thirdId,
        fourthId
      );
      reply.send({ message: 'Tournament completed successfully' });
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Get tournament results
  Server.route('get', '/tournaments/:id/results', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const results = await TC.getTournamentResults(parseInt(id));
      reply.send(results);
    } catch (error: any) {
      reply.status(error.status || 500).send({ message: error.message });
    }
  });
}
