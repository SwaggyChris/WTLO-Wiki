// mapData.ts - Map locations and legend data
export const availableMaps = [
  { name: "Default Map", file: "maps/T_Data_Map_Default.png", displayName: "Default" },
  { name: "Camp", file: "maps/T_Data_Map_Camp.png", displayName: "Camp" },
  { name: "Solenchy Town", file: "maps/T_Data_Map_Solar_City_Town.png", displayName: "Solenchy Town" },
  { name: "Solenchy Outskirts", file: "maps/T_Data_Map_Solar_City.png", displayName: "Solenchy Outskirts" },
  { name: "MTE", file: "maps/T_Data_Map_Solar_City_Hangar.png", displayName: "MTE" },
  { name: "Minaev Mine", file: "maps/T_Data_Map_Minaev_Mine.png", displayName: "Minaev Mine" },
  { name: "Swamps", file: "maps/T_Data_Map_Swamp.png", displayName: "Swamps" },
  { name: "Dead Forest", file: "maps/T_Data_Map_Dead_Forest.png", displayName: "Dead Forest" },
  { name: "PVP Arena", file: "maps/T_Data_Map_PVP_Arena.png", displayName: "PVP Arena" },
  { name: "PVP Arena MTE", file: "maps/T_Data_PvP_Arena_MTE.png", displayName: "PVP Arena MTE" },
  { name: "Exclusion Zone", file: "maps/T_Data_Map_Deadlands.png", displayName: "Exclusion Zone" },
  { name: "Canyon", file: "maps/T_Data_Map_Canyon.png", displayName: "Canyon" },
  { name: "Testing Grounds", file: "maps/T_Data_Map_Testing_Ground.png", displayName: "Testing Grounds" },
  { name: "Coast", file: "maps/T_Data_Map_Coast.png", displayName: "Coast" },
  { name: "Foothills", file: "maps/T_Data_Map_Career.png", displayName: "Foothills" }
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
    subItems: {}
  },
  'Anomalies': {
    checked: false,
    subItems: {}
  },
  'Teleports': {
    checked: false,
    subItems: {}
  },
  'Quest Item': {
    checked: false,
    subItems: {}
  },
  'Safe zones': {
    checked: false,
    subItems: {}
  },
  'Loot': {
    checked: false,
    subItems: {}
  },
  'Gasoline': {
    checked: false,
    subItems: {}
  },
  'Base': {
    checked: false,
    subItems: {}
  },
  'Plant': {
    checked: false,
    subItems: {}
  },
  'Artifacts': {
    checked: false,
    subItems: {}
  },
  'Radiation zone': {
    checked: false,
    subItems: {}
  },
  'Key': {
    checked: false,
    subItems: {}
  },
  'Event Area': {
    checked: false,
    subItems: {}
  }
};