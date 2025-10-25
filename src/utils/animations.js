export function createConfetti() {
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#ff69b4', '#ff1493']
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    confetti.style.left = Math.random() * 100 + '%'
    confetti.style.top = '-10px'
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's'
    confetti.style.animationDelay = Math.random() * 2 + 's'
    confetti.style.opacity = Math.random()
    document.body.appendChild(confetti)
    
    setTimeout(() => confetti.remove(), 5000)
  }
}

export function createHearts() {
  const hearts = ['❤️', '💖', '💕', '💗', '💓', '💝']
  
  for (let i = 0; i < 10; i++) {
    const heart = document.createElement('div')
    heart.className = 'heart'
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)]
    heart.style.left = Math.random() * 100 + '%'
    heart.style.bottom = '-50px'
    heart.style.animationDelay = Math.random() * 2 + 's'
    document.body.appendChild(heart)
    
    setTimeout(() => heart.remove(), 4000)
  }
}

export function createFallingPhotos(photos) {
  for (let i = 0; i < 3; i++) {
    const photoDiv = document.createElement('div')
    photoDiv.className = 'falling-photo'
    photoDiv.style.left = Math.random() * 100 + '%'
    photoDiv.style.top = '-100px'
    photoDiv.style.animationDuration = (Math.random() * 4 + 4) + 's'
    photoDiv.style.animationDelay = Math.random() * 1 + 's'
    
    const img = document.createElement('img')
    img.src = photos[Math.floor(Math.random() * photos.length)]
    img.alt = 'Falling photo'
    
    img.onerror = () => {
      photoDiv.remove()
    }
    
    photoDiv.appendChild(img)
    document.body.appendChild(photoDiv)
    
    setTimeout(() => photoDiv.remove(), 8000)
  }
}