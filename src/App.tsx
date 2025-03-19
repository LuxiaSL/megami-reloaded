import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './state/store'
import { initializeGame, gameTick } from './state/gameSlice'
import GameContainer from './components/GameContainer'

function App() {
  const dispatch = useDispatch()
  const isInitialized = useSelector((state: RootState) => state.game.initialized)

  // Initialize game on first load
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeGame())
    }
  }, [dispatch, isInitialized])

  // Set up game loop (1 tick per second)
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        dispatch(gameTick())
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [dispatch, isInitialized])

  return (
    <div className="app">
      {isInitialized ? (
        <GameContainer />
      ) : (
        <div className="loading">Loading...</div>
      )}
    </div>
  )
}

export default App