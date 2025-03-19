import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import styled from 'styled-components'

const InventoryContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
`

const InventoryPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 1.5rem;
`

function InventoryView() {
  // Inventory view implementation will come later
  
  return (
    <InventoryContainer>
      <InventoryPlaceholder>
        Inventory Management (Coming Soon)
      </InventoryPlaceholder>
    </InventoryContainer>
  )
}

export default InventoryView