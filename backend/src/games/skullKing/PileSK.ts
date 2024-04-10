import { gameLogger } from '../../logger'
import { CardSK, skColors } from './CardSK'
import { Pile } from '../commonClasses/Pile'

/**
 * Represents the card pile of Skull King game.
 * */
export class PileSK extends Pile {

  declare pile: Array<CardSK>

  private trickBonusPoints = 0
  private pirateCardIndex = -1
  private skullKingCardIndex = -1
  private mermaidCardIndex = -1

  private trickColor?: skColors = undefined

  private bonusPointsconfig = {
    captureMermaid: 0,
    capturePirate: 30,
    captureSK: 50
  }

  getBonusPoints() {
    return this.trickBonusPoints
  }

  public getTrickColor(){
    return this.trickColor
  }

  /**
   * This function attaches to the pile the information of the color played by the first player. It must be called only if a color is played as the first card or after first card(s) being "escape(s)".
   */
  private setTrickColor(color: skColors | undefined){
    this.trickColor = color
  }

  getCurrentWinningCardIndex(){
    // Case where Only 'escape' cards have been played, the first 'escape' wins
    if (this.pile.length > 0 && this.currentWinnningCardIndex === -1){
      return 0
    }
    return this.currentWinnningCardIndex
  }


  addCard(card: CardSK) {
    this.pile.push(card)
    if (this.currentWinnningCardIndex === -1 && card.category !== 'escape') {
        this.currentWinnningCardIndex = 0
        if(card.category === 'black' || card.category === 'yrbColor'){
          this.setTrickColor(card.color)
        }
    } else {
      this.updateWinningCardIndex()
    }
  }

  private isAllTrioPlayed(){
    return (
        this.pirateCardIndex !== -1 &&
        this.skullKingCardIndex !== -1 &&
        this.mermaidCardIndex !== -1
      )
  }

  private updateWinningCardIndex(){ 
      // No need to check winning card if trio is in trick -> winning card is always Mermaid and should have been set as 'mermaid' card already
      if (!this.isAllTrioPlayed()) {
        const index = this.getUpdatedWinningCardIndex(
          this.getCurrentWinningCardIndex(),
          this.pile.length - 1
        )
        if (index === -1) {
          throw new Error(
            'index of winning card must not be -1. Error in getCurrentWinningCardIndex'
          )
        }
        this.currentWinnningCardIndex = index
      }
  }

  protected getUpdatedWinningCardIndex(
    firstCardIndex: number,
    nextCardIndex: number
  ) {
    const firstCard = this.pile[firstCardIndex]
    const nextCard = this.pile[nextCardIndex]
    if (
      CardSK.categoryHierarchy.indexOf(firstCard.category) >
      CardSK.categoryHierarchy.indexOf(nextCard.category)
    ) {
      return firstCardIndex
    } else if (
      CardSK.categoryHierarchy.indexOf(firstCard.category) <
      CardSK.categoryHierarchy.indexOf(nextCard.category)
    ) {
      return nextCardIndex
    } else {
      // Both cards belong to the same category of card
      if (firstCard.category == 'escape') {
        return firstCardIndex
      } else if (
        firstCard.category == 'yrbColor' ||
        firstCard.category == 'black'
      ) {
        if (firstCard.color !== nextCard.color) {
          return firstCardIndex
        } else {
          if (firstCard.value > nextCard.value) {
            return firstCardIndex
          } else {
            return nextCardIndex
          }
        }
      } else if (firstCard.category == 'character') {
        if (firstCard.value === nextCard.value) {
          return firstCardIndex
        } else {
          if (firstCard.value == 'pirate') {
            this.pirateCardIndex = firstCardIndex
            if (nextCard.value == 'mermaid') {
              this.mermaidCardIndex = nextCardIndex
              if (this.skullKingCardIndex !== -1) {
                this.trickBonusPoints = this.bonusPointsconfig['captureSK']
                return nextCardIndex
              }
              this.trickBonusPoints = this.bonusPointsconfig['captureMermaid']
              return firstCardIndex
            } else if (nextCard.value == 'skullKing') {
              this.skullKingCardIndex = nextCardIndex
              if (this.mermaidCardIndex !== -1) {
                this.trickBonusPoints = this.bonusPointsconfig['captureSK']
                return this.mermaidCardIndex
              }
              this.trickBonusPoints = this.bonusPointsconfig['capturePirate']
              return nextCardIndex
            } else {
              throw new Error('Unhandled case 1')
            }
          } else if (firstCard.value == 'skullKing') {
            this.skullKingCardIndex = firstCardIndex
            if (nextCard.value == 'pirate') {
              this.pirateCardIndex = nextCardIndex
              if (this.mermaidCardIndex !== -1) {
                this.trickBonusPoints = this.bonusPointsconfig['captureSK']
                return this.mermaidCardIndex
              }
              this.trickBonusPoints = this.bonusPointsconfig['capturePirate']
              return firstCardIndex
            } else if (nextCard.value == 'mermaid') {
              this.mermaidCardIndex = nextCardIndex
              this.trickBonusPoints = this.bonusPointsconfig['captureSK']
              return nextCardIndex
            } else {
              throw new Error('Unhandled case 2')
            }
          } else if (firstCard.value == 'mermaid') {
            this.mermaidCardIndex = firstCardIndex
            if (nextCard.value == 'skullKing') {
              this.skullKingCardIndex = nextCardIndex
              this.trickBonusPoints = this.bonusPointsconfig['captureSK']
              return firstCardIndex
            } else if (nextCard.value == 'pirate') {
              this.pirateCardIndex = nextCardIndex
              if (this.skullKingCardIndex !== -1) {
                this.trickBonusPoints = this.bonusPointsconfig['captureSK']
                return firstCardIndex
              }
              this.trickBonusPoints = this.bonusPointsconfig['captureMermaid']
              return nextCardIndex
            } else {
              throw new Error('Unhandled case 3')
            }
          }
        }
      } else {
        console.log('error: category undefined')
        throw new Error('Undefined card category')
      }
    }
    return -1
  }
}
