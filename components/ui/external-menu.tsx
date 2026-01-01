"use client"

import React from "react"
import styles from "./external-menu.module.css"

interface ExternalMenuProps {
  availableSkins: { name: string; file: string }[]
  currentSkin: string
  onSkinChange: (skinFile: string) => void
}

export function ExternalMenu({
  availableSkins,
  currentSkin,
  onSkinChange,
}: ExternalMenuProps) {
  return (
    <div className={styles.externalMenu}>
      <div className={styles.menuSection}>
        <h3>PDA Skin</h3>
        <select
          title="Select a PDA skin"
          value={currentSkin}
          onChange={(e) => onSkinChange(e.target.value)}
          className={styles.select}
        >
          {availableSkins.map((skin) => (
            <option key={skin.file} value={skin.file}>
              {skin.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}