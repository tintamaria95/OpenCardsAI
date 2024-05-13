import { Card } from "./Card"

export class Player {
  
  protected sessionId: string
  protected userId: string
  protected username: string
  protected cards: Card[]
  protected seatNumber: number

  private socketId?: string

  constructor(sessionId: string, userId: string, username: string, socketId?: string){
    
    this.sessionId = sessionId
    this.userId = userId
    this.username = username
    this.cards = []
    this.seatNumber = 0

    this.socketId = socketId
  }

  getSessionId(){
    return this.sessionId
  }

  getUserId(){
    return this.userId
  }

  getUsername(){
    return this.username
  }

  getCards(){
    return this.cards
  }

  getSocketId(){
    return this.socketId
  }

  getCardIds(){
    const hand: string[] = []
    this.cards.forEach(card => {
      hand.push(card.id)})
    return hand
  }

  setCards(cards: Card[]) {
    this.cards = cards
  }

  setSeat(seatNumber: number){
    this.seatNumber = seatNumber
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
  getCardIndex(cardId: string){
    const hand = this.getCardIds()
    if (hand.includes(cardId)){
      return hand.indexOf(cardId)
    }
    return -1
  }
}
