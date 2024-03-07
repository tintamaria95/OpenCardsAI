import { Deck } from "./components/Deck"
import { Card } from "./components/Card"
import { skColors } from "./components/Card"
import { Game } from "./components/Game"
import { Player } from "./components/Player"
 
const colors: skColors[] = ['yellow', 'red', 'blue']
const oneColorCards = (color: skColors) => Array.from({length: 13}, (_, i) => new Card('yrbColor', i+1, color))
const coloredCards = Array.from({length: 3}, (_, i) => [...oneColorCards(colors[i])]).flatMap(key =>key)
const blackCards = Array.from({length: 13}, (_, i) => new Card('black', i+1, 'black'))
const pirateCards = Array.from({length: 5}, () => new Card('character', 'pirate'))
// const smCard = new Card('scaryMary')
const skCard = new Card('character', 'skullKing')
const mermaidCards = Array.from({length: 2}, () => new Card('character', 'mermaid'))
const escapeCards = Array.from({length: 5}, () => new Card('escape', 'escape'))
const allCards = [...coloredCards, ...blackCards, ...pirateCards, skCard, ...mermaidCards, ...escapeCards]

const deck = new Deck(allCards)

const player1 = new Player('1')
const player2 = new Player('2')

const game = new Game([player1, player2], deck)
console.log('begin play')
game.play()
