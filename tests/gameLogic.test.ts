import { describe, it, expect } from 'vitest';
import { calculateNewTotal, Card, createDeck, reshuffleIfNeeded } from '../utils/gameLogic';

describe('Logika Permainan Cepe', () => {
  it('harus menambah total dengan nilai kartu angka biasa', () => {
    const card: Card = { name: '5♠', value: 5, rank: '5' };
    expect(calculateNewTotal(10, card)).toBe(15);
  });

  it('kartu King (K) harus membuat total langsung menjadi 100', () => {
    const card: Card = { name: 'K♠', value: 0, rank: 'K' };
    expect(calculateNewTotal(50, card)).toBe(100);
  });

  it('kartu Ace (A) dengan pilihan +1 harus menambah total', () => {
    const card: Card = { name: 'A♠', value: 1, rank: 'A' };
    expect(calculateNewTotal(20, card, 1)).toBe(21);
  });

  it('kartu Ace (A) dengan pilihan -1 harus mengurangi total', () => {
    const card: Card = { name: 'A♠', value: 1, rank: 'A' };
    expect(calculateNewTotal(20, card, -1)).toBe(19);
  });

  it('kartu 4 tidak boleh mengubah total (hanya mengubah arah)', () => {
    const card: Card = { name: '4♠', value: 0, rank: '4' };
    expect(calculateNewTotal(30, card)).toBe(30);
  });

  it('total tidak boleh melebihi 100', () => {
    const card: Card = { name: '9♠', value: 9, rank: '9' };
    expect(calculateNewTotal(95, card)).toBe(100); // UI logic usually prevents this but function caps it
  });

  it('createDeck harus menghasilkan 56 kartu (52 standar + 4 Joker)', () => {
    const deck = createDeck();
    expect(deck.length).toBe(56);
    const jokers = deck.filter(c => c.rank === 'Joker');
    expect(jokers.length).toBe(4);
  });

  it('reshuffleIfNeeded harus mengocok discardPile menjadi deck baru jika deck kosong', () => {
    const deck: Card[] = [];
    const discardPile: Card[] = [
      { name: 'A♠', value: 1, rank: 'A' },
      { name: 'K♣', value: 0, rank: 'K' }
    ];
    
    const result = reshuffleIfNeeded(deck, discardPile);
    
    expect(result.reshuffled).toBe(true);
    expect(result.newDeck.length).toBe(2);
    expect(result.newDiscardPile.length).toBe(0);
    // Cek apakah kartu yang sama ada di deck baru
    const names = result.newDeck.map(c => c.name);
    expect(names).toContain('A♠');
    expect(names).toContain('K♣');
  });

  it('reshuffleIfNeeded tidak boleh melakukan reshuffle jika deck tidak kosong', () => {
    const deck: Card[] = [{ name: '2♠', value: 2, rank: '2' }];
    const discardPile: Card[] = [{ name: 'A♠', value: 1, rank: 'A' }];
    
    const result = reshuffleIfNeeded(deck, discardPile);
    
    expect(result.reshuffled).toBe(false);
    expect(result.newDeck.length).toBe(1);
    expect(result.newDiscardPile.length).toBe(1);
  });
});
