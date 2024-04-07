import { Deck } from '../commonClasses/Deck'
import { CardSK, skColors } from './CardSK'

export class DeckSK extends Deck {
  declare protected deck: Array<CardSK>

  constructor() {
    super()
    this.deck = this.getSKCards()
  }

  getSKCards() {

    const colors: skColors[] = ['yellow', 'red', 'blue']
    const oneColorCards = (color: skColors) =>
      Array.from({ length: 13 }, (_, i) => new CardSK('yrbColor', i + 1, color))
    const coloredCards = Array.from({ length: 3 }, (_, i) => [
      ...oneColorCards(colors[i])
    ]).flatMap((key) => key)
    const blackCards = Array.from(
      { length: 13 },
      (_, i) => new CardSK('black', i + 1, 'black')
    )
    const pirateCards = Array.from(
      { length: 5 },
      () => new CardSK('character', 'pirate')
    )
    // const smCard = new Card('scaryMary')
    const skCard = new CardSK('character', 'skullKing')
    const mermaidCards = Array.from(
      { length: 2 },
      () => new CardSK('character', 'mermaid')
    )
    const escapeCards = Array.from(
      { length: 5 },
      () => new CardSK('escape', 'escape')
    )
    const SKCards = [
      ...coloredCards,
      ...blackCards,
      ...pirateCards,
      skCard,
      ...mermaidCards,
      ...escapeCards
    ]
    return SKCards
  }
}
