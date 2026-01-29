// markers.ts - Marker system logic

export interface Marker {
  id: string;
  map: string;
  category: string;
  subCategory: string;
  grid?: string;
  coordinates?: { x: number; y: number };
  icon: string;
  popup: string;
  description: string;
  customColor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const gridToCoordinates = (grid: string) => {
  const rowLetter = grid.charAt(0);
  const columnRange = grid.substring(1);
  
  const rowIndex = rowLetter.charCodeAt(0) - 65;
  const rowY = rowIndex * 1312 + 456;
  
  const [startCol, endCol] = columnRange.split('-').map(Number);
  const middleCol = (startCol + endCol) / 2;
  const colX = (middleCol - 1) * 612 + 256;
  
  return { x: colX, y: rowY };
};

export const coordinatesToGrid = (x: number, y: number): string => {
  const rowIndex = Math.round((y - 456) / 1312);
  const rowLetter = String.fromCharCode(65 + rowIndex);

  const colIndex = Math.round(((x - 256) / 612) + 1);
  
  return `${rowLetter}${colIndex}`;
};

export const getIconForCategory = (category: string): string => {
  const map: Record<string, string> = {
    'Monsters': '/markers/Monster.png',
    'NPCs': '/markers/NPC.png',
    'Bosses': '/markers/Boss.png',
    'Loot': '/markers/Loot.png',
    'Anomalies': '/markers/Anomaly.png',
    'Season Bosses': '/markers/Boss.png',
    'Teleports': '/markers/Simple Marker.png',
    'Quest Item': '/markers/Loot.png',
    'Safe zones': '/markers/Simple Marker.png',
    'Gasoline': '/markers/Loot.png',
    'Base': '/markers/Simple Marker.png',
    'Plant': '/markers/Simple Marker.png',
    'Artifacts': '/markers/Loot.png',
    'Radiation zone': '/markers/Anomaly.png',
    'Key': '/markers/Loot.png',
    'Event Area': '/markers/Simple Marker.png'
  };
  return map[category] || '/markers/Simple Marker.png';
};

// Function to get JSON file name from map file
export const getJsonFileNameFromMap = (mapFile: string, availableMaps: any[]): string => {
  const mapInfo = availableMaps.find(map => map.file === mapFile);
  return mapInfo?.jsonFile || 'Default.json';
};

// Async function to load markers for a specific map
export const loadMarkersForMap = async (mapFile: string, availableMaps: any[]): Promise<Marker[]> => {
  try {
    const jsonFileName = getJsonFileNameFromMap(mapFile, availableMaps);
    console.log(`Loading markers from: ${jsonFileName} for map: ${mapFile}`);
    
    // Dynamically import the JSON file
    const module = await import(`./markers-data/${jsonFileName}`);
    const markers = module.default || [];
    console.log(`Loaded ${markers.length} markers from ${jsonFileName}`);
    
    // Debug: Show first few markers
    if (markers.length > 0) {
      console.log('Sample marker:', markers[0]);
    }
    
    return markers;
  } catch (error) {
    console.error(`Failed to load markers for ${mapFile}:`, error);
    return [];
  }
};

export const updateMarkers = async (
  mapInstance: any,
  leaflet: any,
  currentMap: string,
  legendCategories: any,
  markersData: Marker[] = []
) => {
  if (!mapInstance || !leaflet) {
    console.warn('Map instance or leaflet not available');
    return [];
  }

  const newMarkers: any[] = [];
  console.log(`Updating markers. Total to process: ${markersData.length}`);
  console.log(`Current map: ${currentMap}`);

  markersData.forEach((markerInfo: Marker, index) => {
    const { map, category, subCategory, grid, coordinates, icon, popup } = markerInfo;

    // Debug: Log each marker being processed
    console.log(`Marker ${index}: map=${map}, category=${category}, subCategory=${subCategory}`);

    if (map === currentMap) {
      const isVisible = legendCategories[category]?.subItems[subCategory];
      console.log(`Marker ${index} visibility: ${isVisible} (category: ${category}, subCategory: ${subCategory})`);
      
      if (isVisible) {
        let coords;
        if (coordinates) {
          coords = coordinates;
        } else if (grid) {
          coords = gridToCoordinates(grid);
        } else {
          console.warn(`Marker ${index} has no coordinates or grid`);
          return;
        }
        
        // Use the icon from marker data or get default based on category
        const iconUrl = icon || getIconForCategory(category);
        console.log(`Marker ${index} using icon: ${iconUrl}`);
        
        const customIcon = leaflet.icon({
          iconUrl: iconUrl,
          iconSize: [20, 20],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24]
        });

        const marker = leaflet.marker([coords.y, coords.x], { icon: customIcon })
          .addTo(mapInstance)
          .bindPopup(popup);
        
        newMarkers.push(marker);
        console.log(`Added marker ${index} at coordinates: (${coords.x}, ${coords.y})`);
      }
    } else {
      console.log(`Marker ${index} skipped - wrong map: ${map} !== ${currentMap}`);
    }
  });

  console.log(`Total markers added to map: ${newMarkers.length}`);
  return newMarkers;
};

// Function to add a new marker to the JSON file
export const addMarkerToData = (marker: Marker, markersData: Marker[] = []): Marker[] => {
  return [...markersData, marker];
};

// Function to update an existing marker
export const updateMarkerInData = (id: string, updatedMarker: Marker, markersData: Marker[] = []): Marker[] => {
  return markersData.map(marker => 
    marker.id === id ? { ...updatedMarker, id, updatedAt: new Date().toISOString() } : marker
  );
};

// Function to delete a marker
export const deleteMarkerFromData = (id: string, markersData: Marker[] = []): Marker[] => {
  return markersData.filter(marker => marker.id !== id);
};

// Function to get markers for a specific map
export const getMarkersForMap = (mapFile: string, markersData: Marker[] = []): Marker[] => {
  return markersData.filter(marker => marker.map === mapFile);
};