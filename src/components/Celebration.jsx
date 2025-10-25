import { useState, useEffect } from 'react'
import { photos } from '../quizData'
import { createConfetti, createHearts, createFallingPhotos } from '../utils/animations'
import Letter from './Letter'
import Carousel from './Carousel'

function Celebration() {
  const [showLetter, setShowLetter] = useState(true)

  useEffect(() => {
    if (!showLetter) {
      createConfetti()
      createHearts()

      const confettiInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          createConfetti()
        }
      }, 3000)

      const photosInterval = setInterval(() => {
        createFallingPhotos(photos)
      }, 2000)

      return () => {
        clearInterval(confettiInterval)
        clearInterval(photosInterval)
      }
    }
  }, [showLetter])

  const handleCelebrate = () => {
    createConfetti()
    createHearts()
    
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }

  return (
    <>
      {showLetter && <Letter onClose={() => setShowLetter(false)} />}
      
      <div className="container">
        <div className="card">
          <h1 className="title">🎉 Parabéns tu chegou ao final! (eu não botava fé pelo nivel do quiz) 🎉</h1>
          <p className="message">
            Agora se saboreia com fotos e efeitos especiais!
          </p>
          <div className="name">Te amo Giulia</div>
          <p className="message">
            Tu merece o mundo! 💖
          </p>
          
          <Carousel photos={photos} />
          
          <button className="button" onClick={handleCelebrate}>
            MAIS EFEITOS! 🎊
          </button>
        </div>
      </div>
    </>
  )
}

export default Celebration