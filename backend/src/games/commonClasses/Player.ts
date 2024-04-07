import { Card } from "./Card"

export class Player {
  protected id: string
  protected username: string
  protected cards: Card[]

  constructor(userId: string, username: string){
    this.id = userId
    this.username = username
    this.cards = []
  }

  Anonymise(){
    this.id = "_"
  }

  getId(){
    return this.id
  }

  getUsername(){
    return this.username
  }

  getHand(){
    const hand: string[] = []
    this.cards.forEach(card => {
      hand.push(card.id)})
    return hand
  }

  set_cards(cards: Card[]) {
    this.cards = cards
  }

  playCard(i: number) {
    /**
     * return the played card and remove it from the hand.
     */
    const card = this.cards[i]
    this.cards.splice(i, 1)
    return card
  }
}
