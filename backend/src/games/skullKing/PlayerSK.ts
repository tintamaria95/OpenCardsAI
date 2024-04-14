import { Player } from '../commonClasses/Player'
import { CardSK } from './CardSK'

export class PlayerSK extends Player{
  
  declare protected cards: CardSK[]
  private contract: number
  private nbWonTricksForRound = 0
  private bonusPoints = 0
  private gameScore = 0

  constructor(userId: string, username: string) {
    super(userId, username)
    this.contract = -1
  }

  getCards(){
    return this.cards
  }
  
  getGameScore(){
    return this.gameScore
  }

  addToGameScore(roundScore: number){
    this.gameScore += roundScore
  }

  incrementWonTricks(){
    this.nbWonTricksForRound += 1
  }

  getWonTricks(){
    return this.nbWonTricksForRound
  }

  getBonusPoints(){
    return this.bonusPoints
  }

  addToBonusPoints(points: number){
    this.bonusPoints += points
  }

  resetRoundStats() {
    this.nbWonTricksForRound = 0
    this.bonusPoints = 0
  }

  setContract(n: number) {
    this.contract = n
  }

  getContract() {
    return this.contract
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
