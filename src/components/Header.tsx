import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../state/store'
import { ActiveTab, setActiveTab } from '../state/uiSlice'
import styled from 'styled-components'
import { formatNumber } from '../utils/formatters'

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: white;
  height: 60px;
`

const ResourceDisplay = styled.div`
  display: flex;
  gap: 20px;
`

const Resource = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const TabsContainer = styled.div`
  display: flex;
  gap: 10px;
`

const Tab = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? '#555' : '#444'};
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #555;
  }
`

function Header() {
  const dispatch = useDispatch()
  const gold = useSelector((state: RootState) => state.game.gold)
  const activeTab = useSelector((state: RootState) => state.ui.activeTab)
  
  const handleTabClick = (tab: ActiveTab) => {
    dispatch(setActiveTab(tab))
  }
  
  return (
    <HeaderWrapper>
      <ResourceDisplay>
        <Resource>
          <span>Gold:</span>
          <span>{formatNumber(gold)}</span>
        </Resource>
      </ResourceDisplay>
      
      <TabsContainer>
        <Tab 
          active={activeTab === ActiveTab.Map} 
          onClick={() => handleTabClick(ActiveTab.Map)}
        >
          Map
        </Tab>
        <Tab 
          active={activeTab === ActiveTab.Party} 
          onClick={() => handleTabClick(ActiveTab.Party)}
        >
          Party
        </Tab>
        <Tab 
          active={activeTab === ActiveTab.Inventory} 
          onClick={() => handleTabClick(ActiveTab.Inventory)}
        >
          Inventory
        </Tab>
      </TabsContainer>
    </HeaderWrapper>
  )
}

export default Header