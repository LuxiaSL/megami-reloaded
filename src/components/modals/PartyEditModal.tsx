import styled from 'styled-components'

const ModalContent = styled.div`
  background-color: #333;
  border-radius: 8px;
  padding: 20px;
  width: 800px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  color: white;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #444;
`

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 5px;
  transition: color 0.2s;
  
  &:hover {
    color: white;
  }
`

interface PartyEditModalProps {
  data: any
  onClose: () => void
}

function PartyEditModal({ data, onClose }: PartyEditModalProps) {
  // Prevent click propagation to modal overlay
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  
  return (
    <ModalContent onClick={handleContentClick}>
      <ModalHeader>
        <ModalTitle>Edit Parties</ModalTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </ModalHeader>
      
      <div>
        {/* Placeholder content - will be implemented later */}
        <p>Party management interface will be shown here</p>
        <p>This will allow moving members and items between parties</p>
      </div>
    </ModalContent>
  )
}

export default PartyEditModal