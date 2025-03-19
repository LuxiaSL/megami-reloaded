# Megami Quest 2: Area Discovery & Progression System

## Overview

The area discovery and progression system in Megami Quest 2 controls how players advance through the game world, gradually revealing new areas, challenges, and content. This system creates a sense of exploration and achievement as players discover new locations and overcome obstacles.

## Area Structure

Areas are defined in the `area_data` object with various properties:

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
    boss: bossData,             // For dungeons with bosses
    complete_func: function(){} // Function called upon area completion
  }
}
```

## Area Discovery Mechanics

### Initial Visibility
The game begins with only the starting area and a small portion of the map visible:

```javascript
// In first_load()
game.min_map_x = 1500;
game.min_map_y = 3800;
game.max_map_x = 2300;
game.max_map_y = 4800;

// Open the starting area and first dungeon
for (var a in area_data) {
    0 == area_data[a].area_type && open_area(a);
}
open_area(2000);
```

### Discovery Methods
New areas can be discovered through several mechanisms:

1. **Area Completion**
   When a player completes an area (especially dungeons), new areas are often discovered:
   
   ```javascript
   // Example complete_func from an area
   complete_func: function() {
       discovery_new_area(1000);  // Discover town with ID 1000
   }
   ```

2. **Boss Defeat**
   Defeating bosses often reveals new areas:
   
   ```javascript
   // From a boss battle victory
   function player_win(a) {
       // Various animations and effects
       
       // Eventually calls area complete function
       complete_area();
   }
   ```

3. **Special Items**
   Certain items can reveal hidden areas when used:
   
   ```javascript
   // Item effect
   case "song_of_nibelungs":
       discovery_new_area(2212);  // Discover the Hvergelmir Spring dungeon
       break;
   case "song_of_wayland":
       discovery_new_area(1302);  // Discover Wayland Smith Post
       break;
   case "mirror_of_nitocris":
       discovery_new_area(2020);  // Discover Yuggoth Cave
       break;
   ```

4. **Map Expansion**
   When new areas are discovered, the visible map boundaries automatically expand:
   
   ```javascript
   function open_area(b) {
       if (!game.foundareas[b]) {
           game.foundareas[b] = area_data[b].search_remain;
           var a = area_data[b].position_x,
               c = area_data[b].position_y;
           
           // Expand visible map boundaries
           if (0 != area_data[b].area_type) {
               game.min_map_x = Math.max(Math.min(game.min_map_x, a - 200), 0);
               game.min_map_y = Math.max(Math.min(game.min_map_y, c - 200), 0);
               game.max_map_x = Math.min(Math.max(game.max_map_x, a + 200), mapSize);
               game.max_map_y = Math.min(Math.max(game.max_map_y, c + 200), mapSize);
           }
       }
   }
   ```

### World Map Item
The Worldmap item instantly reveals the entire map:

```javascript
case "worldmap":
    game.min_map_x = 0;
    game.min_map_y = 0;
    game.max_map_x = mapSize;
    game.max_map_y = mapSize;
    break;
