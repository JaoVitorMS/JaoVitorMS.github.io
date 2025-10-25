import { useState } from 'react'
import { quizData } from '../quizData'
import { createHearts } from '../utils/animations'

function Quiz({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showNext, setShowNext] = useState(false)

  const question = quizData[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.length) * 100

  const handleSelectOption = (index) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(index)
    
    if (index === question.correct) {
      createHearts()
    }

    setTimeout(() => {
      setShowNext(true)
    }, 1000)
  }

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowNext(false)
    } else {
      onComplete()
    }
  }

  const getOptionClass = (index) => {
    if (selectedAnswer === null) return 'option'
    if (index === question.correct) return 'option correct'
    if (index === selectedAnswer) return 'option wrong'
    return 'option'
  }

  return (
    <div className="container">
      <div className="card">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <h1 className="title">Pergunta {currentQuestion + 1} de {quizData.length}</h1>
        <p className="question">{question.question}</p>
        <div className="options">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={getOptionClass(index)}
              onClick={() => handleSelectOption(index)}
              style={{ pointerEvents: selectedAnswer !== null ? 'none' : 'auto' }}
            >
              {option}
            </div>
          ))}
        </div>
        {showNext && (
          <button className="button" onClick={handleNext}>
            {currentQuestion < quizData.length - 1 ? 'Próxima' : 'Ver Surpresa'}
          </button>
        )}
      </div>
    </div>
  )
}

export default Quiz