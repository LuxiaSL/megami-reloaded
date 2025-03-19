import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import styled from 'styled-components'

const BattleContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #333;
  position: relative;
`

const BattlePlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 1.5rem;
`

function BattleView() {
  // Battle view implementation will come later
  
  return (
    <BattleContainer>
      <BattlePlaceholder>
        Combat System (Coming Soon)
      </BattlePlaceholder>
    </BattleContainer>
  )
}

export default BattleView