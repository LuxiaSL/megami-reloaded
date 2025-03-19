import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import styled from 'styled-components'

const PartyContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
`

const PartyPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 1.5rem;
`

function PartyView() {
  // Party view implementation will come later
  
  return (
    <PartyContainer>
      <PartyPlaceholder>
        Party Management (Coming Soon)
      </PartyPlaceholder>
    </PartyContainer>
  )
}

export default PartyView