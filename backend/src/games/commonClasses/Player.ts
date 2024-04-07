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

  setCards(cards: Card[]) {
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

  /**
   * Return the index of the card in the player's hand.
   * @param cardId The card id of the Card object
   * @returns the index of the card in the hand. If not in the hand, returns -1
   */
  getPlayerCardIndex(cardId: string){
    const hand = this.getHand()
    if (hand.includes(cardId)){
      return hand.indexOf(cardId)
    }
    return -1
  }
}
