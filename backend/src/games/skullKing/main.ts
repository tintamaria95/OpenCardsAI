import { DeckSK } from './DeckSK'
import { randomInt } from 'crypto'
import { AsyncGameSK } from './AsyncGameSK'
import { PlayerSK } from './PlayerSK'

import * as cliProgress from 'cli-progress'


const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect)
const nbTests = 1
bar.start(nbTests, 1)

// Simulate game with random actions for players
for (let test_i = 0; test_i < nbTests; test_i++) {
  bar.update(test_i + 1)
  const deck = new DeckSK()

  const player1 = new PlayerSK('1', 'martin')
  const player2 = new PlayerSK('2', 'charles')
  const player4 = new PlayerSK('3', 'max')
  const player5 = new PlayerSK('4', 'lucas')
  const game = new AsyncGameSK([player1, player2, player4, player5], deck)

  for (let round = 1; round < (game.getRoundIndex() + 1); round++) {
    game.updateState("setContract", randomInt(round + 1), 'martin')
    game.updateState("setContract", randomInt(round + 1), 'charles')
    game.updateState("setContract", randomInt(round + 1), 'lucas')
    game.updateState("setContract", randomInt(round + 1), 'max')
    for (let i = 0; i < round; i++) {
      game.updateState("playCard", randomInt(round - i), 'martin')
      game.updateState("playCard", randomInt(round - i), 'charles')
      game.updateState("playCard", randomInt(round - i), 'max')
      game.updateState("playCard", randomInt(round - i), 'lucas')
      game.updateState("playCard", randomInt(round - i), 'martin')
      game.updateState("playCard", randomInt(round - i), 'charles')
      game.updateState("playCard", randomInt(round - i), 'max')
      game.updateState("playCard", randomInt(round - i), 'lucas')
    }
  }
}