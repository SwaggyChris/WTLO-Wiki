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
import { updateMarkers } from "./markers"

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
  const updateMarkersHandler = async () => {
    if (!mapInstanceRef.current || !leafletRef) return
    
    // Clear existing markers
    markers.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker)
    });
    
    // Use the imported updateMarkers function
    await updateMarkers(
      mapInstanceRef.current,
      leafletRef,
      currentMap,
      legendCategories,
      setMarkers
    );
  }

  // Update markers when conditions change
  useEffect(() => {
    updateMarkersHandler()
  }, [currentMap, legendCategories.Monsters?.subItems['Small Rats']])

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

      // [Rest of the lights logic remains the same...]
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

  // [Rest of the component JSX remains exactly the same...]
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
          <div ref={mapRef} className={styles.map} aria-hidden={!pdaOn}></div>
          
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
              Map Legend
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
          </div>
        </div>
      )}
    </div>
    </div>
  )
}