```

## Area Completion System

### Dungeon Exploration
Dungeons require exploration to complete, tracked by the `search_remain` property:

```javascript
// During main_func() for an active party in a dungeon
if (0 < game.foundareas[b]) {
    progressSearch = d.valid_total_speed;
    if (0 >= progressSearch) {
        progressSearch = 1;
    }
    if (progressSearch > area_data[get_current_location()].search_remain / 5) {
        progressSearch = area_data[get_current_location()].search_remain / 5;
    }
    
    // Update exploration progress
    game.foundareas[b] -= progressSearch;
    game.foundareas[b] = demical(game.foundareas[b]);
    
    // Check if exploration is complete
    if (0 >= game.foundareas[b]) {
        game.foundareas[b] = 0;
        $("#dungeon_search_speed").html("");
        system_message(word_message_search_finish.replace("***area***", area_data[b].area_name), a);
    }
}
```

The exploration speed is based on the party's total speed stat.

### Boss Encounters
Many dungeons have boss encounters that must be defeated to complete the area:

```javascript
function update_area_search() {
    var b = null != area_data[get_current_location()].boss,
        a = game.foundareas[get_current_location()];
    
    // If exploration is complete but boss exists
    if (0 == a) {
        $("#dungeon_search_bar").css("width", "100%");
        $("#dungeon_search_value").html("100%");
        a = $("<button>", {
            "class": "btn",
            style: "width:46%;height:40px",
            type: "button"
        });
        
        // Show boss fight button
        if (b) {
            a.on("click", boss_fight);
            a.attr("title", word_explain_area_boss);
            a.html(word_area_boss_fight);
        }
        // Or show complete button
        else {
            a.on("click", complete_area);
            a.html(word_area_search_complete);
        }
        
        $("#dungeon_complete_btn").append(a);
        flash_element(a);
    }
}
```

### Area Completion Marking
When an area is completed, it's marked as complete (-1) in the `foundareas` object:

```javascript
function complete_area() {
    if (2204 == get_current_location() || -1 != game.foundareas[get_current_location()]) {
        game.foundareas[get_current_location()] = -1;
        update_area_info();
        update_area_search();
        $(".worldmap_area_btn").remove();
        $(".worldmap_area_name").remove();
        update_disp_worldmap(-1, -1);
        
        // Execute the area's completion function
        if (null != area_data[get_current_location()].complete_func) {
            new (area_data[get_current_location()].complete_func);
        }
    }
}
```

## Progression Barriers

### Difficulty Scaling
Areas have increasing difficulty values that require stronger parties to explore:

```javascript
// Early areas
16: { // Idavoll Plain
    base: 0,
    give_gold: 0,
    give_exp: 0
},

// Mid-game areas
12: { // Surtr
    base: 80000,
    give_gold: 50,
    give_exp: 250
},

// Late-game areas
2107: { // Dark Forest
    base: 999999,
    give_gold: 99,
    give_exp: 999
}
```

If a party's strength is less than an area's base difficulty, they lose stamina and cannot generate resources.

### Boss Difficulty
Bosses have increasing stats that create progression gates:

```javascript
// Early boss
2005: { // Harpy
    boss_name: word_boss_harpy,
    rank: 0,
    hp: 100,
    attack: 5,
    speed: 1,
    defence: 0,
    mdefence: 0
},

// Mid-game boss
2201: { // Fefnir
    boss_name: word_boss_fefnir,
    rank: 1,
    hp: 3500000,
    attack: 500000,
    speed: 40000,
    defence: 5000,
    mdefence: 2000
},

