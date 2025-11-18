"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import styles from "@/app/map/map.module.css"

interface MapProps {
  currentMap: string
  setZoomLevel: (zoom: number) => void
  mapInstanceRef: React.MutableRefObject<L.Map | null>
}

function Map({ currentMap, setZoomLevel, mapInstanceRef }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null)

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        crs: L.CRS.Simple,
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

      imageOverlayRef.current = L.imageOverlay("/", bounds).addTo(map) // Start with empty URL

      map.setView([2048, 2048], -2)
      map.setMaxBounds(bounds)

      map.on('zoom', () => {
        if (mapInstanceRef.current) {
            setZoomLevel(mapInstanceRef.current.getZoom())
        }
      })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [mapInstanceRef, setZoomLevel])

  useEffect(() => {
    if (imageOverlayRef.current) {
      imageOverlayRef.current.setUrl(`/${currentMap}`)
    }
  }, [currentMap])

  return <div ref={mapRef} className={styles.map}></div>
}

export default Map
