import { gameLogger } from '../../logger'
import { Card } from './Card'

/**
 * Represents the card pile in a trick-taking game. Pile object handles logic to compare a new card added to the Pile to the current winning card of the trick.
 */
export class Pile {
  protected pile: Array<Card>
  protected currentWinnningCardIndex = -1
 

  constructor() {
    this.pile = []
  }

  getNbCards(){
    return this.pile.length
  }

  getCardsIds(){
    const cardsIds: string[] = []
    this.pile.forEach(card => cardsIds.push(card.getId()))
    return cardsIds
  }

  show(){
    gameLogger.debug('------')
    gameLogger.debug('Pile: ')
    this.pile.forEach(card => {
      gameLogger.debug(card.getName())
    })
    gameLogger.debug('------')
  }

  getCurrentWinningCardIndex() {
    return this.currentWinnningCardIndex
  }


  addCard(card: Card) {
    this.pile.push(card)
    if (this.currentWinnningCardIndex === -1) {
      this.currentWinnningCardIndex = 0
    } else {
      this.getUpdatedWinningCardIndex(
        this.currentWinnningCardIndex,
        this.pile.length - 1
      )
    }
  }

  protected getUpdatedWinningCardIndex(firstCardIndex: number, nextCardIndex: number) {
    // Overwrites this method to handle game logic
    if (firstCardIndex > nextCardIndex) {
      return firstCardIndex
    }
    return nextCardIndex
  }
}
