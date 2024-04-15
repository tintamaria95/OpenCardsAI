import { DeckSK } from './DeckSK'
import { AsyncGameSK } from './AsyncGameSK'
import { PlayerSK } from './PlayerSK'

import * as cliProgress from 'cli-progress'


const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect)
const nbTests = 1
// console.time('executionTime')
bar.start(nbTests, 1)

// Simulate game with random actions for players
for (let index = 0; index < nbTests; index++) {
  bar.update(index + 1)
  const deck = new DeckSK()

  const player1 = new PlayerSK('1', 'martin')
  const player2 = new PlayerSK('2', 'charles')
  // const player4 = new PlayerSK('3', 'max')
  // const player5 = new PlayerSK('4', 'lucas')
  const game = new AsyncGameSK([player1, player2], deck, 3)

  // while (!game.isEnded()) {
    const update = game.getRandomPossibleAction()
    if (update !== undefined) {
      game.updateState(update.action, update.playerId)
    } else {
      throw new Error('Undefined updsate object')
    }
  // }
}

// console.timeEnd('executionTime')