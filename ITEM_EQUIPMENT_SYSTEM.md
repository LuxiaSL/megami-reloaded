# Megami Quest 2: Item & Equipment System

## Overview

The item and equipment system in Megami Quest 2 provides tools for enhancing party members, accessing special features, and advancing game progression. Items can be acquired, used, equipped, transferred between parties, and sometimes traded for gold.

## Item Structure

Items are defined in the `item_data` array with the following attributes:

```javascript
item = {
  item_id: 0,                   // Runtime ID (assigned when created)
  item_type: typeId,            // Unique type identifier
  item_name: "Item Name",       // Display name
  item_caption: "Description",  // Item description/tooltip
  price: goldValue,             // Base price/value
  img_url: "item.png",          // Item image
  use_type: 0-2,                // Usage type (0=special, 1=consumable, 2=equipment)
  effect: "effectString",       // Effect specification (attribute modifiers)
  special: "specialFunction"    // Special function identifier (if applicable)
};
```

## Item Categories

### Usage Types
Items fall into three main categories:

1. **Special Items (use_type: 0)**
   - One-time use or permanent effect items
   - Often unlock new features or areas
   - Examples: Worldmap, Self Control Book, Bag

2. **Consumables (use_type: 1)**
   - Single-use items that provide temporary benefits
   - Applied to one member or the entire party
   - Examples: Herb, Mead of Poetry, Blood of Ymir

3. **Equipment (use_type: 2)**
   - Permanently equipped to a member until removed
   - Modify member stats continuously while equipped
   - Examples: Bronze Sword, Claymore, Bow of Ullr

### Rarity Tiers
While not explicitly coded, items effectively have rarity tiers:

- **Common**: Basic gear with minor stat boosts (Bronze Sword, Leather Boots)
- **Uncommon**: Medium strength items (Titanium Blade, Carbon Boots)
- **Rare**: High-tier equipment (Claymore, Bow of Ullr)
- **Legendary**: Special items often from bosses (Gungnir, Mjolnir)
- **Unique**: One-of-a-kind items with special effects (Ring of Nibelung)

## Effect System

### Effect String Format
Item effects are encoded in a compact string format:

```
"strA50,speA20,magM1.2"
```

This format uses:
- Three-letter stat code: `str` (strength), `spe` (speed), `mag` (magic), `sta` (stamina), etc.
- Modifier type: `A` (additive) or `M` (multiplicative)
- Numeric value: The amount to add or multiply by

### Effect Application
When an item is used or equipped, its effects are applied to the target member:

```javascript
function appear_item_effect(a, b) {
    var e = game.group[game.currentGroup].members,
        c = [];
    
    // Determine target members
    if ("all" == b) {
        for (var d = 0; d < e.length; d++) c.push(d);
    } else {
        c.push(b);
    }
    
    // Process each effect in the effect string
    for (var m = a.effect.split(","), l = 0; l < m.length; l++) {
        var f = m[l],
            d = f.substring(0, 3),    // Stat code
            g = f.substring(3, 4),    // Modifier type
            f = Number(f.substring(4)); // Value
        
        // Apply to gold if gold effect
        if ("gol" == d) {
            "A" == g && add_gold(f);
            "M" == g && (g = game.gold * f, add_gold(-game.gold), add_gold(g));
            flash_effect($("#disp_gold"), "#FC0");
        }
        // Apply to member stats if item is consumable or special
        else if (0 == a.use_type || 1 == a.use_type) {
            var k = get_full_param(d);
            if ("" == k) break;
            
            // Apply to each target member
            for (d = 0; d < c.length; d++) {
                var h = e[c[d]];
                
                // Handle experience and stamina specially
                if ("exp" == k) {
                    "A" == g && give_member_exp(game.currentGroup, c[d], f);
                    "M" == g && give_member_exp(game.currentGroup, c[d], h.exp * (f - 1));
                } else if ("stamina" == k) {
                    "A" == g && give_member_stamina(game.currentGroup, c[d], f);
                    "M" == g && give_member_stamina(game.currentGroup, c[d], h.stamina * (f - 1));
                }
                // Handle other stats
                else {
                    "A" == g && (h[k] = demical(f + Number(h[k])));
                    "M" == g && (h[k] = demical(f * Number(h[k])));
                }
                
                // Update member stats and UI
                update_member(h);
                update_member_strength(h);
                update_member_state(c[d]);
            }
            
            // Apply visual feedback
            "all" == b ? flash_effect($(".member_state"), "#FC6") : flash_effect($(".member_state").eq(b), "#FC6");
            update_disp_gold();
            update_disp_total_strength();
        }
        // Apply equipment effects
        else if (2 == a.use_type) {
            for (k = get_full_param(d), d = 0; d < c.length; d++) {
                h = e[c[d]];
                "A" == g && (h["a_" + k] = f);
                "M" == g && (h["m_" + k] = f);
            }
        }
    }
}
```

This creates a flexible system where items can:
- Add fixed amounts to stats (additive)
- Multiply stats by a factor (multiplicative)
- Affect a single member or the entire party
- Modify different combinations of stats

## Item Acquisition

Items can be obtained through various methods:

### Area Drops
Items can randomly drop while exploring areas:

