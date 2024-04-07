import { Card } from './Card'

export class Deck {
  declare protected deck: Array<Card>

  setDeck(cards: Card[]){
    this.deck = cards
}

  getDeck() {
    return this.deck
  }

  getDeckSize() {
    return this.getDeck().length
  }

  getCards(n: number) {
    /**
     * Returns the n first cards of the deck
     */
    return this.deck.slice(0, n)
  }

  shuffle() {
    this.deck.sort(() => Math.random() - 0.5)
  }
}
