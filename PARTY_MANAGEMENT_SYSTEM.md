# Megami Quest 2: Party Management System

## Overview

The party management system in Megami Quest 2 governs how players recruit, organize, and develop their party members. This system is central to gameplay progression, as stronger members enable exploration of more difficult areas.

## Party Structure

### Multiple Parties
- The game supports up to 3 simultaneous parties
- Each party can explore different areas independently
- Parties can be switched between using the UI
- Each party has its own inventory and location

```javascript
game.group = [
  {
    group_name: "Party1",
    members: [],
    items: [],
    location: areaId,
    position: {x: xPos, y: yPos},
    // additional party properties
  },
  // Party2 and Party3 similarly structured
];
```

### Members
Members (characters) are the core of each party, with the following attributes:

```javascript
member = {
  type: "memberType",         // Unique identifier
  name: "Character Name",     // Display name (editable)
  img_url: "character.png",   // Character portrait
  rare: 0-3,                  // Rarity tier (0=common, 3=legendary)
  level: 1,                   // Current level
  exp: 1,                     // Experience points
  nextlevel: 0,               // Experience needed for next level
  base_strength: 0,           // Base power (increases with level)
  
  // Power distribution ratios (configurable)
  ratio_speed: 0,             // Portion allocated to speed
  ratio_magic: 0,             // Portion allocated to magic
  
  // Attribute multipliers
  attr_strength: 1.0,         // Strength multiplier
  attr_speed: 1.0,            // Speed multiplier
  attr_magic: 1.0,            // Magic multiplier
  
  // Derived stats
  strength: 1,                // Physical attack power
  speed: 1,                   // Movement and attack speed
  magic: 1,                   // Magic power and healing
  
  stamina: 100,               // Energy level (0-100)
  level_index: 0.41,          // Level growth rate
  valid: 1,                   // Active status (0=standby, 1=active)
  equipment: null,            // Equipped item
  
  // Temporary stat modifiers
  a_strength: 0,              // Additive strength modifier
  a_speed: 0,                 // Additive speed modifier
  a_magic: 0,                 // Additive magic modifier
  m_strength: 1,              // Multiplicative strength modifier
  m_speed: 1,                 // Multiplicative speed modifier
  m_magic: 1                  // Multiplicative magic modifier
};
```

## Member Acquisition

### Summoning
Members can be acquired through summoning at shrine locations:

```javascript
summon_rank_data = [
  // Rank 0 (common)
  [["embla", 0.1], ["askr", 0.1], /* more members... */],
  
  // Rank 1 (uncommon)
  [["dis", 0.1], ["magni", 0.1], /* more members... */],
  
  // Rank 2 (rare)
  [["einherjar", 0.3], ["vidar", 0.1], /* more members... */]
];

summon_rank_price = [20, 1000, 200000]; // Cost for each rank
```

- Different shrines offer different ranks of members
- Summoning costs increase significantly with higher ranks
- Summoning uses weighted random selection

### Discovery
Some members are found through exploration or events rather than summoning.

## Member Development

### Leveling System
Member levels are calculated using a power function:

```javascript
function get_level_from_exp(a) {
    return Math.floor(Math.pow(a.exp, a.level_index));
}
```

- Each member has a unique `level_index` value (typically 0.36-0.42)
- Lower index values result in faster initial growth but slower end-game scaling
- Experience is earned from explored areas based on difficulty

### Stat Calculation
Member stats are calculated from their level and attributes:

```javascript
function update_member_strength(a) {
    var c = a.level_index;
    
    // Base power increases with level squared
    a.base_strength = Math.floor(demical(a.level * a.level * 0.5 + 1));
    
    // Distribute base power according to ratios and attributes
    a.strength = Math.floor(demical(a.base_strength * (1 - a.ratio_speed - a.ratio_magic) * a.attr_strength));
    a.speed = Math.floor(demical(a.base_strength * a.ratio_speed * a.attr_speed));
    a.magic = Math.floor(demical(a.base_strength * a.ratio_magic * a.attr_magic));
    
    // Calculate exp needed for next level
    a.nextlevel = Math.floor(demical(Math.pow(a.level + Number(1), 1 / c))) + 1;
    a.prevlevel = Math.floor(demical(Math.pow(a.level + Number(0), 1 / c))) + 1;
}
```

