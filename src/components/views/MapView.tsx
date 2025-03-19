import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import styled from 'styled-components'

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #222;
`

const MapPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 1.5rem;
`

function MapView() {
  // Map implementation will come later
  
  return (
    <MapContainer>
      <MapPlaceholder>
        World Map (Coming Soon)
      </MapPlaceholder>
    </MapContainer>
  )
}

export default MapView