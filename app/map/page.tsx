"use client"

// Prevent Next.js from statically prerendering this page so client-only
// code (which references window) won't run on the server during build.
export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
// Leaflet is dynamically imported on the client. Avoid importing at top-level to prevent server-side window access.
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import styles from "./map.module.css"

// Import separated data and functions
import { availableMaps, initialLegendCategories } from "./mapData"
import { updateMarkers, coordinatesToGrid, getIconForCategory } from "./markers" //

const markerIcons = [
  "Artifact.png", "CompleteActiveQuestPoint.png", "CompleteQuestPoint.png", "Danger.png", "Food.png",
  "Forest.png", "Fuel.png", "Important Marker.png", "Key.png", "Marked Location.png", "Monster.png",
  "NDP Teleport.png", "NPC.png", "NPCDoctor.png", "NPCGunsmith.png", "NPCStockman.png", "NPCTrader.png",
  "Portal.png", "PVP Zone.png", "Quest.png", "QuestPoint.png", "Radiation.png", "Safezone.png",
  "Simple Marker.png", "TakeQuestPoint.png", "Unknown Area.png", "Water.png", "WaterSource.png"
];

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const redLightRef = useRef<HTMLDivElement>(null)
  const greenLightRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const [zoomLevel, setZoomLevel] = useState(-2)
  const [showMapMenu, setShowMapMenu] = useState(false)
  const [showLegendMenu, setShowLegendMenu] = useState(false)
  const [showWtlomenu, setShowWtlomenu] = useState(false)
  const [currentMap, setCurrentMap] = useState("maps/T_Data_Map_Solar_City_Town.png")
  const [pdaSkin, setPdaSkin] = useState<string>('/PDA.png')
  const [pdaOn, setPdaOn] = useState<boolean>(true)
  const [pdaNatural, setPdaNatural] = useState<{w:number,h:number}|null>(null)
  const [btnPressed, setBtnPressed] = useState(false)
  const [skinDropdownOpen, setSkinDropdownOpen] = useState(true)
  const [disclosedMarkerId, setDisclosedMarkerId] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // Drag functionality states for WTLO Menu
  const [wtloMenuPosition, setWtloMenuPosition] = useState({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Drag functionality states for External Map Menu (WTLO Menu)
  const [externalMenuPosition, setExternalMenuPosition] = useState({ x: 20, y: 100 })
  const [isExternalDragging, setIsExternalDragging] = useState(false)
  const [externalDragStart, setExternalDragStart] = useState({ x: 0, y: 0 })

  // Marker system states
  const [markers, setMarkers] = useState<any[]>([])
  const [leafletRef, setLeafletRef] = useState<any>(null)

  // Custom markers from editor
  const [customMarkers, setCustomMarkers] = useState<any[]>([])

  // --- MARKER EDITOR STATE ---
  const [editorMode, setEditorMode] = useState(false)
  const [pendingMarker, setPendingMarker] = useState<any | null>(null)
  const [editorForm, setEditorForm] = useState({
    category: '',
    subCategory: '',
    description: '',
    popupTitle: '',
    icon: ''
  })
  
  // ---------------------------

  // Updated Legend categories state structure with nested sub-items
  const [legendCategories, setLegendCategories] = useState<Record<string, {
    checked: boolean;
    expanded?: boolean;
    subItems: Record<string, boolean>;
  }>>(initialLegendCategories)

  // Drag functionality for WTLO Menu
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - wtloMenuPosition.x,
      y: e.clientY - wtloMenuPosition.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setWtloMenuPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Drag functionality for External Map Menu (WTLO Menu)
  const handleExternalMouseDown = (e: React.MouseEvent) => {
    setIsExternalDragging(true)
    setExternalDragStart({
      x: e.clientX - externalMenuPosition.x,
      y: e.clientY - externalMenuPosition.y
    })
  }

  const handleExternalMouseMove = (e: React.MouseEvent) => {
    if (!isExternalDragging) return
    setExternalMenuPosition({
      x: e.clientX - externalDragStart.x,
      y: e.clientY - externalDragStart.y
    })
  }

  const handleExternalMouseUp = () => {
    setIsExternalDragging(false)
  }

  // Add event listeners for external menu dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isExternalDragging) return
      setExternalMenuPosition({
        x: e.clientX - externalDragStart.x,
        y: e.clientY - externalDragStart.y
      })
    }

    const handleMouseUp = () => {
      setIsExternalDragging(false)
    }

    if (isExternalDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isExternalDragging, externalDragStart])

  // Function to update markers based on legend and map state
  const updateMarkersHandler = async (customMarkersData: any[] = []) => {
    if (!mapInstanceRef.current || !leafletRef) return
    
    // Clear existing markers
    markers.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker)
    });
    
    // Use the imported updateMarkers function for default markers
    await updateMarkers(
      mapInstanceRef.current,
      leafletRef,
      currentMap,
      legendCategories,
      setMarkers
    );
    
    // Add custom markers if any
    customMarkersData.forEach((markerInfo: any) => {
      const { map, category, subCategory, grid, coordinates, icon, popup } = markerInfo;

      if (map === currentMap) {
        // Only show if legend category is checked or we are in editor mode (optional, currently strictly following legend)
        const isVisible = legendCategories[category]?.subItems[subCategory] || editorMode; 
        
        if (isVisible) {
          let coords;
          if (coordinates) {
            coords = coordinates;
          } else if (grid) {
            // Re-use logic or import logic (we imported coordinatesToGrid but gridToCoordinates is in markers.ts too)
            // Ideally import gridToCoordinates, but we can rely on `coordinates` being present for custom markers we just made
             // For safety, let's just use the coordinates we saved
             coords = coordinates;
          } else {
            return; 
          }
          
          const customIcon = leafletRef.icon({
            iconUrl: icon,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
          });

          const marker = leafletRef.marker([coords.y, coords.x], { icon: customIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(popup);
          
          setMarkers(prev => [...prev, marker]);
        }
      }
    });
  }

  // Update markers when conditions change
  useEffect(() => {
    updateMarkersHandler(customMarkers)
  }, [currentMap, legendCategories, customMarkers, editorMode])

  // Handle custom markers from editor
  const handleSaveCustomMarkers = (newMarkers: any[]) => {
    setCustomMarkers(newMarkers);
    // Update markers on the map
    updateMarkersHandler(newMarkers);
  };

  // --- MAP CLICK LISTENER FOR EDITOR ---
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef) return;

    const map = mapInstanceRef.current;

    const onMapClick = (e: any) => {
      if (!editorMode) return;

      const { lat, lng } = e.latlng; // In Simple CRS, lat is Y, lng is X
      
      // Calculate Grid
      const gridId = coordinatesToGrid(lng, lat);
      
      // Create a temporary visual marker
      const tempId = Date.now().toString();
      const newMarker = {
        id: tempId,
        map: currentMap,
        coordinates: { x: Math.round(lng), y: Math.round(lat) },
        grid: gridId,
        // Default values until form is submitted
        category: '',
        subCategory: '',
        description: '',
        popup: '<strong>New Marker</strong>',
        icon: '/markers/Simple Marker.png'
      };

      setPendingMarker(newMarker);
      
      // Reset form
      setEditorForm({
        category: Object.keys(legendCategories)[0], // Default to first category
        subCategory: '',
        description: '',
        popupTitle: '',
        icon: getIconForCategory(Object.keys(legendCategories)[0]) || '/markers/Simple Marker.png'
      });
    };

    if (editorMode) {
      map.on('click', onMapClick);
      // Change cursor to crosshair to indicate edit mode
      document.getElementById('map-container-div')?.style.setProperty('cursor', 'crosshair');
    } else {
      map.off('click', onMapClick);
      document.getElementById('map-container-div')?.style.setProperty('cursor', 'default');
      setPendingMarker(null);
    }

    return () => {
      map.off('click', onMapClick);
    };
  }, [editorMode, currentMap, leafletRef, legendCategories]);

  // --- SAVE MARKER FUNCTION ---
  const handleSaveMarker = () => {
    if (!pendingMarker) return;

    const iconPath = editorForm.icon || getIconForCategory(editorForm.category);

    const finalMarker = {
      ...pendingMarker,
      category: editorForm.category,
      subCategory: editorForm.subCategory,
      description: editorForm.description,
      icon: iconPath,
      popup: `<strong>${editorForm.popupTitle || editorForm.subCategory}</strong><br>Grid: ${pendingMarker.grid}<br><em>${editorForm.description}</em>`,
      customColor: "#ffffff",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedList = [...customMarkers, finalMarker];
    handleSaveCustomMarkers(updatedList);
    
    setPendingMarker(null); // Clear pending to allow next click
  };

  // --- REMOVE MARKER FUNCTION ---
  const handleRemoveMarker = (markerId: string) => {
    const updatedList = customMarkers.filter(marker => marker.id !== markerId);
    handleSaveCustomMarkers(updatedList);
  };

  // --- EXPORT JSON FUNCTION ---
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customMarkers, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "markers_export.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // [Rest of the useEffect for map initialization remains the same...]
  useEffect(() => {
    if (mapRef.current && typeof window !== "undefined" && !mapInstanceRef.current) {
      ;(async () => {
        const LeafletModule = await import("leaflet")
        const Leaflet: any = (LeafletModule as any).default ?? LeafletModule
        setLeafletRef(Leaflet)

        try {
          await import("leaflet-draw")
        } catch (e) {
          // ignore if import fails
        }

        const map = Leaflet.map(mapRef.current, {
          crs: Leaflet.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
        minZoom: -2,
        maxZoom: 2,
        wheelPxPerZoomLevel: 120,
        maxBoundsViscosity: 1.0,
        })
        mapInstanceRef.current = map

      const imageWidth = 4096
      const imageHeight = 4096
      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [imageHeight, imageWidth],
      ]

      Leaflet.imageOverlay(`/${currentMap}`, bounds).addTo(map)

      map.setView([2048, 2048], -2)
      map.setMaxBounds(bounds)

        const GridLayer = Leaflet.GridLayer.extend({
        createTile: function (coords: any) {
          const tile = document.createElement("div")
          tile.style.outline = "1px solid rgba(255, 255, 255, 0.2)"
          return tile
        },
      })
        new GridLayer().addTo(map)

        map.on('zoom', () => {
        setZoomLevel(map.getZoom())
      })

      // [Rest of the lights logic...]
      if (redLightRef.current && greenLightRef.current) {
        redLightRef.current.style.opacity = "0.1"
        greenLightRef.current.style.opacity = "0.8"

        let redLightInterval: NodeJS.Timeout;
        let greenLightInterval: NodeJS.Timeout;

        const startRedBlink = () => {
          let step = 0;
          const blinkSequence = [
            { opacity: 1, duration: 80 },
            { opacity: 0.1, duration: 60 },
            { opacity: 1, duration: 80 },
            { opacity: 0.1, duration: 60 },
            { opacity: 1, duration: 100 },
            { opacity: 0.1, duration: 80 },
            { opacity: 0.1, duration: 800 }
          ];

          const executeStep = () => {
            if (step < blinkSequence.length && redLightRef.current) {
              const { opacity, duration } = blinkSequence[step];
              redLightRef.current.style.opacity = opacity.toString();
              
              step++;
              redLightInterval = setTimeout(executeStep, duration);
            } else {
              step = 0;
              redLightInterval = setTimeout(executeStep, 100);
            }
          };

          executeStep();
        };

        const startGreenBlink = () => {
          let isRising = false;
          let currentOpacity = 0.8;
          
          greenLightInterval = setInterval(() => {
            if (greenLightRef.current) {
              if (isRising) {
                currentOpacity += 0.08;
                if (currentOpacity >= 1) {
                  currentOpacity = 1;
                  isRising = false;
                  clearInterval(greenLightInterval);
                  greenLightInterval = setTimeout(() => {
                    startGreenBlink();
                  }, Math.random() * 300 + 200);
                }
              } else {
                currentOpacity -= 0.05;
                if (currentOpacity <= 0.3) {
                  currentOpacity = 0.3;
                  isRising = true;
                  clearInterval(greenLightInterval);
                  greenLightInterval = setTimeout(() => {
                    startGreenBlink();
                  }, Math.random() * 400 + 300);
                }
              }
              
              greenLightRef.current.style.opacity = currentOpacity.toString();
            }
          }, 60);
        };

        setTimeout(() => {
          startRedBlink();
          startGreenBlink();
        }, 500);

          return () => {
            if (redLightInterval) clearTimeout(redLightInterval);
            if (greenLightInterval) clearTimeout(greenLightInterval);
          }
        }
      })()
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [currentMap])

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value)
    setZoomLevel(newZoom)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(newZoom)
    }
  }

  const handleMapSwitch = (mapFile: string) => {
    if (mapInstanceRef.current) {
      ;(async () => {
        const LeafletModule = await import("leaflet")
        const Leaflet: any = (LeafletModule as any).default ?? LeafletModule

        // Clear existing layers
        mapInstanceRef.current!.eachLayer((layer: any) => {
          if (Leaflet.ImageOverlay && layer instanceof Leaflet.ImageOverlay) {
            mapInstanceRef.current?.removeLayer(layer)
          }
        })

        // Add new map
        const imageWidth = 4096
        const imageHeight = 4096
        const bounds: any = [
          [0, 0],
          [imageHeight, imageWidth],
        ]

        Leaflet.imageOverlay(`/${mapFile}`, bounds).addTo(mapInstanceRef.current as any)
        setCurrentMap(mapFile)
        setShowMapMenu(false)
      })()
    }
  }

  const toggleMapMenu = () => {
    setShowMapMenu(!showMapMenu)
    if (showLegendMenu) setShowLegendMenu(false)
  }

  const toggleLegendMenu = () => {
    setShowLegendMenu(!showLegendMenu)
    if (showMapMenu) setShowMapMenu(false)
  }

  const toggleCategory = (categoryName: string) => {
    setLegendCategories(prev => {
      const newState = { ...prev }
      const newChecked = !newState[categoryName].checked
      
      newState[categoryName] = {
        ...newState[categoryName],
        checked: newChecked
      }
      
      if (Object.keys(newState[categoryName].subItems).length > 0) {
        const updatedSubItems: Record<string, boolean> = {}
        Object.keys(newState[categoryName].subItems).forEach(subItem => {
          updatedSubItems[subItem] = newChecked
        })
        newState[categoryName].subItems = updatedSubItems
      }
      
      return newState
    })
  }

  const toggleSubItem = (categoryName: string, subItemName: string) => {
    setLegendCategories(prev => {
      const newState = { ...prev }
      
      newState[categoryName] = {
        ...newState[categoryName],
        subItems: {
          ...newState[categoryName].subItems,
          [subItemName]: !newState[categoryName].subItems[subItemName]
        }
      }
      
      const allSubItems = Object.values(newState[categoryName].subItems)
      if (allSubItems.length > 0) {
        const allChecked = allSubItems.every(item => item === true)
        newState[categoryName].checked = allChecked
      }
      
      return newState
    })
  }

  const toggleCategoryExpansion = (categoryName: string) => {
    setLegendCategories(prev => {
      const newState = { ...prev }
      newState[categoryName] = {
        ...newState[categoryName],
        expanded: !newState[categoryName].expanded
      }
      return newState
    })
  }

  const toggleWtlomenu = () => {
    setShowWtlomenu(!showWtlomenu)
  }

  return (
    <div className={styles.centerPage}>
      <div className={styles.mapTitleWrapper}>
        <h1 className={styles.mapTitle}>Interactive Map</h1>
      </div>

      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to Main Page</span>
      </Link>

      <div className={styles.pdaContainer}>
          <Image
            src={pdaSkin}
            alt="PDA Frame"
            width={1200}
            height={750}
            className={styles.pdaFrame}
            priority
            onLoadingComplete={(img) => {
              try {
                const naturalWidth = (img as any).naturalWidth || 1200
                const naturalHeight = (img as any).naturalHeight || 750
                setPdaNatural({ w: naturalWidth, h: naturalHeight })
              } catch (e) {
                setPdaNatural({ w: 1200, h: 750 })
              }
            }}
          />
        <div
          ref={redLightRef}
          className={`${styles.pdaLight} ${styles.pdaLightRed}`}
        ></div>
        <div
          ref={greenLightRef}
          className={`${styles.pdaLight} ${styles.pdaLightGreen}`}
        ></div>

        <div className={`${styles.pdaScreen} ${!pdaOn ? styles.pdaScreenOffVisible : ''}`}>
          {/* UPDATED: Added ID for cursor manipulation */}
          <div ref={mapRef} id="map-container-div" className={styles.map} aria-hidden={!pdaOn}></div>
          
          <div className={styles.zoomSliderContainer}>
            <div className={styles.zoomSliderWrapper}>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={zoomLevel}
                onChange={handleZoomChange}
                className={styles.zoomSlider}
              />
            </div>
          </div>

          <div className={styles.mapSwitchContainer}>
            <button
              onClick={toggleMapMenu}
              className={styles.mapSwitchButton}
            >
              MAP
            </button>
            
            {showMapMenu && (
              <div className={styles.mapMenu}>
                <div className={styles.mapMenuHeader}>
                  <h3>Locations List</h3>
                </div>
                <ul className={styles.mapMenuList}>
                  {availableMaps.map((map) => (
                    <li
                      key={map.file}
                      className={`${styles.mapMenuItem} ${
                        currentMap === map.file ? styles.active : ""
                      }`}
                      onClick={() => handleMapSwitch(map.file)}
                    >
                      {map.displayName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={styles.legendContainer}>
            <button
              onClick={toggleLegendMenu}
              className={styles.legendButton}
            >
             Legend
            </button>
            
            {showLegendMenu && (
              <div className={styles.legendMenu}>
                <div className={styles.legendMenuHeader}>
                  <h3>Legend Marks</h3>
                </div>
                <ul className={styles.legendMenuList}>
                  {Object.entries(legendCategories).map(([categoryName, categoryData]) => (
                    <li key={categoryName} className={styles.legendCategoryItem}>
                      <div 
                        className={styles.legendCategoryRow}
                        onClick={() => {
                          if (Object.keys(categoryData.subItems).length > 0) {
                            toggleCategoryExpansion(categoryName)
                          }
                        }}
                      >
                        <div 
                          className={`${styles.legendCheckbox} ${categoryData.checked ? styles.checked : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCategory(categoryName)
                          }}
                        />
                        <span className={styles.legendCategoryLabel}>
                          {categoryName}
                        </span>
                        {Object.keys(categoryData.subItems).length > 0 && (
                          <span className={`${styles.categoryArrow} ${categoryData.expanded ? styles.open : ''}`}>
                            ▼
                          </span>
                        )}
                      </div>
                      
                      {Object.keys(categoryData.subItems).length > 0 && categoryData.expanded && (
                        <ul className={styles.subItemList}>
                          {Object.entries(categoryData.subItems).map(([subItemName, isChecked]) => (
                            <li 
                              key={`${categoryName}-${subItemName}`}
                              className={styles.subItem}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSubItem(categoryName, subItemName)
                              }}
                            >
                              <div 
                                className={`${styles.subItemCheckbox} ${isChecked ? styles.checked : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleSubItem(categoryName, subItemName)
                                }}
                              />
                              <span className={styles.subItemLabel}>
                                {subItemName}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={styles.uiContainer}></div>
          {!pdaOn && (
            <div className={styles.pdaScreenOff} role="status" aria-live="polite">
              <div className={styles.pdaScreenOffInner}>
                <div className={styles.pdaPowerIcon}>⏻</div>
                <div className={styles.pdaOffText}>PDA Powered Off</div>
              </div>
            </div>
          )}
        </div>
        {pdaNatural && (
          (() => {
            const x1 = 1790, y1 = 343, w = 39, h = 46
            const leftPct = (x1 / pdaNatural.w) * 100
            const topPct = (y1 / pdaNatural.h) * 100
            const widthPct = (w / pdaNatural.w) * 100
            const heightPct = (h / pdaNatural.h) * 100
            return (
              <button
                className={`${styles.pdaFrameButton} ${btnPressed ? styles.pdaFrameButtonPressed : ''}`}
                onClick={() => {
                  setPdaOn(s => !s)
                  setBtnPressed(true)
                  setTimeout(() => setBtnPressed(false), 180)
                }}
                aria-pressed={!pdaOn}
                aria-label={pdaOn ? 'Turn PDA off' : 'Turn PDA on'}
                style={{ left: `${leftPct}%`, top: `${topPct}%`, width: `${widthPct}%`, height: `${heightPct}%` }}
              />
            )
          })()
        )}
      </div>

    <div 
      className={styles.wtloMenuContainer}
      style={{
        position: 'fixed',
        left: `${externalMenuPosition.x}px`,
        top: `${externalMenuPosition.y}px`,
        cursor: isExternalDragging ? 'grabbing' : 'default'
      }}
    >
      <button 
        className={styles.wtloMenuToggle} 
        onClick={toggleWtlomenu} 
        aria-expanded={showWtlomenu ? 'true' : 'false'}
      >
        Map Menu
      </button>

      {showWtlomenu && (
        <div 
          className={styles.wtloMenu} 
          aria-label="WTLO Menu"
          style={{ cursor: 'default' }}
        >
          <div 
            className={styles.wtloMenuHeader}
            onMouseDown={handleExternalMouseDown}
            style={{ 
              cursor: isExternalDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
          >
            <h3>Menu Contents</h3>
            <div className={styles.dragHandleHint}>↕ Drag</div>
          </div>
          
          <div className={styles.wtloMenuContent}>
            
            {/* EXISTING SKIN CHANGER */}
            <div className={styles.wtloMenuSection}>
              <div className={styles.wtloDropdown}>
                <div 
                  className={styles.wtloDropdownHeader}
                  onClick={() => setSkinDropdownOpen(!skinDropdownOpen)}
                >
                  <h5 className={styles.wtloDropdownTitle}>Skin Changer</h5>
                  <span className={`${styles.wtloDropdownIcon} ${skinDropdownOpen ? styles.open : ''}`}>
                    ▼
                  </span>
                </div>
                
                {skinDropdownOpen && (
                  <div className={styles.wtloDropdownContent}>
                    <div 
                      className={`${styles.wtloSkinOption} ${pdaSkin === '/PDA.png' ? styles.active : ''}`}
                      onClick={() => { 
                        setPdaSkin('/PDA.png'); 
                      }}
                    >
                      <Image 
                        src="/PDA.png" 
                        alt="Default PDA Frame" 
                        width={60} 
                        height={40}
                        className={styles.wtloSkinPreview}
                      />
                      <div className={styles.wtloSkinInfo}>
                        <div className={styles.wtloSkinName}>DEFAULT</div>
                        <div className={styles.wtloSkinDescription}>Standard issue PDA</div>
                        {pdaSkin === '/PDA.png' && <span className={styles.wtloSkinBadge}>ACTIVE</span>}
                      </div>
                    </div>
                    
                    <div 
                      className={`${styles.wtloSkinOption} ${pdaSkin === '/bss_pda frame.png' ? styles.active : ''}`}
                      onClick={() => { 
                        setPdaSkin('/bss_pda frame.png'); 
                      }}
                    >
                      <Image 
                        src="/bss_pda frame.png" 
                        alt="Black Sunset PDA Frame" 
                        width={60} 
                        height={40}
                        className={styles.wtloSkinPreview}
                      />
                      <div className={styles.wtloSkinInfo}>
                        <div className={styles.wtloSkinName}>BLACK SUNSET</div>
                        <div className={styles.wtloSkinDescription}>Dark tactical</div>
                        {pdaSkin === '/bss_pda frame.png' && <span className={styles.wtloSkinBadge}>ACTIVE</span>}
                      </div>
                    </div>
                    
                    <div 
                      className={`${styles.wtloSkinOption} ${pdaSkin === '/confed_pda frame.png' ? styles.active : ''}`}
                      onClick={() => { 
                        setPdaSkin('/confed_pda frame.png'); 
                      }}
                    >
                      <Image 
                        src="/confed_pda frame.png" 
                        alt="Confederation PDA Frame" 
                        width={60} 
                        height={40}
                        className={styles.wtloSkinPreview}
                      />
                      <div className={styles.wtloSkinInfo}>
                        <div className={styles.wtloSkinName}>CONFEDERATION</div>
                        <div className={styles.wtloSkinDescription}>Military design</div>
                        {pdaSkin === '/confed_pda frame.png' && <span className={styles.wtloSkinBadge}>ACTIVE</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0'}} />

            {/* --- NEW MARKER EDITOR SECTION --- */}
            <div className={styles.wtloMenuSection}>
              <div className={styles.wtloDropdownHeader}>
                <h5 className={styles.wtloDropdownTitle}>Marker Editor</h5>
              </div>

              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Toggle Edit Mode */}
                <button
                  onClick={() => setEditorMode(!editorMode)}
                  style={{
                    background: editorMode ? '#4CAF50' : '#333',
                    color: 'white',
                    border: '1px solid #555',
                    padding: '8px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '11px'
                  }}
                >
                  {editorMode ? 'Turn Edit Mode OFF' : 'Turn Edit Mode ON'}
                </button>

                {editorMode && (
                  <div style={{ fontSize: '11px', color: '#aaa', fontStyle: 'italic', textAlign: 'center' }}>
                    Click on the map to place a marker.
                  </div>
                )}

                {/* Form appears only when a spot is clicked (pendingMarker exists) */}
                {editorMode && pendingMarker && (
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '10px', 
                    borderRadius: '4px',
                    border: '1px solid #444',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px' 
                  }}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <label htmlFor="marker-id" style={{fontSize: '12px', color: '#fff', 'width' : '40px'}}>ID:</label>
                        <input
                          id="marker-id"
                          type="text"
                          value={pendingMarker.id}
                          onChange={(e) => setPendingMarker({ ...pendingMarker, id: e.target.value })}
                          style={{background: '#222', color: '#fff', border: '1px solid #555', padding: '4px', fontSize: '12px', flex: 1}}
                        />
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <label htmlFor="marker-grid" style={{fontSize: '12px', color: '#fff', 'width' : '40px'}}>Grid:</label>
                        <input
                          id="marker-grid"
                          type="text"
                          value={pendingMarker.grid}
                          onChange={(e) => setPendingMarker({ ...pendingMarker, grid: e.target.value })}
                          style={{background: '#222', color: '#fff', border: '1px solid #555', padding: '4px', fontSize: '12px', flex: 1}}
                        />
                      </div>
                    </div>

                    {/* Category Select */}
                    <select 
                      value={editorForm.category}
                      onChange={(e) => setEditorForm({...editorForm, category: e.target.value, subCategory: ''})}
                      style={{background: '#222', color: '#fff', border: '1px solid #555', padding: '4px', fontSize: '12px'}}
                    >
                      <option value="">Select Category</option>
                      {Object.keys(legendCategories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    {/* SubCategory Select */}
                    <select 
                      value={editorForm.subCategory}
                      onChange={(e) => setEditorForm({...editorForm, subCategory: e.target.value})}
                      style={{background: '#222', color: '#fff', border: '1px solid #555', padding: '4px', fontSize: '12px'}}
                      disabled={!editorForm.category}
                    >
                      <option value="">Select SubCategory</option>
                      {editorForm.category && legendCategories[editorForm.category]?.subItems && 
                        Object.keys(legendCategories[editorForm.category].subItems).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))
                      }
                    </select>

                    {/* Icon Picker */}
                    <div>
                      <button 
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        style={{
                          width: '100%',
                          background: '#222',
                          color: '#fff',
                          border: '1px solid #555',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{fontSize: '12px'}}>Icon</span>
                        {editorForm.icon && <Image src={editorForm.icon} alt="Selected Icon" width={24} height={24} />}
                      </button>
                      {showIconPicker && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                          gap: '5px',
                          padding: '5px',
                          background: '#333',
                          border: '1px solid #555',
                          marginTop: '2px',
                          maxHeight: '150px',
                          overflowY: 'auto'
                        }}>
                          {markerIcons.map(iconFile => (
                            <div 
                              key={iconFile}
                              onClick={() => {
                                setEditorForm({...editorForm, icon: `/markers/${iconFile}`});
                                setShowIconPicker(false);
                              }}
                              style={{
                                background: editorForm.icon === `/markers/${iconFile}` ? '#4CAF50' : '#222',
                                padding: '5px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px'
                              }}
                            >
                              <Image src={`/markers/${iconFile}`} alt={iconFile} width={24} height={24} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>


                    {/* Inputs */}
                    <input 
                      type="text" 
                      placeholder="Title (optional)"
                      value={editorForm.popupTitle}
                      onChange={(e) => setEditorForm({...editorForm, popupTitle: e.target.value})}
                      style={{background: '#222', color: '#fff', border: '1px solid #555', padding: '4px', fontSize: '12px'}}
                    />

                    <textarea 
                      placeholder="Description"
                      value={editorForm.description}
                      onChange={(e) => setEditorForm({...editorForm, description: e.target.value})}
                      style={{background: '#222', color: '#fff', border: '1px solid #555', padding: '4px', minHeight: '50px', fontSize: '12px'}}
                    />

                    {/* Actions */}
                    <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                      <button 
                        onClick={handleSaveMarker}
                        style={{flex: 1, background: '#2196F3', color: 'white', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '3px', fontSize: '11px'}}
                      >
                        SAVE
                      </button>
                      <button 
                        onClick={() => setPendingMarker(null)}
                        style={{flex: 1, background: '#F44336', color: 'white', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '3px', fontSize: '11px'}}
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => setPendingMarker(null)} // Assuming pendingMarker is the one being edited
                        style={{flex: 1, background: '#F44336', color: 'white', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '3px', fontSize: '11px'}}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                  
                )}

                {/* Export Button and Marker List */}
                {customMarkers.length > 0 && (
                  <div style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444'}}>
                     <div style={{fontSize: '11px', marginBottom: '5px', color: '#aaa'}}>
                       New markers created: {customMarkers.length}
                     </div>
                     <button
                      onClick={handleExportJson}
                      style={{
                        width: '100%',
                        background: '#FF9800',
                        color: 'black',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    >
                      EXPORT ALL TO JSON
                    </button>
                    
                      
                    {/* Individual Marker JSON reveal */}
                    <div style={{marginTop: '15px'}}>
                      <h6 style={{color: '#ccc', fontSize: '12px', marginBottom: '5px'}}>Created Markers:</h6>
                      {customMarkers.map((marker) => (
                        <div 
                          key={marker.id} 
                          style={{
                            background: 'rgba(0,0,0,0.2)', 
                            padding: '8px', 
                            borderRadius: '4px', 
                            marginBottom: '5px',
                            border: disclosedMarkerId === marker.id ? '1px solid #4CAF50' : 'none'
                          }}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{fontSize: '11px', color: '#ddd'}}>{marker.subCategory || 'Untitled'}: {marker.description.substring(0,20)}...</span>
                            <button 
                              onClick={() => setDisclosedMarkerId(disclosedMarkerId === marker.id ? null : marker.id)}
                              style={{background: '#555', color: 'white', border: 'none', padding: '3px 8px', cursor: 'pointer', borderRadius: '3px', fontSize: '10px'}}
                            >
                              {disclosedMarkerId === marker.id ? 'Hide' : 'Show'} JSON
                            </button>
                            <button
                              onClick={() => handleRemoveMarker(marker.id)}
                              style={{background: '#F44336', color: 'white', border: 'none', padding: '3px 8px', cursor: 'pointer', borderRadius: '3px', fontSize: '10px', marginLeft: '5px'}}
                              title="Delete this marker"
                            >
                              Delete
                            </button>
                          </div>
                          {disclosedMarkerId === marker.id && (
                            <textarea
                              readOnly
                              value={JSON.stringify(marker, null, 2)}
                              style={{
                                width: '100%',
                                minHeight: '150px',
                                background: '#111',
                                color: '#aeffa1',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                marginTop: '8px',
                                fontSize: '10px',
                                whiteSpace: 'pre',
                                overflowWrap: 'normal',
                                overflowX: 'auto',
                                padding: '5px'
                              }}
                              onFocus={(e) => e.target.select()}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}
    </div>

    
    </div>  
    )
}