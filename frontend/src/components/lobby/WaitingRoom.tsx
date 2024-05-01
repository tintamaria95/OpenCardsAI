import { useLobbyContext } from "./contexts/LobbyContext"
import { Navigate, Link } from "react-router-dom"

export function WaitingRoom(){
    const { currentLobby } = useLobbyContext()

    return currentLobby == undefined
     ? (
        <Navigate to={'/'} replace />
      ) : (
        <>
          <h1>{currentLobby.name}</h1>
          {currentLobby.isPublic ? <div>- Public -</div> : <div>- Private -</div>}
          {currentLobby.isPublic ? (
            <div></div>
          ) : (
            <div>
              <b>Invitation code: {currentLobby.id}</b>
            </div>
          )}
          <section>
            <h3>Joueurs dans le lobby:</h3>
            <ul>
              {currentLobby.users.length > 0 ? (
                currentLobby.users.map((user, index) => (
                  <li key={index}>{user.username}</li>
                ))
              ) : (
                <div>No player found... There might be an error somewhere</div>
              )}
            </ul>
          </section>
    
          <Link to={'/'}>retour</Link>
        </>
      )
}