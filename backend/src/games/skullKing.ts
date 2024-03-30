import { Deck } from './components/Deck'
import { Card } from './components/Card'
import { skColors } from './components/Card'
import { Player } from './components/Player'
import { AsyncGame } from './components/AsyncGame'
import { randomInt } from 'crypto'
import * as cliProgress from 'cli-progress'

const colors: skColors[] = ['yellow', 'red', 'blue']
const oneColorCards = (color: skColors) =>
  Array.from({ length: 13 }, (_, i) => new Card('yrbColor', i + 1, color))
const coloredCards = Array.from({ length: 3 }, (_, i) => [
  ...oneColorCards(colors[i])
]).flatMap((key) => key)
const blackCards = Array.from(
  { length: 13 },
  (_, i) => new Card('black', i + 1, 'black')
)
const pirateCards = Array.from(
  { length: 5 },
  () => new Card('character', 'pirate')
)
// const smCard = new Card('scaryMary')
const skCard = new Card('character', 'skullKing')
const mermaidCards = Array.from(
  { length: 2 },
  () => new Card('character', 'mermaid')
)
const escapeCards = Array.from(
  { length: 5 },
  () => new Card('escape', 'escape')
)
const allCards = [
  ...coloredCards,
  ...blackCards,
  ...pirateCards,
  skCard,
  ...mermaidCards,
  ...escapeCards
]

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect)
const nbTests = 1
bar.start(nbTests, 1)

// Simulate game with random actions for players
for (let test_i = 0; test_i < nbTests; test_i++) {
  bar.update(test_i + 1)
  const deck = new Deck(allCards)

  const player1 = new Player('martin')
  const player2 = new Player('charles')
  const player4 = new Player('max')
  const player5 = new Player('lucas')
  const game = new AsyncGame([player1, player2, player4, player5], deck)

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