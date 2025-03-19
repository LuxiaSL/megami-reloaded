import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum ActiveTab {
  Map = 'map',
  Party = 'party',
  Inventory = 'inventory',
  Shop = 'shop',
  Battle = 'battle',
  Area = 'area',
  Shrine = 'shrine',
  Fusion = 'fusion'
}

export enum ModalType {
  None = 'none',
  MemberDetail = 'memberDetail',
  ItemDetail = 'itemDetail',
  PartyEdit = 'partyEdit',
  Settings = 'settings',
  Confirmation = 'confirmation'
}

export interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  duration: number // Duration in ms, -1 for permanent until dismissed
}

interface UIState {
  activeTab: ActiveTab
  selectedMemberId: string | null
  selectedItemId: string | null
  selectedAreaId: number | null
  mapZoom: number
  modal: {
    type: ModalType
    data: any
  }
  notifications: Notification[]
  battleTempo: number // 1 for normal, 5 for fast
}

const initialState: UIState = {
  activeTab: ActiveTab.Map,
  selectedMemberId: null,
  selectedItemId: null,
  selectedAreaId: null,
  mapZoom: 1.0,
  modal: {
    type: ModalType.None,
    data: null
  },
  notifications: [],
  battleTempo: 1
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<ActiveTab>) => {
      state.activeTab = action.payload
    },
    
    selectMember: (state, action: PayloadAction<string | null>) => {
      state.selectedMemberId = action.payload
    },
    
    selectItem: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload
    },
    
    selectArea: (state, action: PayloadAction<number | null>) => {
      state.selectedAreaId = action.payload
    },
    
    setMapZoom: (state, action: PayloadAction<number>) => {
      // Limit zoom between 0.5 and 2.0
      state.mapZoom = Math.max(0.5, Math.min(2.0, action.payload))
    },
    
    openModal: (state, action: PayloadAction<{ type: ModalType, data?: any }>) => {
      state.modal = {
        type: action.payload.type,
        data: action.payload.data || null
      }
    },
    
    closeModal: (state) => {
      state.modal = {
        type: ModalType.None,
        data: null
      }
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...action.payload
      }
      
      state.notifications.push(notification)
      
      // Limit to 5 most recent notifications
      if (state.notifications.length > 5) {
        state.notifications = state.notifications.slice(-5)
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    setBattleTempo: (state, action: PayloadAction<number>) => {
      // Only allow 1 (normal) or 5 (fast)
      state.battleTempo = action.payload === 5 ? 5 : 1
    }
  }
})

export const {
  setActiveTab,
  selectMember,
  selectItem,
  selectArea,
  setMapZoom,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications,
  setBattleTempo
} = uiSlice.actions

export default uiSlice.reducer