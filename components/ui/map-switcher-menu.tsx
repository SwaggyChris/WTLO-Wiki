"use client"

import React, { useState } from "react"
import styles from "./map-switcher-menu.module.css"

interface MapSwitcherMenuProps {
  availableMaps: { name: string; file: string; displayName: string }[]
  currentMap: string
  onMapChange: (mapFile: string) => void
}

export function MapSwitcherMenu({
  availableMaps,
  currentMap,
  onMapChange,
}: MapSwitcherMenuProps) {
  const [menuScale, setMenuScale] = useState(1)

  const handleScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(event.target.value)
    setMenuScale(newScale)
  }

  return (
    <div className={styles.mapSwitcherContainer}>
      {/* Scale Slider */}
      <div className={styles.scaleSliderContainer}>
        <label htmlFor="menu-scale">Scale</label>
        <input
          id="menu-scale"
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={menuScale}
          onChange={handleScaleChange}
          className={styles.scaleSlider}
          title="Adjust menu size"
        />
        <span className={styles.scaleValue}>{(menuScale * 100).toFixed(0)}%</span>
      </div>

      {/* Map Switcher Menu */}
      <div
        className={styles.mapMenu}
        style={{ transform: `scale(${menuScale})` }}
      >
        <h3 className={styles.menuTitle}>Select Map</h3>
        <div className={styles.mapList}>
          {availableMaps.map((map) => (
            <button
              key={map.file}
              className={`${styles.mapItem} ${
                currentMap === map.file ? styles.active : ""
              }`}
              onClick={() => onMapChange(map.file)}
              title={map.name}
            >
              {map.displayName}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
