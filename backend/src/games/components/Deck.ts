import { Card } from './Card'

export class Deck {
  private deck: Array<Card>
  constructor(cards: Card[]) {
    this.deck = cards
  }

  get_deck() {
    return this.deck
  }

  get_deck_size() {
    return this.get_deck().length
  }

  get_cards(n: number) {
    return this.deck.slice(0, n)
  }

  shuffle() {
    this.deck.sort(() => Math.random() - 0.5)
  }
}
