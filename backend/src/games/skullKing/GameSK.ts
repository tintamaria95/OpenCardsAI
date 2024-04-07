import { randomInt } from 'crypto'
import { DeckSK } from './DeckSK'
import { PlayerSK } from './PlayerSK'
import { PileSK } from './PileSK'
import { gameLogger } from '../../logger'
import { Game } from '../commonClasses/Game'

export class GameSK extends Game {
  private nb_players: number
  private deck: DeckSK
  private nb_rounds: number
  private players: PlayerSK[]
  private round_first_player_index: number
  private trick_winner_index: number

  constructor(players: PlayerSK[], deck: DeckSK) {
    super()
    this.players = players
    this.nb_players = players.length
    this.deck = deck
    this.nb_rounds = Math.min(
      3,
      Math.floor(deck.getDeckSize() / this.nb_players)
    )
    this.round_first_player_index = randomInt(this.nb_players)
    this.trick_winner_index = this.round_first_player_index
  }

  getNumberRounds() {
    return this.nb_rounds
  }

  play() {
    for (let round = 1; round < this.getNumberRounds() + 1; round++) {
      this.play_round(round)
    }
  }

  /**
  * Returns the score for a given contract and the tricks that a player won during this round. The bonus points are added to the score if the player completed its contract. 
  */
  score(round: number, contract: number, wonTricks: number, bonusPoints: number){
    if(contract === 0){
      if(wonTricks === 0){
        return round * 10
      } else {
        return round * (-10)
      }
    } else {
      if(contract === wonTricks){
        return wonTricks * 20 + bonusPoints
      } else {
        return Math.abs(contract - wonTricks) * (-10)
      }
    }
  }

  play_round(round: number) {
    this.round_first_player_index = (this.round_first_player_index + 1) % this.nb_players
    this.trick_winner_index = this.round_first_player_index
    this.deck.shuffle()
    this.players.forEach(player => {player.resetRoundStats()})
    // Distribute cards to players
    const round_cards = this.deck.getCards(this.nb_players * round)
    for (let p_i = 0; p_i < this.nb_players; p_i++) {
      this.players[p_i].set_cards(
        round_cards.slice(p_i * round, p_i * round + round)
      )
    }
    // Each player chooses a contract // Must change to simultaneous later
    for (let p_i = 0; p_i < this.nb_players; p_i++) {
      const randContract = randomInt(round + 1)
      this.players[p_i].setContract(randContract)
    }
    // Each player add a card to the Pile
    for (let card_i = 0; card_i < round; card_i++) {
      gameLogger.debug('first player: ' + this.trick_winner_index)
      const pile = new PileSK()
      for (let p_i = 0; p_i < this.nb_players; p_i++) {
        const playerIndex = (p_i + this.trick_winner_index) % this.nb_players
        const chosenCard = this.players[playerIndex].playCard(randomInt(round - card_i))
        pile.addCard(chosenCard)
      }
      pile.show()
      gameLogger.debug('winning card: ' + pile.getWinningCardIndex().toString())
      this.trick_winner_index = (this.trick_winner_index + pile.getWinningCardIndex()) % this.nb_players
      gameLogger.debug('trick winner: ' + (this.trick_winner_index.toString()))
      this.players[this.trick_winner_index].incrementWonTricks()
      this.players[this.trick_winner_index].addToBonusPoints(pile.getBonusPoints())
    }
    gameLogger.debug('player tricks:')
    this.players.forEach(player => {
      gameLogger.debug(`Player ${player.getId()}: ${player.getWonTricks()} / ${player.getContract()}`)
      player.addToGameScore(this.score(round, player.getContract(), player.getWonTricks(), player.getBonusPoints()))
      gameLogger.debug(`Score : ${player.getGameScore()}`)
    })
    gameLogger.debug(`end round ${round}`)
  }
}