```javascript
// In main_func()
for (c = 0; c < area_data[b].give_item.length && !(game.group[a].items.length >= game.item_max); c++) {
    Math.random() < area_data[b].give_item[c][1] && add_item(item_data[area_data[b].give_item[c][0]], a);
}
```

Each area can have multiple items with different drop probabilities.

### Shop Purchases
Towns have shops where items can be purchased:

```javascript
// In update_shop_items()
var a = area_data[get_current_location()].shop_items;
if (null != a)
    for (var c = 0; c < a.length; c++) {
        var b = get_item_dom(a[c]);
        $("#shop_items").append(b);
    }
```

### Boss Rewards
Defeating bosses often provides special items as rewards.

### Special Events
Way events during travel can provide unique items.

## Inventory Management

### Inventory Limit
Each party has a limited inventory capacity:

```javascript
game.item_max = 5; // Starting inventory limit
```

This can be increased using special bag items:

```javascript
function extend_item(a) {
    game.item_max < a && (game.item_max = a, update_disp_items());
}
```

Different bags increase the limit to different values:
- Bag: 10 slots
- Large Bag: 15 slots
- Fine Bag: 20 slots

### Item Transfer
Items can be transferred between members and parties using drag-and-drop:

```javascript
// Make items draggable
c.draggable({
    cancel: !1,
    scroll: !1,
    revert: function(b) {
        // Handle revert if drop fails
    },
    revertDuration: 200,
    helper: "clone",
    start: function() {
        // Handle drag start
    },
    stop: function() {
        // Handle drag stop
    }
});

// Make members accept item drops
d.droppable({
    accept: ".btn.item_use, .btn.item_equipment",
    hoverClass: "member_drop",
    drop: function(c, b) {
        // Handle item being dropped on member
    }
});
```

## Equipment System

### Equipment Restriction
Some equipment has restrictions based on:

1. **Member Base Strength**
   ```javascript
   function check_equipment(a, c) {
       var b = game.group[game.currentGroup].members[c];
       return b.base_strength < get_item_value(a, "strA") ||
              b.base_strength < get_item_value(a, "speA") ||
              b.base_strength < get_item_value(a, "magA") ? 
              (window_message(word_message_not_enough_base_strength), !1) :
              "nibelung" == a.special && "megami" != b.type ? !1 : !0;
   }
   ```

2. **Member Type**
   Some equipment is restricted to specific members (e.g., Ring of Nibelung can only be equipped by Megami)

### Equipment Effects
When a member equips an item, its effects are applied to their stats:

```javascript
function update_equipment(a) {
    var c = game.group[game.currentGroup].members[a],
        c = $.extend(!0, c, member_equip_format);
    
    if (null != c.equipment) {
        appear_item_effect(c.equipment, a);
        if (1 == c.valid) {
            a = $("#member_equipment" + a);
            c = get_item_dom(c.equipment);
            a.empty();
            a.append(c);
        }
    }
}
```

Equipment effects are visible in the member status display, showing the modifications to each stat.

## Special Item Functions

Many items have unique functions beyond simple stat modifications:

```javascript
switch (b.special) {
    case "ei1":
        extend_item(10);  // Bag (10 slots)
        break;
    case "ei2":
        extend_item(15);  // Large Bag (15 slots)
        break;
    case "ei3":
        extend_item(20);  // Fine Bag (20 slots)
        break;
    case "worldmap":
        game.min_map_x = 0;
        game.min_map_y = 0;
        game.max_map_x = mapSize;
        game.max_map_y = mapSize;
        break;
    case "self_control":
        game.draw_status = 1;
        update_disp_members();
        flash_element($(".member_status"));
        break;
    case "song_of_nibelungs":
        discovery_new_area(2212);
        break;
    // Many other special functions
}
```

These special functions include:
- Expanding the visible map area
- Enabling member power distribution
- Enabling party management
- Discovering new areas
- Modifying boss encounters
- Enhancing member attributes

## Creation of Unique Items

### Ragnarok System
The Ragnarok system creates powerful equipment by sacrificing high-level members:

```javascript
function get_weapon_from_member(b) {
    var a = {};
    
    // Calculate effect values based on member attributes
    var c = Math.pow(Math.log(b.attr_strength / 10) / Math.LN10, 2),
        g = "M";
    // Similar calculations for speed and magic
    
    // Modify based on member class
    switch (get_member_class(b)) {
        case word_member_class_str:
            // Strength-focused weapon
            break;
        case word_member_class_spe:
            // Speed-focused weapon
            break;
        // Other class cases
    }
    
    // Generate effect string
    a.effect = "";
    if ("" != c) a.effect += "str" + g + c + ",";
    if ("" != e) a.effect += "spe" + f + e + ",";
    if ("" != d) a.effect += "mag" + l + d + ",";
    
    return a;
}
```

This creates unique weapons with effects based on the sacrificed member's attributes and class.

## Implementation Requirements

To replicate this item and equipment system in a remastered version:

1. Create the item data structure with the three usage types
2. Implement the effect string parsing and application system
3. Build the equipment system with restrictions and stat modifications
4. Create the inventory management system with limits and expansion
5. Implement item acquisition through drops, shops, and rewards
6. Build the special item function system for unique effects
7. Create the Ragnarok system for generating custom equipment
8. Design an intuitive drag-and-drop interface for item management