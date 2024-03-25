import { Card } from './Card'

export class Player {
  private id: string
  private cards: Card[]
  private contract?: number
  private nb_won_folds_for_round = 0
  private bonus_points = 0

  constructor(sessionId: string) {
    this.id = sessionId
    this.cards = []
  }

  set_cards(cards: Card[]) {
    this.cards = cards
  }

  get_cards() {
    return this.cards
  }

  reset_round_stats() {
    this.nb_won_folds_for_round = 0
    this.bonus_points = 0
  }

  play_card(i: number) {
    const card = this.get_cards()[i]
    this.cards.slice(i, 1)
    return card
  }

  set_contract(n: number) {
    this.contract = n
  }

  get_contract() {
    return this.contract
  }
}
