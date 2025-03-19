import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import styled from 'styled-components'

const FusionContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #333;
  overflow-y: auto;
`

const FusionPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 1.5rem;
`

function FusionView() {
  // Fusion view implementation will come later
  
  return (
    <FusionContainer>
      <FusionPlaceholder>
        Member Fusion (Coming Soon)
      </FusionPlaceholder>
    </FusionContainer>
  )
}

export default FusionView