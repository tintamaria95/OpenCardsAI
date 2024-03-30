import { Card } from './Card'

export class Player {
  private id: string
  private cards: Card[]
  private contract: number
  private nbWonFoldsForRound = 0
  private bonusPoints = 0
  private gameScore = 0

  constructor(sessionId: string) {
    this.id = sessionId
    this.cards = []
    this.contract = -1
  }

  getId(){
    return this.id
  }

  getHand(){
    let hand = ''
    this.cards.forEach(card => {
      hand = hand.concat(`| ${card.get_name()}`)})
    return hand
  }

  getGameScore(){
    return this.gameScore
  }

  addToGameScore(roundScore: number){
    this.gameScore += roundScore
  }

  incrementWonFolds(){
    this.nbWonFoldsForRound += 1
  }

  getWonFolds(){
    return this.nbWonFoldsForRound
  }

  getBonusPoints(){
    return this.bonusPoints
  }

  addToBonusPoints(points: number){
    this.bonusPoints += points
  }

  set_cards(cards: Card[]) {
    this.cards = cards
  }

  resetRoundStats() {
    this.nbWonFoldsForRound = 0
    this.bonusPoints = 0
  }

  playCard(i: number) {
    /**
     * return the played card and remove it from the hand.
     */
    const card = this.cards[i]
    this.cards.splice(i, 1)
    return card
  }

  setContract(n: number) {
    this.contract = n
  }

  getContract() {
    return this.contract
  }
}
