import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../state/store'
import { ModalType, closeModal } from '../../state/uiSlice'
import styled from 'styled-components'

// Import modal components (placeholder imports for now)
import MemberDetailModal from './MemberDetailModal'
import ItemDetailModal from './ItemDetailModal'
import PartyEditModal from './PartyEditModal'
import SettingsModal from './SettingsModal'
import ConfirmationModal from './ConfirmationModal'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

function ModalManager() {
  const dispatch = useDispatch()
  const { type, data } = useSelector((state: RootState) => state.ui.modal)
  
  if (type === ModalType.None) {
    return null
  }
  
  const handleClose = () => {
    dispatch(closeModal())
  }
  
  // Render the appropriate modal based on the type
  const renderModal = () => {
    switch (type) {
      case ModalType.MemberDetail:
        return <MemberDetailModal data={data} onClose={handleClose} />
      case ModalType.ItemDetail:
        return <ItemDetailModal data={data} onClose={handleClose} />
      case ModalType.PartyEdit:
        return <PartyEditModal data={data} onClose={handleClose} />
      case ModalType.Settings:
        return <SettingsModal onClose={handleClose} />
      case ModalType.Confirmation:
        return <ConfirmationModal data={data} onClose={handleClose} />
      default:
        return null
    }
  }
  
  return (
    <ModalOverlay onClick={handleClose}>
      {renderModal()}
    </ModalOverlay>
  )
}

export default ModalManager