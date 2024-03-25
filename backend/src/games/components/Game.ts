import { randomInt } from 'crypto'
import { Deck } from './Deck'
import { Player } from './Player'
import { Pile } from './Pile'

export class Game {
  private nb_players: number
  private deck: Deck
  private nb_rounds: number
  private players: Player[]
  private round_first_player_index: number
  private fold_winner_index: number

  constructor(players: Player[], deck: Deck) {
    this.players = players
    this.nb_players = players.length
    this.deck = deck
    this.nb_rounds = Math.min(
      10,
      Math.floor(deck.get_deck_size() / this.nb_players)
    )
    this.round_first_player_index = randomInt(this.nb_players)
    this.fold_winner_index = this.round_first_player_index
  }

  get_nb_rounds() {
    return this.nb_rounds
  }

  play() {
    for (let round = 1; round < this.get_nb_rounds() + 1; round++) {
      this.play_round(round)
    }
  }

  play_round(round: number) {
    this.deck.shuffle()
    // Distribute cards to players
    const round_cards = this.deck.get_cards(this.nb_players * round)
    for (let p_i = 0; p_i < this.nb_players; p_i++) {
      this.players[p_i].set_cards(
        round_cards.slice(p_i * round, p_i * round + round)
      )
    }
    // Each player chooses a contract // Must change to simultaneous later
    for (let p_i = 0; p_i < this.nb_players; p_i++) {
      const randContract = randomInt(round + 1)

      this.players[p_i].set_contract(randContract)
    }
    // Each player add a card to the Pile
    for (let card_i = 0; card_i < round; card_i++) {
      const pile = new Pile()
      for (let p_i = 0; p_i < this.nb_players; p_i++) {
        const playerIndex = (p_i + this.fold_winner_index) % this.nb_players
        const chosenCard = this.players[playerIndex].play_card(randomInt(round))
        pile.addCard(chosenCard)
      }
    }
    console.log('end round %d', round)
  }
}
