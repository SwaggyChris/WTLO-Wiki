// markers.ts - Marker system logic
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

export const updateMarkers = async (
  mapInstance: any,
  leaflet: any,
  currentMap: string,
  legendCategories: any,
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
};