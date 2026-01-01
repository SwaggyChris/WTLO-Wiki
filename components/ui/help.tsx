"use client"

import styles from "./help.module.css"

interface HelpProps {
  onClose: () => void;
}

export default function Help({ onClose }: HelpProps) {
  return (
    <div className={styles.helpOverlay}>
      <div className={styles.helpContainer}>
        <h2>Help</h2>
        <div className={styles.helpContent}>
          <h3>Available Functionalities:</h3>
          <ul>
            <li><b>Add Marker:</b> Click on the map to open the marker form and add a new marker.</li>
            <li><b>Clear Markers:</b> Click the "Clear Markers" button in the "Utilities" menu to remove all markers from the map.</li>
            <li><b>Save Markers:</b> Click the "Save Markers" button in the "Utilities" menu to download a JSON file with the current markers.</li>
            <li><b>Load Markers:</b> Click the "Load Markers" button in the "Utilities" menu to load markers from a JSON file.</li>
            <li><b>Export as PNG:</b> Click the "Export as PNG" button in the "Utilities" menu to download the current map view as a PNG image.</li>
            <li><b>Search Locations:</b> Use the search bar in the "Locations List" menu to filter the available maps.</li>
            <li><b>Toggle Menu:</b> Click the "Hide Menu" / "Show Menu" button to toggle the visibility of the main menu.</li>
            <li><b>Settings:</b> Click the "Settings" button to open the settings menu and customize the map's appearance.</li>
          </ul>
        </div>
        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  )
}
