import { useState } from 'react'
import AudioPractice from './AudioPractice'
import LandingPage from './LandingPage'

function App() {
  const [showLanding, setShowLanding] = useState(true)

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />
  }

  return (
    <div>
      <AudioPractice />
    </div>
  )
}

export default App