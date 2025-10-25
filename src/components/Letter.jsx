function Letter({ onClose }) {
  return (
    <div className="letter-popup">
      <div className="letter">
        <div className="letter-content">
          <p>
            Querida Giulia,
          </p>
          <p>
            Hoje é teu aniversário mesmo, parabéns! Como posso expressar o quanto você é especial? O difícil é encontrar um jeito de descrever o quanto minha vida mudou ao te conhecer, e como sou grato por isso.
          </p>
          <p>
            Tivemos nossos momentos. Era para termos mais tempo juntos, criando memórias ainda mais especiais e significativas. Tu sabe que eu tenho meus defeitos e imperfeições, e isso torna complexo expressar tudo em palavras. Mas espero que este pequeno gesto consiga transmitir um pouco do que sinto por você.
          </p>
          <p>
            Eu não sou o melhor com palavras, tu sabe. Às vezes me enrolo, perco a hora certa de falar, deixo passar chances. Mas, mesmo torto, eu sinto muito. E sinto de verdade. Cada momento contigo foi especial de um jeito que eu não consigo esquecer — tá guardado aqui, do meu jeito, com carinho.
          </p>
          <p>
            Eu queria ter mais tempo ao teu lado. Mais conversas profundas, sem o assunto acabar rápido, mais risadas bobas, mais coisas simples que viram lembrança boa. Sei que tenho meus defeitos e não acerto sempre, mas minha intenção com você é sempre a melhor: somar, cuidar, estar por perto. 
          </p>
          <p>
            Hoje é teu dia, e eu só quero te desejar um feliz aniversário, cheio de saúde, paz e motivos pra sorrir. Que a gente encontre mais momentos pra viver junto, mesmo que pequenos. Obrigado por tudo que tu é e por tudo que a tua presença já trouxe pra minha vida. ✨
          </p>
          <div className="letter-signature">
            Com carinho,<br />
            Zequinha seu amiguinho,<br />
            mas quem sabe num futuro próximo...? 💕
          </div>
        </div>
        <button className="letter-close" onClick={onClose}>
          Espiar o que tem atrás 🎁
        </button>
      </div>
    </div>
  )
}

export default Letter