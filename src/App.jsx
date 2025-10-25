import { useState } from 'react'
import Quiz from './components/Quiz'
import Celebration from './components/Celebration'
import Stars from './components/Stars'
import './App.css'

function App() {
  const [showCelebration, setShowCelebration] = useState(false)

  return (
    <>
      <Stars />
      {!showCelebration ? (
        <Quiz onComplete={() => setShowCelebration(true)} />
      ) : (
        <Celebration />
      )}
    </>
  )
}

export default App