This creates a system where:
- Base power scales with level squared
- Players can distribute power between strength, speed, and magic
- Different members have different attribute multipliers affecting their specialization

### Power Distribution
Players can adjust how a member's power is distributed:

```javascript
function plus_member_divide(a, c) {
    var b = "ratio_" + c,
        e = game.group[game.currentGroup].members[currentDivideMember];
    
    // Check if adjustment is valid
    if (0 > e[b] + Number(a) || 1 < Number(e.ratio_speed) + Number(e.ratio_magic + a)) {
        return;
    }
    
    // Apply adjustment
    e[b] = demical(Number(e[b]) + Number(a), 100);
    update_divide_number();
}
```

This allows customization of member roles:
- Strength-focused for maximum damage
- Speed-focused for more attacks and faster movement
- Magic-focused for healing and magic damage
- Balanced distributions for versatility

### Member Classes
Members are assigned classes based on their attribute distribution:

```javascript
function get_member_class(a) {
    var c = a.attr_strength * attr_weight.strength,
        b = a.attr_speed * attr_weight.speed,
        e = a.attr_magic * attr_weight.magic,
        d = Math.max(c, b, e);
        
    a = c / d;
    b /= d;
    e /= d;
    
    // Determine class based on attribute ratios
    return c = .7 > b && .7 > e ? word_member_class_str : // Strength
              .7 > a && .7 > e ? word_member_class_spe : // Speed
              .7 > a && .7 > b ? word_member_class_mag : // Magic
              .7 > e ? word_member_class_strspe : // Strength+Speed
              .7 > b ? word_member_class_strmag : // Strength+Magic
              .7 > a ? word_member_class_spemag : // Speed+Magic
              5 < c ? word_member_class_ave2 : // Balanced (high strength)
              word_member_class_ave1; // Balanced
}
```

Classes are cosmetic but help players understand member specializations.

### Stamina System
Stamina represents a member's energy level:

- 100% stamina = full effectiveness
- 51-99% stamina = full effectiveness
- 26-50% stamina = 50% effectiveness
- 1-25% stamina = 25% effectiveness
- 0% stamina = inactive (no contribution)

Stamina decreases when:
- Party is in an area too difficult for them
- Member participates in losing combat
- Stamina recovers when entering towns

## Member Management

### Active/Standby Status
Members can be toggled between active and standby status:

```javascript
function change_on_off(a) {
    var c = game.group[game.currentGroup].members;
    c[a].valid = 1 == c[a].valid ? 0 : 1;
    document.getElementById("disp_total_strength").innerHTML = format_number(get_group_total_data(game.currentGroup).valid_total_strength);
    update_disp_members();
}
```

- Active members contribute to party strength and gain experience
- Standby members travel with the party but don't contribute or gain experience
- This allows for strategic management of resource distribution

### Party Editing
Players can move members between parties:

```javascript
function disp_edit_group() {
    game_pause();
    var a = $("#member_edit_group_window");
    $("#mask").show();
    show_window_effect(a);
    
    // Display current party configurations
    for (a = 0; a < game.group.length; a++) {
        var c = game.group[a].members,
            b = game.group[a].items;
        $(".member_edit_group_name").eq(a).html(game.group[a].group_name);
        
        // Display members in each party
        for (var e = 0; e < c.length; e++) {
            // Create member UI elements
        }
        
        // Display items in each party
        for (c = 0; c < b.length; c++) {
            // Create item UI elements
        }
    }
    
    // Enable drag-and-drop between parties
    $(".member_edit_group_member").sortable({
        connectWith: ".member_edit_group_member",
        placeholder: "member_small_holder"
    });
    
    $(".member_edit_group_item").sortable({
        connectWith: ".member_edit_group_item",
        placeholder: "item_small_holder"
    });
    
    // Disable dragging for parties that are too far away
    // (only nearby parties can exchange members)
}
```

This allows strategic distribution of members between parties.

### Member Dismissal
Members can be dismissed to gain gold:

