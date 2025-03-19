import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import styled from 'styled-components'

const AreaContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
`

const AreaPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 1.5rem;
`

function AreaView() {
  // Area view implementation will come later
  
  return (
    <AreaContainer>
      <AreaPlaceholder>
        Area Details (Coming Soon)
      </AreaPlaceholder>
    </AreaContainer>
  )
}

export default AreaView