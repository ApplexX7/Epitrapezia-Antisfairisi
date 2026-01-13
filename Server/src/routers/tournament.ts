import { FastifyRequest, FastifyReply } from 'fastify';
import { TournamentController } from '../controllers/tournament';
import { db } from '../databases/db';
import jwt from 'jsonwebtoken';

// avoids static typing issues at runtime
const TC: any = (TournamentController as any);
import { Server } from '../server';

export function registerTournamentRoutes() {

  // creates a tournament for logged in users
  Server.route('post', '/tournaments', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, password } = request.body as { name: string; password: string };
      let user: any = (request as any).user;

      // tries to load user from access token if middleware missed it
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err: any, row: any) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch {}
        }
      }

      // blocks unauthenticated users
      if (!user || !user.id) {
        return reply.status(401).send({ message: 'Must be logged in to create tournaments' });
      }

      // checks required input
      if (!name || !password) {
        return reply.status(400).send({ message: 'Name and password are required' });
      }

      const result = await TournamentController.createTournament(name, user.id, password);
      reply.status(201).send(result);
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // returns all tournaments with join state
  Server.route('get', '/tournaments', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let user: any = (request as any).user;

      // optional auth for join status
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err: any, row: any) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch {}
        }
      }

      const tournaments = await TC.getAllTournaments();

      // adds join info for logged users
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
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // returns one tournament with user status
  Server.route('get', '/tournaments/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      let user: any = (request as any).user;

      // optional auth for join state
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err: any, row: any) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch {}
        }
      }

      const tournament = await TC.getTournamentWithStatus(parseInt(id), user?.id);
      reply.send(tournament);
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // lets a logged user join a tournament
  Server.route('post', '/tournaments/:id/join', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { password } = request.body as { password: string };
      let user: any = (request as any).user;

      // loads user from token if needed
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err: any, row: any) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch {}
        }
      }

      // blocks unauthenticated users
      if (!user || !user.id) {
        return reply.status(401).send({ message: 'Must be logged in to join tournaments' });
      }

      // checks required input
      if (!password) {
        return reply.status(400).send({ message: 'Password is required' });
      }

      await TC.joinTournament(parseInt(id), user.id, user.username || 'Player', password);

      const tournament = await TC.getTournamentWithStatus(parseInt(id), user.id);

      // notifies all clients about update
      try {
        const io = Server.socket();
        io.emit('tournament:updated', { tournamentId: parseInt(id), tournament });
      } catch {}

      reply.send({ message: 'Joined tournament successfully', tournament });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // adds a player by username to a tournament
  Server.route('post', '/tournaments/:id/add-player', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { username, password } = request.body as { username: string; password: string };
      let user: any = (request as any).user;

      // loads user from token if missing
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err: any, row: any) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch {}
        }
      }

      // blocks unauthenticated users
      if (!user || !user.id) {
        return reply.status(401).send({ message: 'Must be logged in to add players' });
      }

      // checks required input
      if (!username) {
        return reply.status(400).send({ message: 'Username is required' });
      }

      await TC.addPlayerByUsername(parseInt(id), username, password, user.id);

      const tournament = await TC.getTournamentWithStatus(parseInt(id), user.id);

      // notifies clients about change
      try {
        const io = Server.socket();
        io.emit('tournament:updated', { tournamentId: parseInt(id), tournament });
      } catch {}

      reply.send({ message: 'Player added successfully', tournament });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // returns matches for a tournament
  Server.route('get', '/tournaments/:id/matches', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const matches = await TC.getTournamentMatches(parseInt(id));
      reply.send({ matches });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // initializes tournament bracket
  Server.route('post', '/tournaments/:id/initialize', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await TC.initializeBracket(parseInt(id));
      reply.send({ message: 'Bracket initialized' });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // marks a match as started by the creator
  Server.route('post', '/tournaments/:id/start-match', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { matchId } = request.body as { matchId: number };
      let user: any = (request as any).user;

      // loads user from token if missing
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err: any, row: any) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch {}
        }
      }

      // checks auth and input
      if (!user || !user.id) return reply.status(401).send({ message: 'Must be logged in' });
      if (!matchId) return reply.status(400).send({ message: 'matchId is required' });

      const info = await TC.startMatch(parseInt(id), matchId, user.id);
      reply.send({ message: 'Match started', match: info });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // lets a player accept a match
  Server.route('post', '/tournaments/:id/matches/:matchId/accept', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id, matchId } = request.params as { id: string; matchId: string };
      let user: any = (request as any).user;

      // loads user from token if missing
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err: any, row: any) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch {}
        }
      }

      // blocks unauthenticated users
      if (!user || !user.id) return reply.status(401).send({ message: 'Must be logged in' });

      await TC.acceptMatch(parseInt(id), parseInt(matchId), user.id);
      reply.send({ message: 'Accepted' });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // saves match result and advances bracket
  Server.route('post', '/tournaments/:id/result', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { matchId, winnerId, loserId } = request.body as { matchId: number; winnerId: number; loserId: number };

      // checks required input
      if (!matchId || !winnerId) {
        return reply.status(400).send({ message: 'Match ID and Winner ID are required' });
      }

      await TC.recordMatchResult(parseInt(id), matchId, winnerId, loserId);

      // tries to create finals if ready
      try {
        await TC.createFinalMatches(parseInt(id));
      } catch {}

      reply.send({ message: 'Match result recorded' });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // resets a running match without saving
  Server.route('post', '/tournaments/:id/cancel-match', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { matchId } = request.body as { matchId: number };

      // checks required input
      if (!matchId) {
        return reply.status(400).send({ message: 'Match ID is required' });
      }

      await TC.cancelMatch(parseInt(id), matchId);
      reply.send({ message: 'Match cancelled' });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // completes tournament with final rankings
  Server.route('post', '/tournaments/:id/complete', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { winnerId, runnerUpId, thirdId, fourthId } = request.body as {
        winnerId: number;
        runnerUpId: number;
        thirdId: number;
        fourthId: number;
      };

      // checks all placements exist
      if (!winnerId || !runnerUpId || !thirdId || !fourthId) {
        return reply.status(400).send({ message: 'All 4 player placements are required' });
      }

      // checks placements are unique
      const ids = [winnerId, runnerUpId, thirdId, fourthId];
      if (new Set(ids).size !== 4) {
        return reply.status(400).send({ message: 'All placements must be different players' });
      }

      await TC.completeTournament(parseInt(id), winnerId, runnerUpId, thirdId, fourthId);
      reply.send({ message: 'Tournament completed successfully' });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // returns final tournament results
  Server.route('get', '/tournaments/:id/results', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const results = await TC.getTournamentResults(parseInt(id));
      reply.send(results);
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });

  // returns tournament history for current user
  Server.route('get', '/tournaments/history/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let user: any = (request as any).user;

      // loads user from token if needed
      if (!user || !user.id) {
        const authHeader = (request.headers as any).authorization || (request.headers as any).Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN || '');
            user = await new Promise((resolve) => {
              db.get('SELECT * FROM players WHERE id = ?', [payload.id], (err: any, row: any) => {
                if (err) return resolve(null);
                resolve(row || null);
              });
            });
            if (user) (request as any).user = user;
          } catch {}
        }
      }

      // blocks unauthenticated users
      if (!user || !user.id) {
        return reply.status(401).send({ message: 'Must be logged in to view tournament history' });
      }

      const history = await TC.getPlayerTournamentHistory(user.id);
      reply.send({ tournaments: history });
    } catch (error: any) {
      reply.status(error.status || 400).send({ message: error.message });
    }
  });
}
