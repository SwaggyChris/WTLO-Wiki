"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import L from "leaflet"
import "leaflet-draw"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import styles from "./map.module.css"

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const redLightRef = useRef<HTMLDivElement>(null)
  const greenLightRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [zoomLevel, setZoomLevel] = useState(-2)
  const [showMapMenu, setShowMapMenu] = useState(false)
  const [currentMap, setCurrentMap] = useState("maps/T_Data_Map_Default.png")
  
  // Available maps from the public/maps folder
  const availableMaps = [
    { name: "Default Map", file: "maps/T_Data_Map_Default.png", displayName: "Default" },
    { name: "Camp", file: "maps/T_Data_Map_Camp.png", displayName: "Camp" },
    { name: "Canyon", file: "maps/T_Data_Map_Canyon.png", displayName: "Canyon" },
    { name: "Career", file: "maps/T_Data_Map_Career.png", displayName: "Foothills" },
    { name: "Coast", file: "maps/T_Data_Map_Coast.png", displayName: "Coast" },
    { name: "Confederation Camp", file: "maps/T_Data_Map_Confederation_Camp.png", displayName: "Confederation Camp" },
    { name: "Dead Forest", file: "maps/T_Data_Map_Dead_Forest.png", displayName: "Dead Forest" },
    { name: "Deadlands", file: "maps/T_Data_Map_Deadlands.png", displayName: "Exclusion Zone" },
    { name: "Minaev Mine", file: "maps/T_Data_Map_Minaev_Mine.png", displayName: "Minaev Mine" },
    { name: "PVP Arena", file: "maps/T_Data_Map_PVP_Arena.png", displayName: "PVP Arena" },
    { name: "Solar City Hangar", file: "maps/T_Data_Map_Solar_City_Hangar.png", displayName: "MTE" },
    { name: "Solar City Town", file: "maps/T_Data_Map_Solar_City_Town.png", displayName: "Solar City Town" },
    { name: "Solar City", file: "maps/T_Data_Map_Solar_City.png", displayName: "Solar City" },
    { name: "Swamp", file: "maps/T_Data_Map_Swamp.png", displayName: "Swamp" },
    { name: "Testing Ground", file: "maps/T_Data_Map_Testing_Ground.png", displayName: "Testing Ground" },
    { name: "PvP Arena MTE", file: "maps/T_Data_PvP_Arena_MTE.png", displayName: "PvP Arena MTE" }
  ]

  useEffect(() => {
    if (mapRef.current && typeof window !== "undefined" && !mapInstanceRef.current) {
      // 1. Initialize the map
      const map = L.map(mapRef.current, {
        crs: L.CRS.Simple,
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

      L.imageOverlay(`/${currentMap}`, bounds).addTo(map)

      // 3. Set initial view and fix boundaries
      map.setView([2048, 2048], -2)
      map.setMaxBounds(bounds)

      // 4. Grid overlay
      const GridLayer = L.GridLayer.extend({
        createTile: function (coords: L.Coords) {
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
      // Clear existing layers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.ImageOverlay) {
          mapInstanceRef.current?.removeLayer(layer)
        }
      })
      
      // Add new map
      const imageWidth = 4096
      const imageHeight = 4096
      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [imageHeight, imageWidth],
      ]
      
      L.imageOverlay(`/${mapFile}`, bounds).addTo(mapInstanceRef.current)
      setCurrentMap(mapFile)
      setShowMapMenu(false)
    }
  }

  const toggleMapMenu = () => {
    setShowMapMenu(!showMapMenu)
  }

  return (
    <div className={styles.centerPage}>
      {/* Back to Main Page Link */}
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to Main Page</span>
      </Link>
      
      <div className={styles.pdaContainer}>
        <Image
          src="/PDA.png"
          alt="PDA Frame"
          width={1200}
          height={750}
          className={styles.pdaFrame}
          priority
        />
        <div
          ref={redLightRef}
          className={`${styles.pdaLight} ${styles.pdaLightRed}`}
        ></div>
        <div
          ref={greenLightRef}
          className={`${styles.pdaLight} ${styles.pdaLightGreen}`}
        ></div>

        <div className={styles.pdaScreen}>
          <div ref={mapRef} className={styles.map}></div>
          
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

          <div className={styles.uiContainer}></div>
        </div>
      </div>
    </div>
  )
}