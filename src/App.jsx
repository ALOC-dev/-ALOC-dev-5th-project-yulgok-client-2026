import {Routes, Route} from 'react-router-dom'
import './App.css'
import Test from './Test.jsx'
import Login from './pages/Login/Login.jsx'
import UserDetails from './pages/UserDetails/UserDetails.jsx'
import KakaoCallback from './pages/Login/KakaoCallback.jsx'
import SurveySleep from './pages/Surveys/SurveySleep.jsx'
import SurveyClean from './pages/Surveys/SurveyClean.jsx'
import SurveyLiving from './pages/Surveys/SurveyLiving.jsx'
import SurveyIntroduce from './pages/Surveys/SurveyIntroduce.jsx'
import Certification from './pages/Certification/Certification.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/test" element={<Test />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
        <Route path="/user/details" element={<UserDetails />} />
        <Route path="/surveys/sleep" element={<SurveySleep />} />
        <Route path="/surveys/clean" element={<SurveyClean />} />
        <Route path="/surveys/living" element={<SurveyLiving />} />
        <Route path="/surveys/introduce" element={<SurveyIntroduce />} />
        <Route path="/certification" element={<Certification />} />
      </Routes>
    </>
  )
}

export default App
