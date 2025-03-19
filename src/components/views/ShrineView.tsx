import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import styled from 'styled-components'

const ShrineContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #333;
  overflow-y: auto;
`

const ShrinePlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 1.5rem;
`

function ShrineView() {
  // Shrine view implementation will come later
  
  return (
    <ShrineContainer>
      <ShrinePlaceholder>
        Member Summoning (Coming Soon)
      </ShrinePlaceholder>
    </ShrineContainer>
  )
}

export default ShrineView