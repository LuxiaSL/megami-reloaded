import { Middleware } from 'redux'
import { RootState } from '../store'
import { gameTick, addGold, processOfflineProgress } from '../gameSlice'
import { addMemberExp, addMemberStamina } from '../partiesSlice'
import { addItemById, addTreasureItem } from '../inventorySlice'
import { 
  calculateResourceGeneration, 
  calculateOfflineProgression 
} from '../../utils/resourceCalculator'

/**
 * Middleware to handle resource generation logic on each game tick.
 * This separates the resource generation logic from the game tick reducer.
 */
export const resourceGenerationMiddleware: Middleware<{}, RootState> = 
  store => next => action => {
    // Process the action first
    const result = next(action)
    
    // Handle offline progress calculation when game initializes
    if (action.type === 'game/initializeGame' && action.payload?.offlineProgressData) {
      const { minutesAway, parties } = action.payload.offlineProgressData
      
      if (minutesAway > 5) { // Only process if away more than 5 minutes (as per original game)
        const offlineProgress = calculateOfflineProgression(parties, minutesAway)
        
        // Dispatch action to process offline progress
        store.dispatch(processOfflineProgress(offlineProgress))
        
        // Create treasure item for offline gold
        if (offlineProgress.treasureValue > 0) {
          store.dispatch(addTreasureItem({ 
            value: offlineProgress.treasureValue, 
            partyId: 0 // Always add to first party
          }))
        }
      }
    }
    
    // Handle treasure creation if offline progress was processed
    if (action.type === 'game/processOfflineProgress' && action.payload?.offlineTreasureValue > 0) {
      const { offlineTreasureValue } = action.payload
      
      // Create treasure item
      store.dispatch(addTreasureItem({ 
        value: offlineTreasureValue, 
        partyId: 0 // Always add to first party
      }))
    }
    
    // Handle resource generation on game tick
    if (action.type === gameTick.type) {
      const state = store.getState()
      
      // Process each party for resource generation
      state.parties.parties.forEach(party => {
        // Skip if party is moving
        if (party.location.moving) return
        
        // Calculate resources
        const resources = calculateResourceGeneration(party)
        
        if (resources) {
          // Add gold
          if (resources.gold > 0) {
            store.dispatch(addGold(resources.gold))
          }
          
          // Distribute experience to members
          resources.expDistribution.forEach(expData => {
            store.dispatch(addMemberExp({
              partyId: party.id,
              memberId: expData.memberId,
              amount: expData.expGain
            }))
          })
          
          // Process item drops
          resources.itemDrops.forEach(itemId => {
            store.dispatch(addItemById({
              itemId,
              partyId: party.id
            }))
          })
          
          // Update stamina for all members
          // In a fuller implementation, we would reduce stamina in difficult areas
          // and handle stamina regeneration in towns
          // For now, let's add a small amount each tick
          party.members.forEach(member => {
            if (member.valid && member.stamina < 100) {
              store.dispatch(addMemberStamina({
                partyId: party.id,
                memberId: member.id,
                amount: 1 // Small regeneration each tick
              }))
            }
          })
        }
      })
    }
    
    return result
  }

export default resourceGenerationMiddleware