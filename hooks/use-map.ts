'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-draw';

interface UseMapOptions {
  mapRef: React.RefObject<HTMLDivElement>;
  pdaScreenRef: React.RefObject<HTMLDivElement>;
  isLeafletLoaded: boolean;
  isMapLoaded: boolean;
  activeTab: string;
  showMenuOverlay: boolean;
}

export function useMap({
  mapRef,
  pdaScreenRef,
  isLeafletLoaded,
  isMapLoaded,
  activeTab,
  showMenuOverlay,
}: UseMapOptions) {
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  useEffect(() => {
    if (!isLeafletLoaded || !isMapLoaded || !mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const imageWidth = 4096;
    const imageHeight = 4096;
    const bounds: [[number, number], [number, number]] = [[0, 0], [imageHeight, imageWidth]];

    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      zoomControl: false,
      attributionControl: false,
      minZoom: -2,
      maxZoom: 2,
      wheelPxPerZoomLevel: 120,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    mapInstanceRef.current = map;
    setIsMapInitialized(true);

    const overlay = L.imageOverlay('/Map.png', bounds);
    overlay.addTo(map);

    const doFit = () => {
      try {
        map.invalidateSize();
        const zoomInFactor = 0.05;
        const newWidth = imageWidth * (1 - zoomInFactor);
        const newHeight = imageHeight * (1 - zoomInFactor);
        const widthMargin = (imageWidth - newWidth) / 2;
        const heightMargin = (imageHeight - newHeight) / 2;
        const newBounds: [[number, number], [number, number]] = [[heightMargin, widthMargin], [imageHeight - heightMargin, imageWidth - widthMargin]];
        map.fitBounds(newBounds, { padding: [0, 0], animate: false });
      } catch (e) {
        try {
          map.setView([imageHeight / 2, imageWidth / 2], -2);
        } catch (err) {
          // ignore
        }
      }
    };

    setTimeout(() => doFit(), 120);
    map.setMaxBounds(bounds);

    const Grid = L.GridLayer.extend({
      createTile: function () {
        const tile = document.createElement('div');
        tile.style.outline = '1px solid rgba(255,255,255,0.12)';
        return tile;
      },
    });
    L.gridLayer.grid = function (opts: any) {
      return new Grid(opts);
    };
    map.addLayer(L.gridLayer.grid());

    map.scrollWheelZoom.enable();

    const onResize = () => {
      try {
        if (map) {
          map.invalidateSize();
          map.fitBounds(bounds, { padding: [0, 0], animate: false });
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('resize', onResize);

    let ro: ResizeObserver | null = null;
    try {
      const RO = (window as any).ResizeObserver || ResizeObserver;
      if (RO && pdaScreenRef.current) {
        let timeout: any = null;
        ro = new RO(() => {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => {
            try {
              doFit();
            } catch (e) {
              // ignore
            }
          }, 80);
        });
        if (ro && pdaScreenRef.current) ro.observe(pdaScreenRef.current as Element);
      }
    } catch (e) {
      // ResizeObserver not available or observe failed; ignore
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && (ro as any).disconnect) {
        try {
          (ro as any).disconnect();
        } catch (e) {
          // ignore
        }
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletLoaded, isMapLoaded, mapRef, pdaScreenRef]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && isMapInitialized) {
      try {
        map.invalidateSize();
        const imageWidth = 4096;
        const imageHeight = 4096;
        const bounds: [[number, number], [number, number]] = [[0, 0], [imageHeight, imageWidth]];
        map.fitBounds(bounds, { padding: [0, 0], animate: false });
      } catch (e) {
        // ignore
      }
    }
  }, [showMenuOverlay, activeTab, isMapInitialized]);

  useEffect(() => {
    if (activeTab === 'map' && isMapInitialized) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          if (mapInstanceRef.current._layers) {
            Object.values(mapInstanceRef.current._layers).forEach((layer: any) => {
              if (layer.redraw) layer.redraw();
            });
          }
        }
      }, 50);
    }
  }, [activeTab, isMapInitialized]);
}