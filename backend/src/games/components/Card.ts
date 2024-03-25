export type skColors = 'yellow' | 'red' | 'blue' | 'black'
type CardCategory = 'escape' | 'yrbColor' | 'black' | 'character'

export class Card {
  readonly value: number | 'escape' | 'pirate' | 'skullKing' | 'mermaid'
  readonly color?: skColors
  readonly category: CardCategory
  readonly id: string
  static readonly categoryHierarchy: CardCategory[] = [
    'escape',
    'yrbColor',
    'black',
    'character'
  ]

  constructor(
    category: CardCategory,
    value: number | 'escape' | 'pirate' | 'skullKing' | 'mermaid',
    color?: skColors
  ) {
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
    this.value = value
    this.color = color
    if (color !== undefined) {
      this.id = value.toString() + color
    } else {
      this.id = value.toString()
    }
  }
}
