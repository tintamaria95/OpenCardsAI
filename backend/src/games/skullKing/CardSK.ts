import { Card } from "../commonClasses/Card"

export type SkColors = 'yellow' | 'red' | 'blue' | 'black'
type CardCategory = 'escape' | 'yrbColor' | 'black' | 'character'

export class CardSK extends Card {
  declare value: number | 'escape' | 'pirate' | 'skullKing' | 'mermaid'
  declare readonly color?: SkColors
  
  category: CardCategory
  
  static readonly categoryHierarchy: CardCategory[] = [
    'escape',
    'yrbColor',
    'black',
    'character'
  ]

  constructor( 
    category: CardCategory,
    value: number | 'escape' | 'pirate' | 'skullKing' | 'mermaid',
    color?: SkColors,
    id?: string
  ) {
    super(value, color, id)
    if (
      (category === 'yrbColor' || category === 'black') &&
      typeof value !== 'number'
    ) {
      throw new Error(
        'Error: Colored card must have a value field of type "number"'
      )
    }
    if (category === 'character' && typeof value === 'number') {
      throw new Error(
        'Card of category "character" must have a non-numeric field value'
      )
    }
    this.category = category
  }
}
