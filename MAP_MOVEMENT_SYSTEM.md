# Megami Quest 2: Map & Movement System

## Overview

The map system in Megami Quest 2 provides the spatial foundation for exploration, determining how players navigate between areas, discover new locations, and engage with the game world. The movement system governs how parties travel across this world.

## World Map Structure

### Map Size and Coordinates
- The world map is defined as a square with size `mapSize = 6000` units
- Coordinates range from 0 to 6000 on both X and Y axes
- Initial visible area is much smaller (expanded through exploration)
- The player begins with visible boundaries of:
  ```javascript
  game.min_map_x = 1500;
  game.min_map_y = 3800;
  game.max_map_x = 2300;
  game.max_map_y = 4800;
  ```

### Areas
Areas are defined in the `area_data` object with specific attributes:

```javascript
area_data = {
  [areaId]: {
    area_type: 0-4,             // 0=field, 1=town, 2=dungeon, 3=shrine, 4=fusion
    area_name: "Area Name",     // Display name
    position_x: xCoordinate,    // X position on map
    position_y: yCoordinate,    // Y position on map
    search_remain: searchValue, // Exploration required to complete (-1 if not applicable)
    base: difficulty,           // Base difficulty value
    give_gold: goldAmount,      // Gold per second when in area
    give_exp: expAmount,        // Experience per second when in area
    give_item: itemDropTable,   // Possible item drops with probabilities
    speed_effect: speedFactor,  // Movement speed multiplier in this area
    img_url: "background.jpg",  // Background image
    fnt_clr: "#FFF",            // Font color for this area
    way_event: [],              // Possible random events when traveling
    // Additional type-specific properties:
    boss: bossData,             // For dungeons
    shop_items: itemArray,      // For towns
    bar_infos: infoArray,       // For towns
    summon_rank: rankValue      // For shrines
  }
}
```

### Area Types
The game features 5 different area types, each with unique functionality:

1. **Fields (0)**
   - Open areas for travel and resource gathering
   - Movement is possible in any direction
   - May contain random way events
   - Examples: Idavoll Plain, Muspel Desert, Nilf Snowfield

2. **Towns (1)**
   - Safe areas with shops and taverns
   - Contain information and items for purchase
   - Party stamina is restored when entering
   - Examples: Sheratan Village, Valhalla, Land of Dead

3. **Dungeons (2)**
   - Areas containing enemies and bosses
   - Require exploration to complete
   - May be guarded by boss encounters
   - Examples: Old Trail, Black Valley, Infinite Cave

4. **Shrines (3)**
   - Special locations for summoning new members
   - Each shrine has a specific rank of summons available
   - Examples: Mossy Shrine, Graveyard Shrine, Holy Table

5. **Fusion (4)**
   - Special area for combining members to create stronger ones
   - Single location in the game world

## Movement System

### Movement Mechanics
When a player clicks on an area to move to:

1. The party's `moving` flag is set to 1
2. The `target_area_id` is set to the destination area
3. Each game tick, the party position is updated toward the target
4. Upon reaching the destination, the moving flag is set back to 0

### Movement Speed Calculation
Movement speed is calculated during each game tick:

```javascript
var c = demical(d.allmember_total_speed / game.group[a].members.length, 100) / 10;
if (c < 1) c = 1;  // Minimum speed of 1
c *= area_data[b].speed_effect;  // Area-specific speed modifier
if (c > 500) c = 500;  // Maximum speed of 500
```

This creates a system where:
- Base speed is the average speed of all members
- Different areas have different movement speeds (fields are faster)
- Hard minimum and maximum limits ensure reasonable progression

### Directional Movement
Movement occurs in a straight line toward the destination:

```javascript
var f = Math.atan2(g - game.group[a].position.y, e - game.group[a].position.x);
game.group[a].position.x += Math.round(Math.cos(f) * c * 100) / 100;
game.group[a].position.y += Math.round(Math.sin(f) * c * 100) / 100;
```

This creates a smooth, direct movement path between the current position and the destination.

## Area Discovery System

### Initial Visibility
The game begins with only the starting area and a small portion of the map visible.

### Discovery Mechanisms
New areas can be discovered through:
1. **Completing Areas**: Finishing dungeons often reveals new areas
2. **Defeating Bosses**: Some bosses guard access to new areas
3. **Special Items**: Certain items can reveal hidden areas
4. **Area Proximity**: When discovering a new area, adjacent areas may be revealed

```javascript
function open_area(b) {
    if (!game.foundareas[b]) {
        game.foundareas[b] = area_data[b].search_remain;
        var a = area_data[b].position_x,
            c = area_data[b].position_y;
        
        // Expand visible map boundaries when discovering new areas
        if (0 != area_data[b].area_type) {
            game.min_map_x = Math.max(Math.min(game.min_map_x, a - 200), 0);
            game.min_map_y = Math.max(Math.min(game.min_map_y, c - 200), 0);
            game.max_map_x = Math.min(Math.max(game.max_map_x, a + 200), mapSize);
            game.max_map_y = Math.min(Math.max(game.max_map_y, c + 200), mapSize);
        }
    }
}
```

### Special Discovery Items
Several items in the game unlock specific areas:
- Song of Nibelungs: Unlocks Hvergelmir Spring
- Song of Wayland: Unlocks Wayland Smith Post
- Mirror of Nitocris: Unlocks Yuggoth Cave
- Silver Key: Unlocks Fallens Refuge

## Map Interface

### Display and Navigation
The map interface includes several key features:
- Zoom in/out functionality
- Panning by dragging
- Auto-following current party (toggleable)
- Area information on hover
- Visual indicators for different area types

### Map Stretching
The map can be expanded to fill more of the screen:
```javascript
function stretch_map() {
    var b = $("#disp_worldmap");
    if (0 == flgStretch) {
        flgStretch = !0;
        $("#btn_map_stretch").text(">");
        b.css("width", "calc(100% - 330px)");
    } else {
        flgStretch = !1;
        $("#btn_map_stretch").text("<");
        b.css("width", "calc(100% - 36% - 330px)");
    }
    update_disp_worldmap(-1, -1);
}
```

## Way Events

### Random Encounters
While moving across fields, there's a chance of triggering "way events":

```javascript
if (1 == game.group[game.currentGroup].moving && 0 == game.counter % 10) {
    var h = $("#btn_wayevent");
    if ("none" == h.css("display") && 0 == area_data[k].area_type) {
        for (var a = Math.random(), l = b = 0; l < area_data[k].way_event.length; l++) {
            if (b += Number(area_data[k].way_event[l].ratio), b > a) {
                // Show event button
                h.stop(!0, !0);
                h.show();
                h.css("opacity", 1);
                h.delay(25E3);
                h.animate({
                    opacity: 0
                }, 5E3, function() {
                    h.hide()
                });
                // Set click handler
                h.off("click");
                h.on("click", function() {
                    new area_data[k].way_event[l].func;
                    h.hide()
                });
                break;
            }
        }
    }
}
```

These events can provide:
- Random gold
- Rare items
- Special discoveries

### Area Entrance
When a party arrives at a destination, they don't automatically enter it:
- A button appears allowing entrance to the area
- Entering towns automatically restores party stamina
- Different area types show different interfaces upon entry

## Implementation Requirements

To replicate this map system in a remastered version:

1. Create a large coordinate-based world map with multiple area types
2. Implement incremental area discovery through exploration and events
3. Build a movement system based on party speed and area effects
4. Design an interactive map interface with zoom, pan, and information display
5. Include way events for random encounters during travel
6. Create a system for tracking discovered and completed areas
7. Design visually distinct area types with appropriate interactions