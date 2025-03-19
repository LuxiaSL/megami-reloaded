import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import { Item as ItemData, ItemType } from '../data/itemData'
import { getItemById } from '../data/itemData'

// Runtime instance of an item in inventory
export interface InventoryItem {
  instanceId: string // Unique instance ID
  itemId: number // Reference to the original item data
  partyId: number // Which party owns this item
  equipped: boolean // Whether item is equipped
  equippedBy: string | null // Member ID if equipped
}

interface InventoryState {
  items: Record<string, InventoryItem> // instanceId -> InventoryItem
  foundItems: Record<number, boolean> // itemId -> discovered (true/false)
}

const initialState: InventoryState = {
  items: {},
  foundItems: {}
}

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    initializeInventory: (state) => {
      // Start with empty inventory
      state.items = {}
      state.foundItems = {}
    },
    
    addItemById: (state, action: PayloadAction<{ itemId: number, partyId: number }>) => {
      const { itemId, partyId } = action.payload
      
      // Get item data
      const itemData = getItemById(itemId)
      
      if (itemData) {
        // Create a runtime instance of the item
        const instanceId = uuidv4()
        
        const inventoryItem: InventoryItem = {
          instanceId,
          itemId: itemData.id,
          partyId,
          equipped: false,
          equippedBy: null
        }
        
        // Add to inventory
        state.items[instanceId] = inventoryItem
        
        // Mark as found
        state.foundItems[itemId] = true
        
        return instanceId
      }
      
      return null
    },
    
    // Handle adding treasure chest with dynamic value
    addTreasureItem: (state, action: PayloadAction<{ value: number, partyId: number }>) => {
      const { value, partyId } = action.payload
      
      // Create treasure instance
      const instanceId = uuidv4()
      
      const treasureItem: InventoryItem = {
        instanceId,
        itemId: 30, // Treasure chest item ID
        partyId,
        equipped: false,
        equippedBy: null
      }
      
      // Add to inventory
      state.items[instanceId] = treasureItem
      
      // Mark as found
      state.foundItems[30] = true
      
      return instanceId
    },
    
    removeItem: (state, action: PayloadAction<string>) => {
      const instanceId = action.payload
      
      if (state.items[instanceId]) {
        // Check if item is equipped
        if (state.items[instanceId].equipped) {
          return false // Cannot remove equipped item
        }
        
        delete state.items[instanceId]
        return true
      }
      
      return false
    },
    
    useItem: (state, action: PayloadAction<{ instanceId: string, targetMemberId: string | null }>) => {
      const { instanceId, targetMemberId } = action.payload
      const inventoryItem = state.items[instanceId]
      
      if (!inventoryItem) {
        return null
      }
      
      // Get the item data
      const itemData = getItemById(inventoryItem.itemId)
      
      if (!itemData) {
        return null
      }
      
      // Process effects based on item type
      // In a full implementation, we'd return all the effects to be processed
      const effectData = {
        itemId: itemData.id,
        effect: itemData.effect,
        targetMemberId
      }
      
      // Consumable items are removed after use
      if (itemData.type === ItemType.Consumable) {
        delete state.items[instanceId]
      }
      
      // Return effect data to be processed by middleware
      return effectData
    },
    
    equipItem: (state, action: PayloadAction<{ instanceId: string, memberId: string }>) => {
      const { instanceId, memberId } = action.payload
      const inventoryItem = state.items[instanceId]
      
      if (!inventoryItem) {
        return false
      }
      
      // Get the item data
      const itemData = getItemById(inventoryItem.itemId)
      
      if (!itemData) {
        return false
      }
      
      // Only weapons, armor, and accessories can be equipped
      if (
        itemData.type !== ItemType.Weapon && 
        itemData.type !== ItemType.Armor && 
        itemData.type !== ItemType.Accessory
      ) {
        return false
      }
      
      // Mark as equipped
      inventoryItem.equipped = true
      inventoryItem.equippedBy = memberId
      
      // Return the effect that should be processed by middleware
      return {
        itemId: itemData.id,
        effect: itemData.effect,
        targetMemberId: memberId
      }
    },
    
    unequipItem: (state, action: PayloadAction<{ instanceId: string }>) => {
      const { instanceId } = action.payload
      const inventoryItem = state.items[instanceId]
      
      if (!inventoryItem || !inventoryItem.equipped) {
        return false
      }
      
      // Get the effect that should be removed
      const itemData = getItemById(inventoryItem.itemId)
      if (!itemData) {
        return false
      }
      
      const memberId = inventoryItem.equippedBy
      
      // Mark as unequipped
      inventoryItem.equipped = false
      inventoryItem.equippedBy = null
      
      // Return the effect that should be reversed by middleware
      return {
        itemId: itemData.id,
        effect: itemData.effect,
        targetMemberId: memberId
      }
    },
    
    transferItem: (state, action: PayloadAction<{ instanceId: string, toPartyId: number }>) => {
      const { instanceId, toPartyId } = action.payload
      const inventoryItem = state.items[instanceId]
      
      if (!inventoryItem) {
        return false
      }
      
      // Cannot transfer equipped item
      if (inventoryItem.equipped) {
        return false
      }
      
      // Update party ownership
      inventoryItem.partyId = toPartyId
      return true
    }
  }
})

export const {
  initializeInventory,
  addItemById,
  addTreasureItem,
  removeItem,
  useItem,
  equipItem,
  unequipItem,
  transferItem
} = inventorySlice.actions

export default inventorySlice.reducer