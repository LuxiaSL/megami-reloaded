import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../state/store'
import { toggleAutoSave } from '../state/gameSlice'
import styled from 'styled-components'

const FooterWrapper = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: white;
  height: 40px;
  font-size: 0.8rem;
`

const GameControls = styled.div`
  display: flex;
  gap: 10px;
`

const ControlButton = styled.button`
  background-color: #444;
  color: white;
  border: none;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background-color: #555;
  }
`

const GameStatus = styled.div`
  display: flex;
  gap: 15px;
`

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

function Footer() {
  const dispatch = useDispatch()
  const gameCounter = useSelector((state: RootState) => state.game.counter)
  const autoSave = useSelector((state: RootState) => state.game.autoSave)
  
  // Convert counter to days/hours format
  const days = Math.floor(gameCounter / (60 * 60 * 24))
  const hours = Math.floor((gameCounter % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((gameCounter % (60 * 60)) / 60)
  
  const handleAutoSaveToggle = () => {
    dispatch(toggleAutoSave())
  }
  
  // Function to manually save the game
  const handleManualSave = () => {
    // In a full implementation, we would handle manual saving here
    // For now, just rely on auto-save in the store subscription
    const state = JSON.stringify({
      savedDate: Date.now(),
      // Other state properties would be included here
    })
    localStorage.setItem('megamiQuest2SaveData', state)
  }
  
  return (
    <FooterWrapper>
      <GameControls>
        <ControlButton onClick={handleManualSave}>
          Save
        </ControlButton>
        <ControlButton onClick={handleAutoSaveToggle}>
          Auto Save: {autoSave ? 'On' : 'Off'}
        </ControlButton>
      </GameControls>
      
      <GameStatus>
        <StatusItem>
          <span>Time:</span>
          <span>{days}d {hours}h {minutes}m</span>
        </StatusItem>
        <StatusItem>
          <span>v2.0.0</span>
        </StatusItem>
      </GameStatus>
    </FooterWrapper>
  )
}

export default Footer