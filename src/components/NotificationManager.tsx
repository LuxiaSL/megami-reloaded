import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../state/store'
import { removeNotification } from '../state/uiSlice'
import styled from 'styled-components'
import { useEffect } from 'react'

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
`

const NotificationItem = styled.div<{ type: 'info' | 'success' | 'warning' | 'error' }>`
  background-color: ${props => {
    switch (props.type) {
      case 'info': return 'rgba(0, 122, 255, 0.9)';
      case 'success': return 'rgba(52, 199, 89, 0.9)';
      case 'warning': return 'rgba(255, 204, 0, 0.9)';
      case 'error': return 'rgba(255, 59, 48, 0.9)';
      default: return 'rgba(0, 0, 0, 0.8)';
    }
  }};
  color: white;
  padding: 12px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.3s ease-out forwards;
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
`

function NotificationManager() {
  const dispatch = useDispatch()
  const notifications = useSelector((state: RootState) => state.ui.notifications)
  
  // Auto-dismiss notifications based on duration
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id))
        }, notification.duration)
        
        return () => clearTimeout(timer)
      }
    })
  }, [notifications, dispatch])
  
  const handleClose = (id: string) => {
    dispatch(removeNotification(id))
  }
  
  if (notifications.length === 0) {
    return null
  }
  
  return (
    <NotificationContainer>
      {notifications.map(notification => (
        <NotificationItem key={notification.id} type={notification.type}>
          <div>{notification.message}</div>
          <CloseButton onClick={() => handleClose(notification.id)}>
            ×
          </CloseButton>
        </NotificationItem>
      ))}
    </NotificationContainer>
  )
}

export default NotificationManager