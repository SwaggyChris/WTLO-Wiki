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

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const redLightRef = useRef<HTMLDivElement>(null)
  const greenLightRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const [zoomLevel, setZoomLevel] = useState(-2)
  const [showMapMenu, setShowMapMenu] = useState(false)
  const [showLegendMenu, setShowLegendMenu] = useState(false)
  const [showWtlomenu, setShowWtlomenu] = useState(false)
  const [currentMap, setCurrentMap] = useState("maps/T_Data_Map_Default.png")
  const [pdaSkin, setPdaSkin] = useState<string>('/PDA.png')
  const [pdaOn, setPdaOn] = useState<boolean>(true)
  const [pdaNatural, setPdaNatural] = useState<{w:number,h:number}|null>(null)
  const [btnPressed, setBtnPressed] = useState(false)
  const [skinDropdownOpen, setSkinDropdownOpen] = useState(true)
  
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

  // Updated Legend categories state structure with nested sub-items
  const [legendCategories, setLegendCategories] = useState<Record<string, {
    checked: boolean;
    expanded?: boolean;
    subItems: Record<string, boolean>;
  }>>({
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
    // Keep existing categories as flat items
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
  })

  // Available maps from the public/maps folder - REORDERED AND RENAMED
  const availableMaps = [
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
  ]

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
  const updateMarkers = async () => {
    if (!mapInstanceRef.current || !leafletRef) return
    
    // Clear existing markers
    markers.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker)
    })
    
    // Check if we should show Small Rats marker
    const isSmallRatsChecked = legendCategories.Monsters?.subItems['Small Rats']
    const isSolenchyTown = currentMap === "maps/T_Data_Map_Solar_City_Town.png"
    
    if (isSmallRatsChecked && isSolenchyTown) {
      // Grid C2-6 position for Solenchy Town map
      // Since the map is 4096x4096, we need to calculate coordinates
      // Assuming grid system: A-H for rows (8 rows), 1-8 for columns (8 columns)
      const gridToCoordinates = (grid: string) => {
        // Convert grid like "C2-6" to coordinates
        const rowLetter = grid.charAt(0) // 'C'
        const columnRange = grid.substring(1) // '2-6'
        
        // Row calculation: A=0, B=512, C=1024, etc.
        const rowIndex = rowLetter.charCodeAt(0) - 65 // A=0, B=1, C=2
        const rowY = rowIndex * 1312 + 456 // 512 pixels per grid row, +256 for center
        
        // Column calculation: For range C2-6, we'll place in the middle of columns 2-6
        const [startCol, endCol] = columnRange.split('-').map(Number)
        const middleCol = (startCol + endCol) / 2
        const colX = (middleCol - 1) * 612 + 256 // 512 pixels per grid column, +256 for center
        
        return { x: colX, y: rowY }
      }
      
      const coords = gridToCoordinates('C2-6')
      
      // Create custom marker icon
      const customIcon = leafletRef.icon({
        iconUrl: '/markers/Monster.png',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
      })
      
      // Add marker to map
      const marker = leafletRef.marker([coords.y, coords.x], { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<strong>Small Rats Spawn</strong><br>Grid: C2-6<br><em>Common spawn area</em>')
        .openPopup()
      
      setMarkers([marker])
    } else {
      setMarkers([])
    }
  }

  // Update markers when conditions change
  useEffect(() => {
    updateMarkers()
  }, [currentMap, legendCategories.Monsters?.subItems['Small Rats']])

  useEffect(() => {
    if (mapRef.current && typeof window !== "undefined" && !mapInstanceRef.current) {
      // Dynamically import Leaflet on the client only to avoid server-side window usage
      ;(async () => {
        const LeafletModule = await import("leaflet")
        const Leaflet: any = (LeafletModule as any).default ?? LeafletModule
        setLeafletRef(Leaflet) // Store Leaflet reference

        // Dynamically load leaflet-draw on the client only (it references window)
        try {
          await import("leaflet-draw")
        } catch (e) {
          // ignore if import fails in some environments
          // console.warn("leaflet-draw load failed", e)
        }

        // 1. Initialize the map
        const map = Leaflet.map(mapRef.current, {
          crs: Leaflet.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
        minZoom: -2,
        maxZoom: 2,
        wheelPxPerZoomLevel: 120,
        maxBoundsViscosity: 1.0, // Prevent dragging out of bounds
        })
        mapInstanceRef.current = map

      // 2. Define image bounds and add overlay
      const imageWidth = 4096
      const imageHeight = 4096
      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [imageHeight, imageWidth],
      ]

  Leaflet.imageOverlay(`/${currentMap}`, bounds).addTo(map)

      // 3. Set initial view and fix boundaries
      map.setView([2048, 2048], -2)
      map.setMaxBounds(bounds)

      // 4. Grid overlay
        const GridLayer = Leaflet.GridLayer.extend({
        createTile: function (coords: any) {
          const tile = document.createElement("div")
          tile.style.outline = "1px solid rgba(255, 255, 255, 0.2)"
          return tile
        },
      })
        new GridLayer().addTo(map)

      // 5. Update zoom level state when map zoom changes
        map.on('zoom', () => {
        setZoomLevel(map.getZoom())
      })

      // 6. Realistic blinking lights logic
      if (redLightRef.current && greenLightRef.current) {
        // Initial state
        redLightRef.current.style.opacity = "0.1"
        greenLightRef.current.style.opacity = "0.8"

        let redLightInterval: NodeJS.Timeout;
        let greenLightInterval: NodeJS.Timeout;

        // Red light: urgent triple blink with realistic timing
        const startRedBlink = () => {
          let step = 0;
          const blinkSequence = [
            { opacity: 1, duration: 80 },   // Quick on
            { opacity: 0.1, duration: 60 }, // Quick off
            { opacity: 1, duration: 80 },   // Quick on
            { opacity: 0.1, duration: 60 }, // Quick off
            { opacity: 1, duration: 100 },  // Slightly longer on
            { opacity: 0.1, duration: 80 }, // Slightly longer off
            { opacity: 0.1, duration: 800 } // Pause
          ];

          const executeStep = () => {
            if (step < blinkSequence.length && redLightRef.current) {
              const { opacity, duration } = blinkSequence[step];
              redLightRef.current.style.opacity = opacity.toString();
              
              step++;
              redLightInterval = setTimeout(executeStep, duration);
            } else {
              // Restart the sequence
              step = 0;
              redLightInterval = setTimeout(executeStep, 100);
            }
          };

          executeStep();
        };

        // Green light: calm, organic breathing pattern
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
                  // Randomize the peak hold time slightly
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
                  // Randomize the bottom hold time slightly
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

        // Start both light patterns with slight offset
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
    // Close legend menu if open
    if (showLegendMenu) setShowLegendMenu(false)
  }

  const toggleLegendMenu = () => {
    setShowLegendMenu(!showLegendMenu)
    // Close map menu if open
    if (showMapMenu) setShowMapMenu(false)
  }

  const toggleCategory = (categoryName: string) => {
    setLegendCategories(prev => {
      const newState = { ...prev }
      const newChecked = !newState[categoryName].checked
      
      // Toggle the main category
      newState[categoryName] = {
        ...newState[categoryName],
        checked: newChecked
      }
      
      // If there are subitems, toggle them all
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
      
      // Toggle the subitem
      newState[categoryName] = {
        ...newState[categoryName],
        subItems: {
          ...newState[categoryName].subItems,
          [subItemName]: !newState[categoryName].subItems[subItemName]
        }
      }
      
      // Check if all subitems are checked to update the main category
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
      {/* Page Title at the very top, above PDA screen */}
      <div className={styles.mapTitleWrapper}>
        <h1 className={styles.mapTitle}>Interactive Map</h1>
      </div>

      {/* Back to Main Page Link */}
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
              // Next.js Image onLoadingComplete passes HTMLImageElement when not using loader
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
          <div ref={mapRef} className={styles.map} aria-hidden={!pdaOn}></div>
          
          {/* Zoom Slider Container */}
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

          {/* Map Switch Button Container */}
          <div className={styles.mapSwitchContainer}>
            <button
              onClick={toggleMapMenu}
              className={styles.mapSwitchButton}
            >
              MAP
            </button>
            
            {/* Map Selection Menu */}
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

          {/* Legend Marks Button Container */}
          <div className={styles.legendContainer}>
            <button
              onClick={toggleLegendMenu}
              className={styles.legendButton}
            >
              LEGEND
            </button>
            
            {/* Legend Marks Menu */}
            {showLegendMenu && (
              <div className={styles.legendMenu}>
                <div className={styles.legendMenuHeader}>
                  <h3>Legend Marks</h3>
                </div>
                <ul className={styles.legendMenuList}>
                  {Object.entries(legendCategories).map(([categoryName, categoryData]) => (
                    <li key={categoryName} className={styles.legendCategoryItem}>
                      {/* Category row */}
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
                      
                      {/* Sub-items list */}
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
          {/* Screen off overlay when PDA is powered down */}
          {!pdaOn && (
            <div className={styles.pdaScreenOff} role="status" aria-live="polite">
              <div className={styles.pdaScreenOffInner}>
                <div className={styles.pdaPowerIcon}>⏻</div>
                <div className={styles.pdaOffText}>PDA Powered Off</div>
              </div>
            </div>
          )}
        </div>
        {/* Overlay button inside PDA frame mapped to coordinates; toggles PDA on/off */}
        {/* Coordinates provided by user (pixels): x1=1790,y1=343,width=39,height=46 */}
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

    {/* Enhanced WTLO Menu with drag functionality - NOW DRAGGABLE BY HEADER */}
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
                    {/* Default Skin */}
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
                    
                    {/* Black Sunset Skin */}
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
                    
                    {/* Confederation Skin */}
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
          </div>
        </div>
      )}
    </div>
    </div>
  )
}