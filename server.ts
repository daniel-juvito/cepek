import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

interface Card {
  name: string;
  value: number;
  rank: string;
}

interface Player {
  id: string; // Socket ID
  name: string;
  isBot: boolean;
  hand: Card[];
  isOut: boolean;
  isReady: boolean;
}

interface Room {
  id: string;
  players: Player[];
  gameState: 'LOBBY' | 'PLAYING' | 'OVER';
  accumulatedTotal: number;
  currentPlayerIndex: number;
  turnDirection: number;
  deck: Card[];
  logs: string[];
  winner: Player | null;
}

const rooms: Map<string, Room> = new Map();

function createDeck(): Card[] {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = [
    { name: 'A', value: 1, rank: 'A' },
    { name: '2', value: 2, rank: '2' },
    { name: '3', value: 3, rank: '3' },
    { name: '4', value: 0, rank: '4' },
    { name: '5', value: 5, rank: '5' },
    { name: '6', value: 6, rank: '6' },
    { name: '7', value: 0, rank: '7' },
    { name: '8', value: 8, rank: '8' },
    { name: '9', value: 9, rank: '9' },
    { name: '10', value: 10, rank: '10' },
    { name: 'J', value: 10, rank: 'J' },
    { name: 'Q', value: 20, rank: 'Q' },
    { name: 'K', value: 0, rank: 'K' }
  ];

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const val of values) {
      deck.push({ name: `${val.name}${suit}`, value: val.value, rank: val.rank });
    }
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    socket.on('join_room', ({ roomId, playerName }) => {
      let room = rooms.get(roomId);
      if (!room) {
        room = {
          id: roomId,
          players: [],
          gameState: 'LOBBY',
          accumulatedTotal: 0,
          currentPlayerIndex: 0,
          turnDirection: 1,
          deck: [],
          logs: [`Room ${roomId} dibuat.`],
          winner: null
        };
        rooms.set(roomId, room);
      }

      if (room.gameState !== 'LOBBY') {
        socket.emit('error', 'Game sudah dimulai atau selesai.');
        return;
      }

      const player: Player = {
        id: socket.id,
        name: playerName || `Player ${room.players.length + 1}`,
        isBot: false,
        hand: [],
        isOut: false,
        isReady: false
      };

      room.players.push(player);
      socket.join(roomId);
      io.to(roomId).emit('room_update', room);
    });

    socket.on('start_game', (roomId) => {
      const room = rooms.get(roomId);
      if (!room || room.players.length < 2) return;

      room.gameState = 'PLAYING';
      room.deck = createDeck();
      room.accumulatedTotal = 0;
      room.currentPlayerIndex = 0;
      room.turnDirection = 1;
      room.winner = null;
      room.logs = ['Game dimulai!'];

      room.players.forEach(p => {
        p.hand = [room.deck.pop()!, room.deck.pop()!];
        p.isOut = false;
      });

      io.to(roomId).emit('room_update', room);
    });

    socket.on('play_card', ({ roomId, cardIndex, choiceValue, targetPlayerId }) => {
      const room = rooms.get(roomId);
      if (!room || room.gameState !== 'PLAYING') return;

      const player = room.players[room.currentPlayerIndex];
      if (player.id !== socket.id) return;

      const card = player.hand[cardIndex];
      room.logs.push(`${player.name} memainkan ${card.name}`);

      let effectApplied = false;
      if (card.rank === 'A' || card.rank === 'J' || card.rank === 'Q') {
        if (choiceValue !== undefined) {
          room.accumulatedTotal = Math.min(100, Math.max(0, room.accumulatedTotal + choiceValue));
          room.logs.push(`${player.name} memilih ${choiceValue > 0 ? '+' : ''}${choiceValue}`);
          effectApplied = true;
        }
      } else if (card.rank === 'K') {
        room.accumulatedTotal = 100;
        room.logs.push(`Total menjadi 100!`);
        effectApplied = true;
      } else if (card.rank === '4') {
        room.turnDirection *= -1;
        room.logs.push(`Arah giliran dibalik!`);
        effectApplied = true;
      } else if (card.rank === '7') {
        if (targetPlayerId !== undefined) {
          const targetIdx = room.players.findIndex(p => p.id === targetPlayerId);
          if (targetIdx !== -1) {
            room.logs.push(`${player.name} memilih ${room.players[targetIdx].name} sebagai pemain berikutnya.`);
            room.currentPlayerIndex = targetIdx;
            effectApplied = true;
          }
        }
      }

      if (!effectApplied) room.accumulatedTotal = Math.min(100, room.accumulatedTotal + card.value);

      player.hand.splice(cardIndex, 1);
      if (room.deck.length > 0) player.hand.push(room.deck.pop()!);

      if (player.hand.length === 0) {
        player.isOut = true;
        room.logs.push(`${player.name} keluar!`);
      }

      const activePlayers = room.players.filter(p => !p.isOut);
      if (activePlayers.length <= 1) {
        room.gameState = 'OVER';
        room.winner = activePlayers[0] || null;
        io.to(roomId).emit('room_update', room);
        return;
      }

      if (card.rank !== '7' || targetPlayerId === undefined) {
        let nextIdx = (room.currentPlayerIndex + room.turnDirection + room.players.length) % room.players.length;
        while (room.players[nextIdx].isOut) {
          nextIdx = (nextIdx + room.turnDirection + room.players.length) % room.players.length;
        }
        room.currentPlayerIndex = nextIdx;
      }
      io.to(roomId).emit('room_update', room);
    });

    socket.on('discard_card', ({ roomId, cardIndex }) => {
      const room = rooms.get(roomId);
      if (!room || room.gameState !== 'PLAYING') return;
      const player = room.players[room.currentPlayerIndex];
      if (player.id !== socket.id) return;

      player.hand.splice(cardIndex, 1);
      room.logs.push(`${player.name} membuang kartu.`);
      if (player.hand.length === 0) {
        player.isOut = true;
        room.logs.push(`${player.name} keluar!`);
      }

      const activePlayers = room.players.filter(p => !p.isOut);
      if (activePlayers.length <= 1) {
        room.gameState = 'OVER';
        room.winner = activePlayers[0] || null;
        io.to(roomId).emit('room_update', room);
        return;
      }

      let nextIdx = (room.currentPlayerIndex + room.turnDirection + room.players.length) % room.players.length;
      while (room.players[nextIdx].isOut) {
        nextIdx = (nextIdx + room.turnDirection + room.players.length) % room.players.length;
      }
      room.currentPlayerIndex = nextIdx;
      io.to(roomId).emit('room_update', room);
    });

    socket.on('disconnect', () => {
      rooms.forEach((room, roomId) => {
        const pIdx = room.players.findIndex(p => p.id === socket.id);
        if (pIdx !== -1) {
          if (room.gameState === 'LOBBY') {
            room.players.splice(pIdx, 1);
          } else {
            room.players[pIdx].isOut = true;
            room.logs.push(`${room.players[pIdx].name} terputus.`);
            const active = room.players.filter(p => !p.isOut);
            if (active.length <= 1) {
              room.gameState = 'OVER';
              room.winner = active[0] || null;
            }
          }
          io.to(roomId).emit('room_update', room);
        }
        if (room.players.length === 0) rooms.delete(roomId);
      });
    });
  });

  server.all('*path', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});