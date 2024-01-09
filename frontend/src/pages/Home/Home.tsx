import { Link } from 'react-router-dom'
import Counter from '../../components/Counter/Counter'

function Home() {
  return (
    <>
      <h1>CARDGAMES</h1>
      <div id="subtitle">Jouez à vos jeux de cartes préférés</div>
      <div> Image du jeu choisi</div>
      <h3>Changer de jeu</h3>
      <h3>Personnaliser l'avatar</h3>
      <div id="avatar">Image avatar</div>
      <div id="pseudo">Pseudo joueur</div>
      <div>
        <Link to={'publiclobby'}>Lobbys publics</Link>
      </div>
      <div>
        <Link to={'privatelobby'}>Lobby privé</Link>
      </div>
      <div>Vous avez un code d'invitation ?</div>
      <div>Apprenez à jouer...</div>
      <Counter/>
    </>
  )
}

export default Home
