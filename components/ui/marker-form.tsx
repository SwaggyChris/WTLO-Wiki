"use client"

import { useState } from "react"
import styles from "./marker-form.module.css"

interface MarkerFormProps {
  onAddMarker: (marker: { name: string; description: string }) => void
  onClose: () => void
}

export default function MarkerForm({ onAddMarker, onClose }: MarkerFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    onAddMarker({ name, description })
    setName("")
    setDescription("")
    onClose()
  }

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <h2>Add New Marker</h2>
          <div className={styles.formGroup}>
            <label htmlFor="name">Marker Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              Save Marker
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