// End-game boss
2204: { // King of Abyss
    boss_name: word_boss_king_of_abyss,
    rank: 2,
    hp: 150000000,
    attack: 7000000,
    speed: 1500000,
    defence: 1800000,
    mdefence: 300000
}
```

### Information Gates
Some area locations are only revealed through information obtained in taverns:

```javascript
// Town with bar info revealing other areas
1000: {
    area_type: 1,
    bar_infos: [[2001, 0]] // Reveals area 2001 for 0 gold
}
```

## Special Progression Systems

### Infinite Cave
The Infinite Cave provides an infinitely scaling challenge:

```javascript
function complete_infinite() {
    game.foundareas[2400] = area_data[2400].search_remain;
    update_disp_all();
    
    // Award medal item on certain levels
    var b = String(game.infinite_level).substr(0, 1);
    if (1 == b || 5 == b) {
        var a = deep_copy(item_data[56]);
        a.item_name = a.item_name.replace("***level***", "L" + game.infinite_level);
        a.price = Math.round(2000000 * Math.pow(game.infinite_level, 2.5));
        add_item(a);
    }
    
    // Increase level
    b++;
    a = Math.pow(10, Math.floor(Math.log(game.infinite_level) / Math.LN10 + 0.00005));
    game.infinite_level = b * a;
}
```

Each level of the Infinite Cave has a boss with scaled stats:

```javascript
function get_infinite_boss() {
    var a = deep_copy(boss_data[2400]);
    a.boss_name = "L" + game.infinite_level;
    a.img_url = "infinite" + game.infinite_level % 4 + ".png";
    
    // Seed the random number generator for consistent stats
    setRandomSeed(10000 * game.infinite_level);
    
    // Generate random modifiers
    var c = 0.5 + getRandomBySeed(),
        b = 0.5 + getRandomBySeed(),
        e = 0.5 + getRandomBySeed(),
        g = 0,
        f = 0;
        
    if (0.3 > getRandomBySeed()) {
        g = 0.5 + getRandomBySeed();
    }
    if (0.3 > getRandomBySeed()) {
        f = 0.5 + getRandomBySeed();
    }
    
    // Scale boss stats exponentially
    a.hp = getJustNum(Math.round(a.hp * Math.pow(game.infinite_level, 2.5) * c));
    a.attack = getJustNum(Math.round(a.attack * Math.pow(game.infinite_level, 2.5) * b));
    a.speed = getJustNum(Math.round(a.speed * Math.pow(game.infinite_level, 2.5) * e));
    a.defence = getJustNum(Math.round(a.defence * Math.pow(game.infinite_level, 2.5) * g));
    a.mdefence = getJustNum(Math.round(a.mdefence * Math.pow(game.infinite_level, 2.5) * f));
    
    return a;
}
```

### Ragnarok System
The Ragnarok system provides additional resource generation scaling:

```javascript
function get_ragnarok_sacrifice(b) {
    var a = {};
    
    // Calculate base enhancement from member
    b = Math.floor((b.attr_strength + b.attr_speed * attr_weight.speed + b.attr_magic * attr_weight.magic) * b.base_strength);
    a.base = b;
    
    // Calculate gold enhancement
    b = Math.floor(0.1 * Math.pow(Math.log(b), 5));
    a.give_gold = b;
    
    return a;
}
```

This enhances a special area's resource generation based on sacrificed member attributes.

### Game Completion
The game has a final ending sequence triggered by defeating the King of Abyss:

```javascript
function complete_abyss() {
    game_pause();
    
    // Initialize ending sequence
    endBgIdx = endTextIdx = 0;
    clearInterval(endTextInterval);
    clearInterval(endBgInterval);
    
    // Show ending screens
    $("#mask").show();
    $("#ending_window1").css("background-image", "url('./data/etc/empty.png')");
    $("#ending_window2").css("background-image", "url('./data/etc/empty.png')");
    $("#ending_window1").show(3000);
    $("#ending_window2").show(3000);
    $("#ending_window3").show();
    $("#ending_text").empty();
    $("#ending_ok").hide();
    
    // Start text animation for ending
    setTimeout(function() {
        endTextInterval = setInterval(function() {
            // Display ending text character by character
        }, 200);
        
        // Prepare background image sequence with party members
        endBgList = [];
        for (var b = 0; b < game.group.length; b++) {
            // Add party member images to ending sequence
        }
        
        // Start background animation
        endBgInterval = setInterval(function() {
            // Cycle through member images
        }, 7000);
    }, 3500);
}
```

## Progression Flow

The overall progression flow follows this general pattern:

1. **Starting Areas**
   - Idavoll Plain (starting field)
   - Old Trail (first dungeon)
   - Sheratan Village (first town)

2. **Early Game**
   - Defeat early bosses (Harpy, Pleyone, Maia)
   - Discover nearby towns and fields
   - Gain basic equipment and members

3. **Mid Game**
   - Complete the Black Valley dungeon
   - Defeat Fefnir to access the Abyss
   - Discover the Fusion area
   - Strengthen party through fusion

4. **Late Game**
   - Defeat challenging bosses like Fenrir and Nidhogg
   - Obtain legendary weapons through Ragnarok
   - Access hidden areas through special items

5. **End Game**
   - Defeat the King of Abyss to complete the main story
   - Challenge the Infinite Cave for endless scaling difficulty
   - Collect all members and items for 100% completion

## Implementation Requirements

To replicate this area discovery and progression system in a remastered version:

1. Create a world map with areas of various types and difficulties
2. Implement the exploration mechanics for completing dungeons
3. Design boss encounters that gate progression
4. Create special item mechanics that reveal hidden areas
5. Implement tavern information that provides area hints
6. Build the Infinite Cave system for endless scaling challenge
7. Create the Ragnarok system for resource enhancement
8. Design a satisfying ending sequence for completing the main story