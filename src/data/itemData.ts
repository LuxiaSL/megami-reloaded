// Item type definition
export enum ItemType {
  Consumable = 0,
  Weapon = 1,
  Armor = 2,
  Accessory = 3,
  Special = 4,
  Treasure = 5
}

// Item interface
export interface Item {
  id: number;
  itemName: string;
  type: ItemType;
  rare: number;
  price: number;
  effect: string;
  imgUrl: string;
  description: string;
}

// Basic item data for the game - will be expanded with full content later
export const itemData: Record<number, Item> = {
  // Basic healing potion
  1: {
    id: 1,
    itemName: 'Minor Healing Potion',
    type: ItemType.Consumable,
    rare: 1,
    price: 50,
    effect: 'restoreHP:20',
    imgUrl: 'potion_red.png',
    description: 'A small potion that restores 20 HP.'
  },
  
  // Basic weapon
  2: {
    id: 2,
    itemName: 'Wooden Sword',
    type: ItemType.Weapon,
    rare: 1,
    price: 100,
    effect: 'str:5',
    imgUrl: 'sword_wood.png',
    description: 'A simple wooden sword that increases strength by 5.'
  },
  
  // Forest drop
  3: {
    id: 3,
    itemName: 'Forest Herb',
    type: ItemType.Consumable,
    rare: 1,
    price: 30,
    effect: 'restoreStamina:10',
    imgUrl: 'herb_green.png',
    description: 'A herb that restores 10 stamina when consumed.'
  },
  
  // Dungeon drop
  4: {
    id: 4,
    itemName: 'Stone Fragment',
    type: ItemType.Special,
    rare: 2,
    price: 200,
    effect: 'key:mimir',
    imgUrl: 'fragment.png',
    description: 'A mysterious stone fragment that seems important.'
  },
  
  // Offline treasure chest
  30: {
    id: 30,
    itemName: 'Treasure Chest',
    type: ItemType.Treasure,
    rare: 3,
    price: 0, // Set dynamically based on offline time
    effect: 'gold:variable',
    imgUrl: 'chest.png',
    description: 'A treasure chest containing gold earned while offline.'
  }
}

// Export function to get item by ID with error handling
export function getItemById(id: number): Item | undefined {
  return itemData[id]
}