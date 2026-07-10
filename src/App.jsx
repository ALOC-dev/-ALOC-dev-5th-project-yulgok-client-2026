import {Routes, Route} from 'react-router-dom'
import './App.css'
import Login from './pages/Login/Login.jsx'
import KakaoCallback from './pages/Login/KakaoCallback.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
      </Routes>
    </>
  )
}

export default App
