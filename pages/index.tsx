import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Globe, HelpCircle, Trophy, User } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { calculateNewTotal, Card, createDeck, reshuffleIfNeeded, shuffleDeck } from '../utils/gameLogic';

let socket: Socket;

interface Player {
  id: string;
  name: string;
  isBot: boolean;
  hand: Card[];
  isOut: boolean;
}

const Home: React.FC = () => {
  const [mode, setMode] = useState<'LOCAL' | 'ONLINE' | null>(null);
  const [gameState, setGameState] = useState<'SETUP' | 'LOBBY' | 'PLAYING' | 'OVER'>('SETUP');
  
  const [numHumans, setNumHumans] = useState(1);
  const [numBots, setNumBots] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [accumulatedTotal, setAccumulatedTotal] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnDirection, setTurnDirection] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [specialChoice, setSpecialChoice] = useState<{ card: Card; type: 'ADJ' | '7' | 'JOKER'; jokerStep?: 'RANK' | 'EFFECT' } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [showPassScreen, setShowPassScreen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [deckCards, setDeckCards] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [myId, setMyId] = useState<string>('');

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    socket = io({ autoConnect: false });

    socket.on('connect', () => {
      setMyId(socket.id || '');
    });

    socket.on('room_update', (room) => {
      setPlayers(room.players);
      setAccumulatedTotal(room.accumulatedTotal);
      setCurrentPlayerIndex(room.currentPlayerIndex);
      setTurnDirection(room.turnDirection);
      setLogs(room.logs);
      setGameState(room.gameState);
      setWinner(room.winner);
    });

    socket.on('error', (msg) => {
      alert(msg);
    });

    return () => {
      socket.off('room_update');
      socket.off('error');
      socket.disconnect();
    };
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const initLocalGame = () => {
    let newDeck = shuffleDeck(createDeck());

    const initialPlayers: Player[] = [];
    for (let i = 0; i < numHumans; i++) {
      initialPlayers.push({ id: `local-${i}`, name: `Player ${i + 1}`, isBot: false, hand: [newDeck.pop()!, newDeck.pop()!], isOut: false });
    }
    for (let i = 0; i < numBots; i++) {
      initialPlayers.push({ id: `bot-${i}`, name: `Bot ${i + 1}`, isBot: true, hand: [newDeck.pop()!, newDeck.pop()!], isOut: false });
    }

    setPlayers(initialPlayers);
    setDeckCards(newDeck);
    setDiscardPile([]);
    setAccumulatedTotal(0);
    setCurrentPlayerIndex(0);
    setTurnDirection(1);
    setLogs(['Game Lokal dimulai!']);
    setGameState('PLAYING');
  };

  const nextTurnLocal = (customNextIndex?: number) => {
    let nextIndex = customNextIndex !== undefined 
      ? customNextIndex 
      : (currentPlayerIndex + turnDirection + players.length) % players.length;
    
    const activePlayers = players.filter(p => !p.isOut);
    if (activePlayers.length <= 1) {
      setWinner(activePlayers[0] || null);
      setGameState('OVER');
      return;
    }

    while (players[nextIndex].isOut) {
      nextIndex = (nextIndex + turnDirection + players.length) % players.length;
    }
    
    if (!players[nextIndex].isBot && (players.filter(p => !p.isBot).length > 1 || players.some(p => p.isBot))) {
      setShowPassScreen(true);
    }
    setCurrentPlayerIndex(nextIndex);
  };

  const playCardLocal = (playerIndex: number, cardIndex: number, choiceValue?: number, targetPlayerId?: string, jokerRank?: string) => {
    const newPlayers = [...players];
    const player = newPlayers[playerIndex];
    const card = player.hand[cardIndex];
    
    addLog(`${player.name} memainkan ${card.name}${jokerRank ? ` sebagai ${jokerRank}` : ''}`);

    let effectiveCard = card;
    if (card.rank === 'Joker' && jokerRank) {
      effectiveCard = { ...card, rank: jokerRank };
    }

    const newTotal = calculateNewTotal(accumulatedTotal, effectiveCard, choiceValue);
    
    if (effectiveCard.rank === 'A' || effectiveCard.rank === 'J' || effectiveCard.rank === 'Q') {
      if (choiceValue !== undefined) {
        addLog(`${player.name} memilih ${choiceValue > 0 ? '+' : ''}${choiceValue}`);
      } else {
        setSpecialChoice({ card, type: card.rank === 'Joker' ? 'JOKER' : 'ADJ', jokerStep: card.rank === 'Joker' ? 'EFFECT' : undefined });
        return;
      }
    } else if (effectiveCard.rank === 'K') {
      addLog(`Total menjadi 100!`);
    } else if (effectiveCard.rank === '4') {
      setTurnDirection(prev => prev * -1);
      addLog(`Arah giliran dibalik!`);
    } else if (effectiveCard.rank === '7') {
      if (targetPlayerId !== undefined) {
        addLog(`${player.name} memilih ${players.find(p => p.id === targetPlayerId)?.name} sebagai pemain berikutnya.`);
      } else {
        setSpecialChoice({ card, type: card.rank === 'Joker' ? 'JOKER' : '7', jokerStep: card.rank === 'Joker' ? 'EFFECT' : undefined });
        return;
      }
    } else if (card.rank === 'Joker' && !jokerRank) {
      setSpecialChoice({ card, type: 'JOKER', jokerStep: 'RANK' });
      return;
    }

    setAccumulatedTotal(newTotal);
    const playedCard = player.hand.splice(cardIndex, 1)[0];
    const newDiscardPile = [...discardPile, playedCard];
    
    let { newDeck, newDiscardPile: updatedDiscard, reshuffled } = reshuffleIfNeeded(deckCards, newDiscardPile);
    if (reshuffled) {
      addLog("Deck habis! Mengocok ulang kartu buangan...");
    }

    if (newDeck.length > 0) {
      player.hand.push(newDeck.pop()!);
    }
    setDeckCards(newDeck);
    setDiscardPile(updatedDiscard);

    setPlayers(newPlayers);
    setSpecialChoice(null);

    if (player.hand.length === 0) {
      player.isOut = true;
      addLog(`${player.name} keluar!`);
    }

    const targetIdx = targetPlayerId ? players.findIndex(p => p.id === targetPlayerId) : undefined;
    nextTurnLocal(targetIdx);
  };

  const discardCardLocal = (playerIndex: number, cardIndex: number) => {
    const newPlayers = [...players];
    const player = newPlayers[playerIndex];
    const discarded = player.hand.splice(cardIndex, 1)[0];
    addLog(`${player.name} membuang ${discarded.name}.`);

    const newDiscardPile = [...discardPile, discarded];
    setDiscardPile(newDiscardPile);

    if (player.hand.length === 0) {
      player.isOut = true;
      addLog(`${player.name} keluar!`);
    }
    setPlayers(newPlayers);
    nextTurnLocal();
  };

  const joinOnlineRoom = () => {
    if (!roomId || !playerName) return alert('Isi Room ID dan Nama!');
    socket.connect();
    socket.emit('join_room', { roomId, playerName });
  };

  const startOnlineGame = () => {
    socket.emit('start_game', roomId);
  };

  const playCardOnline = (cardIndex: number, choiceValue?: number, targetPlayerId?: string, jokerRank?: string) => {
    socket.emit('play_card', { roomId, cardIndex, choiceValue, targetPlayerId, jokerRank });
    setSpecialChoice(null);
  };

  const discardCardOnline = (cardIndex: number) => {
    socket.emit('discard_card', { roomId, cardIndex });
  };

  useEffect(() => {
    if (mode === 'LOCAL' && gameState === 'PLAYING' && players[currentPlayerIndex]?.isBot) {
      const timer = setTimeout(() => {
        const player = players[currentPlayerIndex];
        const playableCards = player.hand.filter(c => {
          if (['4', '7', 'K', 'Joker'].includes(c.rank)) return true;
          if (c.rank === 'A') return accumulatedTotal + 1 <= 100 || accumulatedTotal - 1 <= 100;
          if (c.rank === 'J') return accumulatedTotal + 10 <= 100 || accumulatedTotal - 10 <= 100;
          if (c.rank === 'Q') return accumulatedTotal + 20 <= 100 || accumulatedTotal - 20 <= 100;
          return accumulatedTotal + c.value <= 100;
        });

        if (playableCards.length === 0) {
          discardCardLocal(currentPlayerIndex, 0);
        } else {
          let selectedCard = playableCards[0];
          let choice: number | undefined;
          let target: string | undefined;
          let jokerRank: string | undefined;

          if (selectedCard.rank === 'Joker') {
            // Bot milih K kalau bisa (instawin/setting total ke 100)
            jokerRank = 'K';
          }

          const effectiveRank = jokerRank || selectedCard.rank;

          if (effectiveRank === 'A' || effectiveRank === 'J' || effectiveRank === 'Q') {
            const val = effectiveRank === 'A' ? 1 : (effectiveRank === 'J' ? 10 : 20);
            choice = (accumulatedTotal + val <= 100) ? val : -val;
          } else if (effectiveRank === '7') {
            const others = players.filter(p => !p.isOut && p.id !== player.id);
            target = others[Math.floor(Math.random() * others.length)].id;
          }
          playCardLocal(currentPlayerIndex, player.hand.indexOf(selectedCard), choice, target, jokerRank);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, gameState, mode]);

  const handlePlay = (idx: number, cIdx: number) => {
    const card = players[idx].hand[cIdx];
    const canPlay = (['4', '7', 'K', 'Joker'].includes(card.rank)) || 
                  (card.rank === 'A' && (accumulatedTotal + 1 <= 100 || accumulatedTotal - 1 <= 100)) ||
                  (card.rank === 'J' && (accumulatedTotal + 10 <= 100 || accumulatedTotal - 10 <= 100)) ||
                  (card.rank === 'Q' && (accumulatedTotal + 20 <= 100 || accumulatedTotal - 20 <= 100)) ||
                  (accumulatedTotal + card.value <= 100);
    
    if (card.rank === 'Joker') {
      setSpecialChoice({ card, type: 'JOKER', jokerStep: 'RANK' });
      return;
    }
    
    if (card.rank === 'A' || card.rank === 'J' || card.rank === 'Q') {
      const val = card.rank === 'A' ? 1 : (card.rank === 'J' ? 10 : 20);
      if (accumulatedTotal + val <= 100 || accumulatedTotal - val <= 100) {
        setSpecialChoice({ card, type: 'ADJ' });
        return;
      }
    }
    
    if (canPlay) {
      if (mode === 'LOCAL') playCardLocal(idx, cIdx);
      else playCardOnline(cIdx);
    } else {
      if (confirm('Kartu ini akan membuat total > 100. Discard?')) {
        if (mode === 'LOCAL') discardCardLocal(idx, cIdx);
        else discardCardOnline(cIdx);
      }
    }
  };

  if (gameState === 'SETUP' && !mode) {
    return (
      <div className="setup-screen">
        <button className="help-icon" onClick={() => setShowHowToPlay(true)}>
          <HelpCircle size={32} />
        </button>
        <div className="setup-form">
          <h1>Game Cepe</h1>
          <div className="mode-selection">
            <button onClick={() => setMode('LOCAL')} className="mode-btn">
                <User size={24} /> <span>Main Lokal (Pass-and-Play)</span>
            </button>
            <button onClick={() => setMode('ONLINE')} className="mode-btn">
                <Globe size={24} /> <span>Main Online (Multiplayer)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'LOCAL' && gameState === 'SETUP') {
    const MAX_LOCAL_PLAYERS = 10;
    return (
        <div className="setup-screen">
          <div className="setup-form">
            <h2>Setup Game Lokal</h2>
            {errorMsg && <div style={{color: '#ff4d4d', marginBottom: '10px', fontSize: '0.9rem'}}>{errorMsg}</div>}
            <div>
              <label>Human Players: </label>
              <input type="number" value={numHumans} min="1" max={MAX_LOCAL_PLAYERS - numBots} onChange={e => {
                const val = parseInt(e.target.value) || 0;
                if (val > MAX_LOCAL_PLAYERS) {
                  setErrorMsg(`Maksimal ${MAX_LOCAL_PLAYERS} pemain.`);
                  return;
                }
                if (val + numBots <= MAX_LOCAL_PLAYERS) {
                  setNumHumans(val);
                  setErrorMsg(null);
                } else {
                  setErrorMsg(`Total pemain tidak boleh lebih dari ${MAX_LOCAL_PLAYERS}.`);
                }
              }} />
            </div>
            <div>
              <label>Bot Players: </label>
              <input type="number" value={numBots} min="0" max={MAX_LOCAL_PLAYERS - numHumans} onChange={e => {
                const val = parseInt(e.target.value) || 0;
                if (val > 10) {
                  setErrorMsg("Maksimal bot yang diizinkan adalah 10.");
                  return;
                }
                if (val + numHumans <= MAX_LOCAL_PLAYERS) {
                  setNumBots(val);
                  setErrorMsg(null);
                } else {
                  setErrorMsg(`Total pemain tidak boleh lebih dari ${MAX_LOCAL_PLAYERS}.`);
                }
              }} />
            </div>
            <p style={{fontSize: '0.8rem', color: '#888', marginTop: '10px'}}>Maksimal {MAX_LOCAL_PLAYERS} pemain (Max 10 Bot)</p>
            <button className="primary" style={{marginTop: '20px', width: '100%'}} onClick={() => {
              if (numHumans + numBots < 2) {
                setErrorMsg('Minimal 2 pemain untuk memulai!');
                return;
              }
              if (numBots > 10) {
                setErrorMsg("Maksimal bot yang diizinkan adalah 10.");
                return;
              }
              initLocalGame();
            }}>Mulai Permainan</button>
            <button className="secondary" style={{marginTop: '10px', width: '100%'}} onClick={() => { setMode(null); setErrorMsg(null); }}>Kembali</button>
          </div>
        </div>
      );
  }

  if (mode === 'ONLINE' && gameState === 'SETUP') {
    return (
        <div className="setup-screen">
          <div className="setup-form">
            <h2>Main Online</h2>
            <div>
              <label>Nama Anda: </label>
              <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Masukkan nama..." />
            </div>
            <div>
              <label>Room ID: </label>
              <input type="text" value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Contoh: room123" />
            </div>
            <button className="primary" style={{marginTop: '20px', width: '100%'}} onClick={joinOnlineRoom}>Join / Create Room</button>
            <button className="secondary" style={{marginTop: '10px', width: '100%'}} onClick={() => setMode(null)}>Kembali</button>
          </div>
        </div>
      );
  }

  if (mode === 'ONLINE' && gameState === 'LOBBY') {
    const MAX_ONLINE_PLAYERS = 10;
    return (
        <div className="setup-screen">
          <div className="setup-form">
            <h2>Lobby: {roomId}</h2>
            <div className="player-list">
                {players.map(p => <div key={p.id} className="player-list-item">{p.name} {p.id === myId ? '(You)' : ''}</div>)}
            </div>
            <p style={{fontSize: '0.8rem', color: '#888', margin: '10px 0'}}>Menunggu pemain lain... (Min 2, Maks {MAX_ONLINE_PLAYERS})</p>
            {players.length >= 2 && players.length <= MAX_ONLINE_PLAYERS && <button className="primary" style={{width: '100%'}} onClick={startOnlineGame}>Mulai Game</button>}
            <button className="secondary" style={{marginTop: '10px', width: '100%'}} onClick={() => { socket.disconnect(); setGameState('SETUP'); setMode(null); setErrorMsg(null); }}>Keluar</button>
          </div>
        </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = mode === 'LOCAL' 
    ? (!currentPlayer?.isBot && !showPassScreen)
    : (currentPlayer?.id === myId);

  if (showPassScreen && mode === 'LOCAL') {
    return (
      <div className="setup-screen">
        <div className="setup-form" style={{textAlign: 'center'}}>
          <h2>Giliran {currentPlayer.name}</h2>
          <p>Berikan perangkat ke {currentPlayer.name}</p>
          <button className="primary" style={{marginTop: '20px', width: '100%'}} onClick={() => setShowPassScreen(false)}>
            Saya Siap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <Head>
        <title>Game Cepe</title>
      </Head>
      <div className="header-info">
          <div className="room-info">{mode === 'ONLINE' ? `Room: ${roomId}` : 'Mode: Lokal'}</div>
          <button className="help-icon" style={{position: 'static'}} onClick={() => setShowHowToPlay(true)}>
            <HelpCircle size={24} />
          </button>
          <div className="direction-indicator">
            {turnDirection === 1 ? '➡️ Clockwise' : '⬅️ Counter-Clockwise'}
          </div>
      </div>
      
      <div className={`total-display ${accumulatedTotal > 80 ? 'warning' : ''}`}>
        {accumulatedTotal}
      </div>

      <div className="players-grid">
        {players.map((p, idx) => {
          const isMe = mode === 'LOCAL' ? (idx === currentPlayerIndex) : (p.id === myId);
          const isActive = idx === currentPlayerIndex;
          return (
            <div key={p.id} className={`player-card ${isActive ? 'active' : ''} ${p.isOut ? 'out' : ''}`}>
                <h3>{p.name} {p.isBot ? '(Bot)' : ''} {p.id === myId ? '(Anda)' : ''}</h3>
                {p.isOut ? <div className="out-badge">OUT</div> : (
                <div className="hand">
                    {p.hand.map((card, cIdx) => {
                    const isVisible = isMe && !p.isBot && (mode === 'LOCAL' ? isActive : true);
                    return (
                        <div 
                        key={cIdx} 
                        className={`card ${['♥','♦'].includes(card.name.slice(-1)) ? 'red' : ''} ${(!isMyTurn || !isActive) ? 'disabled' : ''} ${!isVisible ? 'back' : ''}`}
                        onClick={() => isMyTurn && isActive && handlePlay(idx, cIdx)}
                        >
                        {isVisible ? card.name : (p.isBot ? '🤖' : '?')}
                        </div>
                    );
                    })}
                </div>
                )}
            </div>
          );
        })}
      </div>

      <div className="log">
        {logs.slice(-10).map((log, i) => <div key={i}>{log}</div>)}
        <div ref={logEndRef} />
      </div>

      {specialChoice && (
        <div className="modal-overlay">
          <div className="modal-content">
            {specialChoice.type === 'JOKER' && specialChoice.jokerStep === 'RANK' ? (
              <>
                <h2>Joker: Pilih Efek Kartu</h2>
                <div className="modal-buttons flex-wrap">
                  {['A', 'J', 'Q', 'K', '4', '7'].map(r => (
                    <button key={r} onClick={() => {
                      if (['A', 'J', 'Q', '7'].includes(r)) {
                        setSpecialChoice({ ...specialChoice, jokerStep: 'EFFECT', jokerRank: r } as any);
                      } else {
                        if (mode === 'LOCAL') playCardLocal(currentPlayerIndex, currentPlayer.hand.findIndex(c => c === specialChoice.card), undefined, undefined, r);
                        else playCardOnline(currentPlayer.hand.findIndex(c => c === specialChoice.card), undefined, undefined, r);
                      }
                    }}>{r}</button>
                  ))}
                </div>
              </>
            ) : specialChoice.type === 'ADJ' || (specialChoice.type === 'JOKER' && ['A', 'J', 'Q'].includes((specialChoice as any).jokerRank)) ? (
              <>
                <h2>Pilih Efek {(specialChoice as any).jokerRank || specialChoice.card.rank}</h2>
                <div className="modal-buttons">
                  <button onClick={() => {
                    const rank = (specialChoice as any).jokerRank || specialChoice.card.rank;
                    const val = rank === 'A' ? 1 : (rank === 'J' ? 10 : 20);
                    if (accumulatedTotal + val <= 100) {
                        if (mode === 'LOCAL') playCardLocal(currentPlayerIndex, currentPlayer.hand.findIndex(c => c === specialChoice.card), val, undefined, (specialChoice as any).jokerRank);
                        else playCardOnline(currentPlayer.hand.findIndex(c => c === specialChoice.card), val, undefined, (specialChoice as any).jokerRank);
                    }
                  }} disabled={accumulatedTotal + (((specialChoice as any).jokerRank || specialChoice.card.rank) === 'A' ? 1 : (((specialChoice as any).jokerRank || specialChoice.card.rank) === 'J' ? 10 : 20)) > 100}>
                    +{(specialChoice as any).jokerRank || specialChoice.card.rank === 'A' ? 1 : ((specialChoice as any).jokerRank || specialChoice.card.rank === 'J' ? 10 : 20)}
                  </button>
                  <button onClick={() => {
                    const rank = (specialChoice as any).jokerRank || specialChoice.card.rank;
                    const val = rank === 'A' ? -1 : (rank === 'J' ? -10 : -20);
                    if (mode === 'LOCAL') playCardLocal(currentPlayerIndex, currentPlayer.hand.findIndex(c => c === specialChoice.card), val, undefined, (specialChoice as any).jokerRank);
                    else playCardOnline(currentPlayer.hand.findIndex(c => c === specialChoice.card), val, undefined, (specialChoice as any).jokerRank);
                  }}>-{(specialChoice as any).jokerRank || specialChoice.card.rank === 'A' ? 1 : ((specialChoice as any).jokerRank || specialChoice.card.rank === 'J' ? 10 : 20)}</button>
                </div>
              </>
            ) : specialChoice.type === '7' || (specialChoice.type === 'JOKER' && (specialChoice as any).jokerRank === '7') ? (
              <>
                <h2>Pilih Pemain Berikutnya</h2>
                <div className="modal-buttons">
                  {players.filter(p => !p.isOut && p.id !== currentPlayer.id).map(p => (
                    <button key={p.id} onClick={() => {
                      if (mode === 'LOCAL') playCardLocal(currentPlayerIndex, currentPlayer.hand.findIndex(c => c === specialChoice.card), undefined, p.id, (specialChoice as any).jokerRank);
                      else playCardOnline(currentPlayer.hand.findIndex(c => c === specialChoice.card), undefined, p.id, (specialChoice as any).jokerRank);
                    }}>{p.name}</button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {gameState === 'OVER' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <Trophy size={48} color="#ffcc00" style={{marginBottom: '10px'}} />
            <h2>Pemenangnya adalah {winner?.name}!</h2>
            <button className="primary" onClick={() => {
                if (mode === 'ONLINE') setGameState('LOBBY');
                else setGameState('SETUP');
            }}>Main Lagi</button>
            {mode === 'ONLINE' && <button className="secondary" style={{marginTop: '10px'}} onClick={() => { socket.disconnect(); setGameState('SETUP'); setMode(null); }}>Keluar</button>}
          </div>
        </div>
      )}

      {showHowToPlay && (
        <div className="modal-overlay">
          <div className="modal-content how-to-play-modal">
            <h2>Cara Bermain Game Cepe</h2>
            <div className="how-to-play-content">
              <h3>Tujuan</h3>
              <p>Mencapai angka <strong>100</strong> tanpa melebihinya!</p>
              
              <h3>Aturan Main</h3>
              <ul>
                <li>Setiap pemain mendapatkan 2 kartu di awal.</li>
                <li>Pada giliranmu, pilih kartu untuk dimainkan (<strong>Play</strong>) atau dibuang (<strong>Discard</strong>).</li>
                <li><strong>Play:</strong> Tambahkan angka kartu ke total akumulasi dan ambil kartu baru dari deck.</li>
                <li><strong>Discard:</strong> Jika kartu membuat total {'>'} 100, buang kartu tersebut <strong>tanpa mengambil kartu baru</strong>.</li>
                <li>Pemain yang kehabisan kartu dianggap <strong>OUT</strong>.</li>
                <li>Pemain terakhir yang bertahan adalah pemenangnya!</li>
              </ul>

              <h3>Kartu Spesial</h3>
              <ul className="special-cards-list">
                <li><strong>A:</strong> +1 atau -1</li>
                <li><strong>J:</strong> +10 atau -10</li>
                <li><strong>Q:</strong> +20 atau -20</li>
                <li><strong>K:</strong> Total langsung menjadi <strong>100</strong>!</li>
                <li><strong>4:</strong> Balik arah giliran.</li>
                <li><strong>7:</strong> Pilih pemain berikutnya.</li>
                <li><strong>Joker:</strong> Pilih efek dari salah satu kartu spesial di atas (A, J, Q, K, 4, 7).</li>
              </ul>
            </div>
            <button className="primary" style={{marginTop: '20px', width: '100%'}} onClick={() => setShowHowToPlay(false)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;