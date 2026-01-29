import { sub } from "date-fns";

// mapData.ts - Map locations and legend data
export const availableMaps = [
  { 
    name: "Default Map", 
    file: "maps/T_Data_Map_Default.png", 
    displayName: "Default",
    jsonFile: "Default.json"
  },
  { 
    name: "Camp", 
    file: "maps/T_Data_Map_Camp.png", 
    displayName: "Camp",
    jsonFile: "Camp.json"
  },
  { 
    name: "Solenchy Town", 
    file: "maps/T_Data_Map_Solar_City_Town.png", 
    displayName: "Solenchy Town",
    jsonFile: "SolarCity.json"
  },
  { 
    name: "Solenchy Outskirts", 
    file: "maps/T_Data_Map_Solar_City.png", 
    displayName: "Solenchy Outskirts",
    jsonFile: "Solenchy.json"
  },
  { 
    name: "MTE", 
    file: "maps/T_Data_Map_Solar_City_Hangar.png", 
    displayName: "MTE",
    jsonFile: "MTE.json"
  },
  { 
    name: "Minaev Mine", 
    file: "maps/T_Data_Map_Minaev_Mine.png", 
    displayName: "Minaev Mine",
    jsonFile: "Minaev_Mine.json"
  },
  { 
    name: "Swamps", 
    file: "maps/T_Data_Map_Swamp.png", 
    displayName: "Swamps",
    jsonFile: "Swamps.json"
  },
  { 
    name: "Dead Forest", 
    file: "maps/T_Data_Map_Dead_Forest.png", 
    displayName: "Dead Forest",
    jsonFile: "Dead_Forest.json"
  },
  { 
    name: "PVP Arena", 
    file: "maps/T_Data_Map_PVP_Arena.png", 
    displayName: "PVP Arena",
    jsonFile: "PVP_Arena.json"
  },
  { 
    name: "PVP Arena MTE", 
    file: "maps/T_Data_PvP_Arena_MTE.png", 
    displayName: "PVP Arena MTE",
    jsonFile: "PVP_Arena_MTE.json"
  },
  { 
    name: "Exclusion Zone", 
    file: "maps/T_Data_Map_Deadlands.png", 
    displayName: "Exclusion Zone",
    jsonFile: "Exclusion_Zone.json"
  },
  { 
    name: "Canyon", 
    file: "maps/T_Data_Map_Canyon.png", 
    displayName: "Canyon",
    jsonFile: "Canyon.json"
  },
  { 
    name: "Testing Grounds", 
    file: "maps/T_Data_Map_Testing_Ground.png", 
    displayName: "Testing Grounds",
    jsonFile: "Testing_Grounds.json"
  },
  { 
    name: "Coast", 
    file: "maps/T_Data_Map_Coast.png", 
    displayName: "Coast",
    jsonFile: "Coast.json"
  },
  { 
    name: "Foothills", 
    file: "maps/T_Data_Map_Career.png", 
    displayName: "Foothills",
    jsonFile: "Foothills.json"
  }
];


export const initialLegendCategories = {
  'Monsters': {
    checked: false,
    expanded: false,
    subItems: {
      'Small Rats': false,
      'Big Rats': false,
      'Big White Rat': false,
      'Stray Dogs': false,
      'Elder Stray Dogs': false,
      'Watchers': false,
      'Big Watchers': false,
      'Bog Watchers': false,
      'Small Boars': false,
      'Boars': false,
      'Elder Boars': false,
      'Small Lizards': false,
      'Lizards': false,
      'Elder Lizards': false,
      'Small Cave Spiders': false,
      'Cave Spiders': false,
      'Big Cave Spiders': false,
      'Small Cockroaches': false,
      'Elder Cockroaches': false,
      'Small Bugs': false,
      'Bugs': false,
      'Elder Bugs': false,
      'Bog Beltchers': false,
      'Small symbionts': false,
      'Bog Symbiont': false,
      'Bears': false,
      'Bloodsuckers': false,
      'Elder Bloodsuckers': false,
      'Small Hornets': false,
      'Hornets': false,
      'Elder Hornets': false,
      'Jellies': false,
      'Big Jellies': false,
      'Small Sand Spiders': false,
      'Sand Spiders': false,
      'Big Sand Spiders': false,
      'Fire Spiders': false,
      'Elder Fire Spiders': false,
      'Sun Spiders': false,
      'Big Sun Spiders': false,
      'Matadors': false,
      'Toxic Spiders': false,
      'Elder Toxic Spiders': false,
      'Hogs of Coast': false,
      'Lurkers': false,
      'Listeners': false,
      'Stingrays': false,
    }
  },
  'Bosses': {
    checked: false,
    expanded: false,
    subItems: {
      'Metal Junk Boar': false,
      'Symbiont': false,
      'Big Cave Spider': false,
      'Giant Flesheater': false,
      'Giant Crab': false,
      'Crocodile': false,
    }
  },
  'Season Bosses': {
    checked: false,
    expanded: false,
    subItems: {
      'Frost Deer': false,
      'RW-01': false,
      'Hellbiont': false,
    }
  },
  'NPCs': {
    checked: false,
    expanded: false,
    subItems: {
      'Trader': false,
      'Gunsmith': false,
      'Doctor': false,
      'Barman': false,
      'Quest Giver': false,
      'Stockman': false
    }
  },
  'Anomalies': {
    checked: false,
    expanded: false,
    subItems: {
      'Gravitation Field': false,
      'Web Anomaly': false,
      'Burn Anomaly': false,
      'Tornado Anomaly': false,
    }
  },
  'Teleports': {
    checked: false,
    expanded: false,
    subItems: {
    }
  },
  'Quest Item': {
    checked: false,
    expanded: false,
    subItems: {
      'Lost PDA': false
    }
  },
  'Loot': {
    checked: false,
    expanded: false,
    subItems: {
      'Ammo': false,
      'Tools': false,
      'Medicine': false,
      'Food': false,
      'Armor': false,
      'Artifact': false,
      'Modules': false,
      'Electronics': false,
      'Crafting Tools': false,
      'Crafting Materials': false,
      'Miscellaneous': false,
      'Water Source': false,
      'Gasoline': false
    }
  },
  'Entrances/Exits': {
    checked: false,
    expanded: false,
    subItems: {
      'Town Entrance': false,
      'Town Exit': false,
      'Camp Entrance': false,
      'Camp Exit': false,
    }
  },
  'Safe zones': {
    checked: false,
    expanded: false,
    subItems: {
      'Town Entrance': false,
      'Town Exit': false,
      'Camp Entrance': false,
      'Camp Exit': false,
      'Blockpost': false
      
    }
  },
  'Base': {
    checked: false,
    expanded: false,
    subItems: {}
  },
  'Plants': {
    checked: false,
    expanded: false,
    subItems: {
        'Chamomile': false,
        'Milk Mushroom': false,
        'Cep': false,
        'Rose Bay': false,
        'Nettle': false,
        'Other herbs': false
    }
  },
  'Artifacts': {
    checked: false,
    expanded: false,
    subItems: {
      'Sparkler': false
    }
  },
  'Radiation zone': {
    checked: false,
    expanded: false,
    subItems: {
      'High Radiation': false
    }
  },
  'Key': {
    checked: false,
    expanded: false,
    subItems: {}
  },
  'Event Area': {
    checked: false,
    expanded: false,
    subItems: {}
  }
};