import { Route, Routes } from 'react-router-dom'
import './App.css'

import Home from '../pages/Home/Home'
import PublicLobby from '../pages/PublicLobby/PublicLobby'
import PrivateLobby from '../pages/PrivateLobby/PrivateLobby'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="publiclobby" element={<PublicLobby />} />
          <Route path="privatelobby" element={<PrivateLobby />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
