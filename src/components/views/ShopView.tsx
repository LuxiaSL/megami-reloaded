import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import styled from 'styled-components'

const ShopContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
`

const ShopPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 1.5rem;
`

function ShopView() {
  // Shop view implementation will come later
  
  return (
    <ShopContainer>
      <ShopPlaceholder>
        Town Shop (Coming Soon)
      </ShopPlaceholder>
    </ShopContainer>
  )
}

export default ShopView