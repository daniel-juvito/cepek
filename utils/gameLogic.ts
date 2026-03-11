export interface Card {
  name: string;
  value: number;
  rank: string;
}

export const calculateNewTotal = (currentTotal: number, card: Card, choiceValue?: number): number => {
  if (card.rank === 'A' || card.rank === 'J' || card.rank === 'Q') {
    if (choiceValue !== undefined) {
      return Math.min(100, Math.max(0, currentTotal + choiceValue));
    }
    return currentTotal; // Should handle choice in UI
  }
  
  if (card.rank === 'K') {
    return 100;
  }
  
  if (card.rank === '4' || card.rank === '7') {
    return currentTotal; // These cards don't change the total
  }
  
  return Math.min(100, currentTotal + card.value);
};

export const createDeck = (): Card[] => {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = [
    { name: 'A', value: 1, rank: 'A' }, { name: '2', value: 2, rank: '2' },
    { name: '3', value: 3, rank: '3' }, { name: '4', value: 0, rank: '4' },
    { name: '5', value: 5, rank: '5' }, { name: '6', value: 6, rank: '6' },
    { name: '7', value: 0, rank: '7' }, { name: '8', value: 8, rank: '8' },
    { name: '9', value: 9, rank: '9' }, { name: '10', value: 10, rank: '10' },
    { name: 'J', value: 10, rank: 'J' }, { name: 'Q', value: 20, rank: 'Q' },
    { name: 'K', value: 0, rank: 'K' }
  ];
  let deck: Card[] = [];
  for (const suit of suits) {
    for (const val of values) {
      deck.push({ name: `${val.name}${suit}`, value: val.value, rank: val.rank });
    }
  }
  // Tambah 4 kartu Joker
  for (let i = 0; i < 4; i++) {
    deck.push({ name: 'Joker 🃏', value: 0, rank: 'Joker' });
  }
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const reshuffleIfNeeded = (deck: Card[], discardPile: Card[]): { newDeck: Card[], newDiscardPile: Card[], reshuffled: boolean } => {
  if (deck.length === 0 && discardPile.length > 0) {
    return {
      newDeck: shuffleDeck(discardPile),
      newDiscardPile: [],
      reshuffled: true
    };
  }
  return {
    newDeck: deck,
    newDiscardPile: discardPile,
    reshuffled: false
  };
};
