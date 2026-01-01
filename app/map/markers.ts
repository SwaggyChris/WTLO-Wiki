// markers.ts - Marker system logic
<<<<<<< HEAD
import markerData from './markers.json';

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

=======
>>>>>>> 27388ac2a7a233b3fba15223bff6fb747a20ac51
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

<<<<<<< HEAD
// - New helper to calculate Grid ID from coordinates (Inverse of gridToCoordinates)
export const coordinatesToGrid = (x: number, y: number): string => {
  // y = rowIndex * 1312 + 456  =>  rowIndex = (y - 456) / 1312
  const rowIndex = Math.round((y - 456) / 1312);
  const rowLetter = String.fromCharCode(65 + rowIndex); // 65 is 'A'

  // x = (middleCol - 1) * 612 + 256  =>  middleCol = ((x - 256) / 612) + 1
  const colIndex = Math.round(((x - 256) / 612) + 1);
  
  // Return format "A1"
  return `${rowLetter}${colIndex}`;
};

// - New helper to get icon path based on category
export const getIconForCategory = (category: string): string => {
  const map: Record<string, string> = {
    'Monsters': '/markers/Monster.png',
    'NPCs': '/markers/NPC.png',
    'Bosses': '/markers/Boss.png',
    'Loot': '/markers/Loot.png',
    'Anomalies': '/markers/Anomaly.png',
    'Season Bosses': '/markers/Boss.png',
    'Teleports': '/markers/Default.png',
    'Quest Item': '/markers/Loot.png',
    'Safe zones': '/markers/Default.png',
    'Gasoline': '/markers/Loot.png',
    'Base': '/markers/Default.png',
    'Plant': '/markers/Default.png',
    'Artifacts': '/markers/Loot.png',
    'Radiation zone': '/markers/Anomaly.png',
    'Key': '/markers/Loot.png',
    'Event Area': '/markers/Default.png'
  };
  return map[category] || '/markers/Default.png';
};

=======
>>>>>>> 27388ac2a7a233b3fba15223bff6fb747a20ac51
export const updateMarkers = async (
  mapInstance: any,
  leaflet: any,
  currentMap: string,
  legendCategories: any,
<<<<<<< HEAD
  setMarkers: (markers: any[]) => void,
  markersData: Marker[] = markerData
) => {
  if (!mapInstance || !leaflet) return;

  const newMarkers: any[] = [];

  markersData.forEach((markerInfo: Marker) => {
    const { map, category, subCategory, grid, coordinates, icon, popup } = markerInfo;

    if (map === currentMap) {
      const isVisible = legendCategories[category]?.subItems[subCategory];
      if (isVisible) {
        let coords;
        if (coordinates) {
          coords = coordinates;
        } else if (grid) {
          coords = gridToCoordinates(grid);
        } else {
          return; // Skip marker if no coordinates or grid are provided
        }
        
        const customIcon = leaflet.icon({
          iconUrl: icon,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24]
        });

        const marker = leaflet.marker([coords.y, coords.x], { icon: customIcon })
          .addTo(mapInstance)
          .bindPopup(popup);
        
        newMarkers.push(marker);
      }
    }
  });

  setMarkers(newMarkers);
};

// Function to add a new marker to the JSON file
export const addMarkerToData = (marker: Marker, markersData: Marker[] = markerData): Marker[] => {
  return [...markersData, marker];
};

// Function to update an existing marker
export const updateMarkerInData = (id: string, updatedMarker: Marker, markersData: Marker[] = markerData): Marker[] => {
  return markersData.map(marker => 
    marker.id === id ? { ...updatedMarker, id, updatedAt: new Date().toISOString() } : marker
  );
};

// Function to delete a marker
export const deleteMarkerFromData = (id: string, markersData: Marker[] = markerData): Marker[] => {
  return markersData.filter(marker => marker.id !== id);
};

// Function to get markers for a specific map
export const getMarkersForMap = (mapFile: string, markersData: Marker[] = markerData): Marker[] => {
  return markersData.filter(marker => marker.map === mapFile);
=======
  setMarkers: (markers: any[]) => void
) => {
  if (!mapInstance || !leaflet) return;
  
  // Clear existing markers
  // (markers state needs to be managed externally)
  
  // Check if we should show Small Rats marker
  const isSmallRatsChecked = legendCategories.Monsters?.subItems['Small Rats'];
  const isSolenchyTown = currentMap === "maps/T_Data_Map_Solar_City_Town.png";
  
  if (isSmallRatsChecked && isSolenchyTown) {
    const coords = gridToCoordinates('C2-6');
    
    const customIcon = leaflet.icon({
      iconUrl: '/markers/Monster.png',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
    
    const marker = leaflet.marker([coords.y, coords.x], { icon: customIcon })
      .addTo(mapInstance)
      .bindPopup('<strong>Small Rats Spawn</strong><br>Grid: C2-6<br><em>Common spawn area</em>')
      .openPopup();
    
    setMarkers([marker]);
  } else {
    setMarkers([]);
  }
>>>>>>> 27388ac2a7a233b3fba15223bff6fb747a20ac51
};