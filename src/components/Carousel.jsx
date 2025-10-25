import { useState, useEffect } from 'react'

function Carousel({ photos }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedPhotos, setLoadedPhotos] = useState([])

  useEffect(() => {
    const validPhotos = []
    let loadedCount = 0

    photos.forEach((photo, index) => {
      const img = new Image()
      img.onload = () => {
        validPhotos[index] = photo
        loadedCount++
        if (loadedCount === photos.length) {
          setLoadedPhotos(validPhotos.filter(Boolean))
        }
      }
      img.onerror = () => {
        loadedCount++
        if (loadedCount === photos.length) {
          setLoadedPhotos(validPhotos.filter(Boolean))
        }
      }
      img.src = photo
    })
  }, [photos])

  useEffect(() => {
    if (loadedPhotos.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadedPhotos.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [loadedPhotos.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + loadedPhotos.length) % loadedPhotos.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % loadedPhotos.length)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  if (loadedPhotos.length === 0) {
    return (
      <div className="carousel-container">
        <div className="carousel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'white', fontSize: '1.2rem' }}>Carregando fotos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="carousel-container">
      <div className="carousel">
        {loadedPhotos.map((photo, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
          >
            <img src={photo} alt={`Slide ${index + 1}`} />
          </div>
        ))}
        
        <button className="carousel-button prev" onClick={goToPrevious}>
          ‹
        </button>
        <button className="carousel-button next" onClick={goToNext}>
          ›
        </button>
      </div>
      
      <div className="carousel-dots">
        {loadedPhotos.map((_, index) => (
          <div
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel