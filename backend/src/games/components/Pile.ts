import { Card } from "./Card"

/**
 * Represents the card pile in a folding game. Pile object handles logic to compare a new card added to the Pile to the current winning card of the fold.
 */
export class Pile{

    private pile : Array<Card>
    private currentWinnningCardIndex=-1
    private fold_bonus_points = 0
    private pirateCardIndex = -1
    private skullKingCardIndex = -1
    private mermaidCardIndex = -1

    private bonusPointsconfig = {
        captureMermaid: 0,
        capturePirate: 30,
        captureSK: 50
    }

    constructor(){
        this.pile = []
    }


    getWinningCardIndex(){
        return this.currentWinnningCardIndex
    }

    getBonusPoints(){
        return this.fold_bonus_points
    }


    addCard(card: Card){
        this.pile.push(card)
        if(this.currentWinnningCardIndex === -1){
            this.currentWinnningCardIndex = 0
        } else {
            // No need to check winning card if trio is in fold -> winning card is always Mermaid and should have been set as 'mermaid' card already
            if (!(this.pirateCardIndex !== -1 && this.skullKingCardIndex !== -1 && this.mermaidCardIndex !== -1)){
                const index = this.updateWinningCardIndex(this.currentWinnningCardIndex, this.pile.length - 1)
                if(index == -1) { throw new Error('index of winning card must not be -1. Error in getWinningCardIndex')}
                this.currentWinnningCardIndex = index
            }
        }
    }

    private updateWinningCardIndex(firstCardIndex: number, nextCardIndex: number){
        const firstCard = this.pile[firstCardIndex]
        const nextCard = this.pile[nextCardIndex]
        if (Card.categoryHierarchy.indexOf(firstCard.category) > Card.categoryHierarchy.indexOf(nextCard.category)){
            return firstCardIndex
        } else if (Card.categoryHierarchy.indexOf(firstCard.category) < Card.categoryHierarchy.indexOf(nextCard.category)){
            return nextCardIndex
        } else {
            // Both cards belong to the same category of card
            if (firstCard.category == "escape"){
                return firstCardIndex
            }
            else if (firstCard.category == "yrbColor" || firstCard.category == "black"){
                if (firstCard.color !== nextCard.color){
                    return firstCardIndex
                } else {
                    if (firstCard.value > nextCard.value){
                        return firstCardIndex
                    } else {
                        return nextCardIndex
                    }
                }
            }
            else if (firstCard.category == 'character') {
                if (firstCard.value === nextCard.value) {
                    return firstCardIndex
                } else {
                    if (firstCard.value == 'pirate'){
                        this.pirateCardIndex = firstCardIndex
                        if (nextCard.value == 'mermaid') {
                            this.mermaidCardIndex = nextCardIndex
                            if (this.skullKingCardIndex !== -1){
                                this.fold_bonus_points = this.bonusPointsconfig['captureSK']
                                return nextCardIndex
                            }
                            this.fold_bonus_points = this.bonusPointsconfig['captureMermaid']
                            return firstCardIndex
                        } else if (nextCard.value == 'skullKing') {
                            this.skullKingCardIndex = nextCardIndex
                            if (this.mermaidCardIndex !== -1){
                                this.fold_bonus_points = this.bonusPointsconfig['captureSK']
                                return this.mermaidCardIndex
                            }
                            this.fold_bonus_points = this.bonusPointsconfig['capturePirate']
                            return nextCardIndex
                        } else {
                            throw new Error('Unhandled case 1')
                        }
                    }
                    else if (firstCard.value == 'skullKing') {
                        this.skullKingCardIndex = firstCardIndex
                        if (nextCard.value == 'pirate') {
                            this.pirateCardIndex = nextCardIndex
                            if (this.mermaidCardIndex !== -1){
                                this.fold_bonus_points = this.bonusPointsconfig['captureSK']
                                return this.mermaidCardIndex
                            }
                            this.fold_bonus_points = this.bonusPointsconfig['capturePirate']
                            return firstCardIndex
                        } else if (nextCard.value == 'mermaid') {
                            this.mermaidCardIndex = nextCardIndex
                            this.fold_bonus_points = this.bonusPointsconfig['captureSK']
                            return nextCardIndex
                            
                        } else {
                            throw new Error('Unhandled case 2')
                        }

                    } else if (firstCard.value == 'mermaid') {
                        this.mermaidCardIndex = firstCardIndex
                        if (nextCard.value == 'skullKing') {
                            this.skullKingCardIndex = nextCardIndex
                            this.fold_bonus_points = this.bonusPointsconfig['captureSK']
                            return firstCardIndex
                        } else if (nextCard.value == 'pirate') {
                            this.pirateCardIndex = nextCardIndex
                            if (this.skullKingCardIndex !== -1) {
                                this.fold_bonus_points = this.bonusPointsconfig['captureSK']
                                return firstCardIndex
                            }
                            this.fold_bonus_points = this.bonusPointsconfig['captureMermaid']
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