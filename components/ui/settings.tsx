"use client"

import { useState } from "react"
import styles from "./settings.module.css"

interface SettingsProps {
  onClose: () => void;
  gridColor: string;
  setGridColor: (color: string) => void;
  markerColor: string;
  setMarkerColor: (color: string) => void;
}

export default function Settings({ onClose, gridColor, setGridColor, markerColor, setMarkerColor }: SettingsProps) {
  return (
    <div className={styles.settingsOverlay}>
      <div className={styles.settingsContainer}>
        <h2>Settings</h2>
        <div className={styles.setting}>
          <label htmlFor="gridColor">Grid Color</label>
          <input
            type="color"
            id="gridColor"
            value={gridColor}
            onChange={(e) => setGridColor(e.target.value)}
          />
        </div>
        <div className={styles.setting}>
          <label htmlFor="markerColor">Marker Color</label>
          <input
            type="color"
            id="markerColor"
            value={markerColor}
            onChange={(e) => setMarkerColor(e.target.value)}
          />
        </div>
        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  )
}
