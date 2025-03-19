import { useSelector } from 'react-redux'
import { RootState } from '../state/store'
import { ActiveTab } from '../state/uiSlice'
import styled from 'styled-components'

// Import components for each tab (these will be created later)
import Header from './Header'
import Footer from './Footer'
import MapView from './views/MapView'
import PartyView from './views/PartyView'
import InventoryView from './views/InventoryView'
import ShopView from './views/ShopView'
import BattleView from './views/BattleView'
import AreaView from './views/AreaView'
import ShrineView from './views/ShrineView'
import FusionView from './views/FusionView'
import ModalManager from './modals/ModalManager'
import NotificationManager from './NotificationManager'

const GameContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #242424;
  color: #fff;
`

const MainContent = styled.main`
  flex: 1;
  overflow: hidden;
  position: relative;
`

function GameContainer() {
  const activeTab = useSelector((state: RootState) => state.ui.activeTab)
  
  // Render the appropriate view based on the active tab
  const renderView = () => {
    switch (activeTab) {
      case ActiveTab.Map:
        return <MapView />
      case ActiveTab.Party:
        return <PartyView />
      case ActiveTab.Inventory:
        return <InventoryView />
      case ActiveTab.Shop:
        return <ShopView />
      case ActiveTab.Battle:
        return <BattleView />
      case ActiveTab.Area:
        return <AreaView />
      case ActiveTab.Shrine:
        return <ShrineView />
      case ActiveTab.Fusion:
        return <FusionView />
      default:
        return <MapView />
    }
  }
  
  return (
    <GameContainerWrapper>
      <Header />
      
      <MainContent>
        {renderView()}
      </MainContent>
      
      <Footer />
      
      {/* Modal system for dialogs and popups */}
      <ModalManager />
      
      {/* Notification system for alerts and messages */}
      <NotificationManager />
    </GameContainerWrapper>
  )
}

export default GameContainer