```javascript
function fire_member(a, c) {
    var b = game.group[game.currentGroup].members;
    
    // Check if member has equipment or is the last member
    if (null != b[a].equipment) {
        alert(word_message_remove_equipment);
    } else if (1 >= b.length) {
        alert(word_message_remove_lastmember);
    } else {
        // Calculate gold reward based on member experience and attributes
        var e = get_member_gold(b[a]);
        
        // Confirm dismissal
        if (0 == c.ctrlKey) {
            var d = word_message_fire.replace("***gold***", "+" + format_number(e) + " G").replace("***name***", b[a].name);
            if (0 == confirm(d)) return;
        }
        
        // Add gold and remove member
        add_gold(e);
        b.splice(a, 1);
        
        // Update UI
        update_disp_total_strength();
        update_disp_members();
    }
}
```

The gold reward is calculated based on member experience and attributes:

```javascript
function get_member_gold(a) {
    var c = Math.floor(Math.pow(a.exp, 0.7)),
        b;
    b = 0 + a.attr_strength * attr_weight.strength;
    b += a.attr_speed * attr_weight.speed;
    b += a.attr_magic * attr_weight.magic;
    return c = Math.floor(c * b);
}
```

## Special Member Systems

### Fusion System
Members can be fused together to create stronger ones:

```javascript
function get_fusion_member() {
    var a = deep_copy(game.group[game.currentGroup].members[fusionBaseIdx]),
        c = deep_copy(game.group[game.currentGroup].members[fusionAddIdx]),
        b = 0;
    
    // Bonus based on sacrificed member level
    if (1000 <= c.level) {
        b = 1;
    } else if (500 <= c.level) {
        b = 0.2;
    } else {
        a.exp += c.exp;
    }
    
    // Bonus for matching classes
    if (0 < b && get_member_class(a) == get_member_class(c)) {
        b += 0.1;
    }
    
    // Enhance base member attributes
    a.attr_strength *= 1 + demical(Number(c.attr_strength) * attr_weight.strength * b, 100);
    a.attr_speed *= 1 + demical(Number(c.attr_speed) * attr_weight.speed * b, 100);
    a.attr_magic *= 1 + demical(Number(c.attr_magic) * attr_weight.magic * b, 100);
    
    a.attr_strength = demical(a.attr_strength, 100);
    a.attr_speed = demical(a.attr_speed, 100);
    a.attr_magic = demical(a.attr_magic, 100);
    
    update_member(a);
    return a;
}
```

Fusion allows for late-game optimization by combining members to exceed normal attribute limits.

### Ragnarok System
High-level members can be sacrificed to create powerful weapons:

```javascript
function get_weapon_from_member(b) {
    var a = {};
    
    // Calculate weapon stats based on member attributes and class
    var c = Math.pow(Math.log(b.attr_strength / 10) / Math.LN10, 2),
        g = "M";
    if (1 > b.attr_strength) c = 1;
    if (1 > c) c = 1;
    
    // Similar calculations for speed and magic
    
    // Modify stats based on member class
    switch (get_member_class(b)) {
        case word_member_class_str:
            d = e = "";
            a.img_url = "rag_str.png";
            break;
        case word_member_class_spe:
            c = "";
            e *= 2;
            d = "";
            a.img_url = "rag_spe.png";
            break;
        // Additional cases for other classes
    }
    
    // Generate weapon effect string
    a.effect = "";
    if ("" != c) a.effect += "str" + g + c + ",";
    if ("" != e) a.effect += "spe" + f + e + ",";
    if ("" != d) a.effect += "mag" + l + d + ",";
    
    return a;
}
```

This provides another progression path for extremely high-level members.

## Implementation Requirements

To replicate this party management system in a remastered version:

1. Create the multiple party structure with independent exploration
2. Implement the member attribute and stat calculation system
3. Build the level progression system using the power function
4. Design the member acquisition mechanics (summoning and discovery)
5. Create the power distribution interface for member customization
6. Implement the stamina system for long-term sustainability
7. Design the fusion and Ragnarok systems for late-game progression
8. Create an intuitive interface for managing members across parties