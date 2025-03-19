import styled from 'styled-components'

const ModalContent = styled.div`
  background-color: #333;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`

const Button = styled.button<{ primary?: boolean }>`
  background-color: ${props => props.primary ? '#4CAF50' : '#555'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#3E8E41' : '#666'};
  }
`

interface ConfirmationModalProps {
  data: {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
  }
  onClose: () => void
}

function ConfirmationModal({ data, onClose }: ConfirmationModalProps) {
  // Prevent click propagation to modal overlay
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  
  const handleConfirm = () => {
    if (data.onConfirm) {
      data.onConfirm()
    }
    onClose()
  }
  
  return (
    <ModalContent onClick={handleContentClick}>
      <ModalHeader>
        <ModalTitle>{data.title || 'Confirm'}</ModalTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </ModalHeader>
      
      <div>
        <p>{data.message}</p>
      </div>
      
      <ButtonContainer>
        <Button onClick={onClose}>
          {data.cancelText || 'Cancel'}
        </Button>
        <Button primary onClick={handleConfirm}>
          {data.confirmText || 'Confirm'}
        </Button>
      </ButtonContainer>
    </ModalContent>
  )
}

export default ConfirmationModal