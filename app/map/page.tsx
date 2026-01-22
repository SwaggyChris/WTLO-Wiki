"use client"

// Prevent Next.js from statically prerendering this page so client-only
// code (which references window) won't run on the server during build.
export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Upload, X, Image as ImageIcon, Hash, Trash2, Save, XCircle, Download, Eye, EyeOff } from "lucide-react"
// Leaflet is dynamically imported on the client. Avoid importing at top-level to prevent server-side window access.
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import styles from "./map.module.css"

// Import separated data and functions
import { availableMaps, initialLegendCategories } from "./mapData"
import { updateMarkers, coordinatesToGrid, getIconForCategory } from "./markers" //

// Use actual files present in public/markers
const markerIcons = [
  "Ammo.png",
  "Artifact.png",
  "Clothes.png",
  "Crafting Materials.png",
  "Crafting Tool.png",
  "Danger.png",
  "Food.png",
  "Forest.png",
  "Fuel.png",
  "Important Marker.png",
  "Key.png",
  "Marked Location.png",
  "Medicine.png",
  "Miscellaneous.png",
  "Monster.png",
  "NDP Teleport.png",
  "NPC.png",
  "NPCDoctor.png",
  "NPCGunsmith.png",
  "NPCStockman.png",
  "NPCTrader.png",
  "Portal.png",
  "PVP Zone.png",
  "Quest.png",
  "QuestPoint.png",
  "Radiation.png",
  "Safezone.png",
  "Simple Marker.png",
  "Tools.png",
  "Unknown Area.png",
  "Water.png",
  "WaterSource.png",
  "Weapons.png"
];

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const redLightRef = useRef<HTMLDivElement>(null)
  const greenLightRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const [zoomLevel, setZoomLevel] = useState(-2)
  const [showMapMenu, setShowMapMenu] = useState(false)
  const [showLegendMenu, setShowLegendMenu] = useState(false)
  const [showWtlomenu, setShowWtlomenu] = useState(false)
  const [currentMap, setCurrentMap] = useState("maps/T_Data_Map_Solar_City_Town.png")
  const [pdaSkin, setPdaSkin] = useState<string>('/PDA.png')
  const [pdaOn, setPdaOn] = useState<boolean>(true)
  const [pdaNatural, setPdaNatural] = useState<{w:number,h:number}|null>(null)
  const [btnPressed, setBtnPressed] = useState(false)
  const [skinDropdownOpen, setSkinDropdownOpen] = useState(true)
  const [disclosedMarkerId, setDisclosedMarkerId] = useState<string | null>(null)
  
  // Drag functionality states for WTLO Menu
  const [wtloMenuPosition, setWtloMenuPosition] = useState({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Drag functionality states for External Map Menu (WTLO Menu)
  const [externalMenuPosition, setExternalMenuPosition] = useState({ x: 20, y: 100 })
  const [isExternalDragging, setIsExternalDragging] = useState(false)
  const [externalDragStart, setExternalDragStart] = useState({ x: 0, y: 0 })

  // MARKER EDITOR STANDALONE STATES
  const [showMarkerEditor, setShowMarkerEditor] = useState(true)
  const [markerEditorPosition, setMarkerEditorPosition] = useState({ x: 20, y: 120 })
  const [isMarkerEditorDragging, setIsMarkerEditorDragging] = useState(false)
  const [markerEditorDragStart, setMarkerEditorDragStart] = useState({ x: 0, y: 0 })

  // Marker system states
  const [markers, setMarkers] = useState<any[]>([])
  const [leafletRef, setLeafletRef] = useState<any>(null)

  // Custom markers from editor
  const [customMarkers, setCustomMarkers] = useState<any[]>([])

  // Custom icon state
  const [customIconImage, setCustomIconImage] = useState<string | null>(null)

  // --- MARKER EDITOR STATE ---
  const [editorMode, setEditorMode] = useState(false)
  const [pendingMarker, setPendingMarker] = useState<any | null>(null)
  const [editorForm, setEditorForm] = useState<any>({
    id: '',
    grid: '',
    customField: '',
    category: '',
    subCategory: '',
    iconSlots: [] as any[],
    title: '',
    description: '',
    hashtags: '',
    descriptionImage: null as string | null
  })
  
  // ---------------------------
  // Updated Legend categories state structure with nested sub-items
  const [legendCategories, setLegendCategories] = useState<Record<string, {
    checked: boolean;
    expanded?: boolean;
    subItems: Record<string, boolean>;
  }>>(initialLegendCategories)

  // Function to handle custom icon upload
  const handleCustomIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCustomIconImage(dataUrl);
      
      // Set the custom icon as the main icon in the form
      if (editorForm.iconSlots.length === 0) {
        setEditorForm((prev: any) => ({
          ...prev,
          iconSlots: [{ icon: dataUrl }]
        }));
      } else {
        setEditorForm((prev: any) => ({
          ...prev,
          iconSlots: prev.iconSlots.map((s: any, idx: number) => 
            idx === 0 ? { ...s, icon: dataUrl } : s
          )
        }));
      }
    };
    
    reader.readAsDataURL(file);
  };

  // Function to remove custom icon
  const removeCustomIcon = () => {
    setCustomIconImage(null);
    // Reset to default icon
    if (editorForm.iconSlots.length > 0) {
      setEditorForm((prev: any) => ({
        ...prev,
        iconSlots: prev.iconSlots.map((s: any, idx: number) => 
          idx === 0 ? { ...s, icon: '/markers/Simple Marker.png' } : s
        )
      }));
    }
  };

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

  // Drag functionality for Standalone Marker Editor
  const handleMarkerEditorMouseDown = (e: React.MouseEvent) => {
    setIsMarkerEditorDragging(true)
    setMarkerEditorDragStart({
      x: e.clientX - markerEditorPosition.x,
      y: e.clientY - markerEditorPosition.y
    })
  }

  const handleMarkerEditorMouseMove = (e: React.MouseEvent) => {
    if (!isMarkerEditorDragging) return
    setMarkerEditorPosition({
      x: e.clientX - markerEditorDragStart.x,
      y: e.clientY - markerEditorDragStart.y
    })
  }

  const handleMarkerEditorMouseUp = () => {
    setIsMarkerEditorDragging(false)
  }

  // Function to handle description image upload
  const handleDescriptionImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setEditorForm((prev: any) => ({
        ...prev,
        descriptionImage: dataUrl
      }))
    }
    
    reader.readAsDataURL(file)
  }

  // Function to remove description image
  const removeDescriptionImage = () => {
    setEditorForm((prev: any) => ({
      ...prev,
      descriptionImage: null
    }))
  }

  // Function to insert image into description at cursor position
  const insertImageIntoDescription = (imageUrl: string) => {
    const textareaId = 'description-textarea'
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement
    
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value
    
    // Create image HTML
    const imageHtml = `\n<img src="${imageUrl}" alt="Custom Image" style="max-width: 300px; max-height: 200px; border-radius: 4px; margin: 10px 0;" />\n`
    
    const newValue = value.substring(0, start) + imageHtml + value.substring(end)
    
    // Update textarea value
    textarea.value = newValue
    
    // Update form state
    setEditorForm((prev: any) => ({
      ...prev,
      description: newValue
    }))
    
    // Focus and set cursor position after inserted image
    textarea.focus()
    textarea.selectionStart = textarea.selectionEnd = start + imageHtml.length
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

  // Add event listeners for marker editor dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMarkerEditorDragging) return
      setMarkerEditorPosition({
        x: e.clientX - markerEditorDragStart.x,
        y: e.clientY - markerEditorDragStart.y
      })
    }

    const handleMouseUp = () => {
      setIsMarkerEditorDragging(false)
    }

    if (isMarkerEditorDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isMarkerEditorDragging, markerEditorDragStart])

  // Function to update markers based on legend and map state
  const updateMarkersHandler = async (customMarkersData: any[] = []) => {
    if (!mapInstanceRef.current || !leafletRef) return
    
    // Clear existing markers from the map
    markers.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker)
    });
    
    // Get new markers from the imported function
    const newMarkers = await updateMarkers(
      mapInstanceRef.current,
      leafletRef,
      currentMap,
      legendCategories
    );
    
    // Add custom markers if any
    customMarkersData.forEach((markerInfo: any) => {
      const { map, category, subCategory, grid, coordinates, iconSlots, icon, popup } = markerInfo;

      if (map === currentMap) {
        const isVisible = legendCategories[category]?.subItems[subCategory] || editorMode; 
        
        if (isVisible) {
          let coords;
          if (coordinates) {
            coords = coordinates;
          } else if (grid) {
            coords = coordinates;
          } else {
            return; 
          }
          
          const chosenIconUrl = (iconSlots && iconSlots.length && iconSlots[0]) ? (typeof iconSlots[0] === 'string' ? iconSlots[0] : iconSlots[0].icon) : icon;
          const customIcon = leafletRef.icon({
            iconUrl: chosenIconUrl,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
          });

          const marker = leafletRef.marker([coords.y, coords.x], { icon: customIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(popup);
          
          newMarkers.push(marker);
        }
      }
    });

    setMarkers(newMarkers);
  }

  // Update markers when conditions change
  useEffect(() => {
    updateMarkersHandler(customMarkers)
  }, [currentMap, legendCategories, customMarkers, editorMode])

  // Handle custom markers from editor
  const handleSaveCustomMarkers = (newMarkers: any[]) => {
    setCustomMarkers(newMarkers);
    updateMarkersHandler(newMarkers);
  };

  // --- MAP CLICK LISTENER FOR EDITOR ---
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef) return;

    const map = mapInstanceRef.current;

    const onMapClick = (e: any) => {
      if (!editorMode) return;

      const { lat, lng } = e.latlng;
      
      // Calculate Grid
      const gridId = coordinatesToGrid(lng, lat);
      
      // Create a temporary visual marker
      const tempId = `marker_${Date.now()}`;
      const newMarker = {
        id: tempId,
        map: currentMap,
        coordinates: { x: Math.round(lng), y: Math.round(lat) },
        grid: gridId,
        // Default values until form is submitted
        category: '',
        subCategory: '',
        description: '',
        popup: '<strong>New Marker</strong>',
        icon: '/markers/Simple Marker.png'
      };

      setPendingMarker(newMarker);
      
      // Reset form with auto-filled ID and Grid
      setEditorForm({
        id: tempId,
        grid: gridId,
        customField: '',
        category: '',
        subCategory: '',
        iconSlots: [],
        title: '',
        description: '',
        hashtags: '',
        descriptionImage: null
      });
      
      // Clear custom icon
      setCustomIconImage(null);
    };

    if (editorMode) {
      map.on('click', onMapClick);
      document.getElementById('map-container-div')?.style.setProperty('cursor', 'crosshair');
    } else {
      map.off('click', onMapClick);
      document.getElementById('map-container-div')?.style.setProperty('cursor', 'default');
      setPendingMarker(null);
      setCustomIconImage(null);
    }

    return () => {
      map.off('click', onMapClick);
    };
  }, [editorMode, currentMap, leafletRef, legendCategories]);

  // --- SAVE MARKER FUNCTION ---
  const handleSaveMarker = () => {
    if (!pendingMarker) return;

    // Create main icon slot with form data
    const mainIconSlot = {
      icon: editorForm.iconSlots[0]?.icon || '/markers/Simple Marker.png',
      title: editorForm.title,
      description: editorForm.description,
      subCategory: editorForm.subCategory,
      hashtags: editorForm.hashtags,
      descriptionImage: editorForm.descriptionImage
    };

    const iconSlots = [mainIconSlot, ...(editorForm.iconSlots.slice(1) || [])];
    const hashtagsArr = editorForm.hashtags ? editorForm.hashtags.split(',').map((s:string)=>s.trim()).filter(Boolean) : [];

    // Build popup HTML
    const popupId = `marker-popup-${editorForm.id}`;
    
    // Secondary icons
    const iconsHtml = iconSlots.slice(1).map((s: any, idx: number) => {
      const safeTitle = (s.description || '').replace(/"/g, '&quot;');
      const onclick = `(function(){const root=document.getElementById('${popupId}'); if(!root) return; Array.from(root.querySelectorAll('.slot-content')).forEach(function(el){ el.style.display='none'; }); var target=root.querySelector('#${popupId}-slot-${idx+1}'); if(target) target.style.display='block';})()`;
      return `<img src="${s.icon}" title="${safeTitle}" style="width:22px;height:22px;margin:2px;cursor:pointer;border:1px solid #444;border-radius:3px" onclick="${onclick}" />`;
    }).join('');

    // Slot content
    const slotsContentHtml = iconSlots.map((s: any, idx: number) => {
      const hashtagsForSlot = (s.hashtags || '') ? s.hashtags.split(',').map((h:string)=>h.trim()).filter(Boolean).map((h:string)=>`<span style="margin-right:6px;color:#9ad">${h}</span>`).join('') : '';
      const title = s.title || s.subCategory || '';
      const desc = s.description || '';
      const display = idx === 0 ? 'block' : 'none';
      const imageHtml = s.descriptionImage ? `<div style="margin: 10px 0;"><img src="${s.descriptionImage}" alt="Description" style="max-width: 100%; border-radius: 4px;" /></div>` : '';
      return `<div id="${popupId}-slot-${idx}" class="slot-content" style="display:${display};margin-top:6px;text-align:left"><div style="font-weight:bold">${title}</div><div style="margin-top:4px">${desc}</div>${imageHtml}<div style="margin-top:6px">${hashtagsForSlot}</div></div>`;
    }).join('');

    const popupHtml = `<div id="${popupId}">${iconsHtml}${slotsContentHtml}</div>`;

    const finalMarker = {
      ...pendingMarker,
      id: editorForm.id,
      grid: editorForm.grid,
      customField: editorForm.customField,
      category: editorForm.category,
      subCategory: editorForm.subCategory,
      title: editorForm.title,
      description: editorForm.description,
      iconSlots,
      hashtags: hashtagsArr,
      descriptionImage: editorForm.descriptionImage,
      popup: popupHtml,
      customColor: "#ffffff",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedList = [...customMarkers, finalMarker];
    handleSaveCustomMarkers(updatedList);
    
    setPendingMarker(null);
    setEditorForm({
      id: '',
      grid: '',
      customField: '',
      category: '',
      subCategory: '',
      iconSlots: [],
      title: '',
      description: '',
      hashtags: '',
      descriptionImage: null
    });
    setCustomIconImage(null);
  };

  // --- REMOVE MARKER FUNCTION ---
  const handleRemoveMarker = (markerId: string) => {
    const updatedList = customMarkers.filter(marker => marker.id !== markerId);
    handleSaveCustomMarkers(updatedList);
  };

  // --- REMOVE PENDING MARKER FUNCTION ---
  const handleRemovePendingMarker = () => {
    setPendingMarker(null);
    setEditorForm({
      id: '',
      grid: '',
      customField: '',
      category: '',
      subCategory: '',
      iconSlots: [],
      title: '',
      description: '',
      hashtags: '',
      descriptionImage: null
    });
    setCustomIconImage(null);
  };

  // --- EXPORT JSON FUNCTION ---
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customMarkers, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "markers_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

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

      // [Rest of the lights logic...]
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
          {/* UPDATED: Added ID for cursor manipulation */}
          <div ref={mapRef} id="map-container-div" className={styles.map} aria-hidden={!pdaOn}></div>
          
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
             Legend
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
          
          {/* MARKER EDITOR TOGGLE BUTTON - MOVED TO RIGHT SIDE OF PDA SCREEN */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10005
          }}>
            <button
              onClick={() => setShowMarkerEditor(!showMarkerEditor)}
              style={{
                width: '40px',
                height: '40px',
                background: showMarkerEditor ? 'linear-gradient(145deg, #4CAF50, #2E7D32)' : 'linear-gradient(145deg, #4a4a4a, #2a2a2a)',
                border: '2px solid #666',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)';
              }}
            >
              {showMarkerEditor ? '✕' : 'Edit'}
            </button>
          </div>

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
            
            {/* EXISTING SKIN CHANGER */}
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

    {/* STANDALONE MARKER EDITOR - DRAGGABLE VERSION */}
    {showMarkerEditor && (
      <div 
        className={styles.markEditorContainer}
        style={{
          position: 'fixed',
          left: `${markerEditorPosition.x}px`,
          top: `${markerEditorPosition.y}px`,
          cursor: isMarkerEditorDragging ? 'grabbing' : 'default',
          zIndex: 10010,
          minWidth: '320px',
          maxWidth: '340px',
          maxHeight: '85vh',
          overflow: 'hidden',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
        }}
      >
        <div 
          style={{ 
            cursor: 'default',
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#f1f1f1',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
          }}
        >
          {/* HEADER - DRAGGABLE AREA */}
          <div 
            className={styles.wtloMenuHeader}
            onMouseDown={handleMarkerEditorMouseDown}
            style={{ 
              cursor: isMarkerEditorDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              padding: '12px 16px',
              borderBottom: '1px solid #333',
              background: 'linear-gradient(180deg, #2d2d2d 0%, #1f1f1f 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                background: '#4CAF50', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>0.2</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>Marker Editor</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setEditorMode(!editorMode)}
                style={{
                  background: editorMode ? '#4CAF50' : '#333',
                  color: 'white',
                  border: '1px solid #555',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                {editorMode ? 'EDIT ON' : 'EDIT OFF'}
              </button>
              <div style={{ fontSize: '9px', color: '#999', background: 'rgba(0, 0, 0, 0.3)', padding: '2px 6px', borderRadius: '3px', border: '1px solid #444' }}>
                ↕ Drag
              </div>
            </div>
          </div>
          
          {/* CONTENT */}
          <div style={{ 
            padding: '16px', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            overflowY: 'auto',
            maxHeight: 'calc(85vh - 60px)'
          }}>
            
            {editorMode && (
              <div style={{ 
                background: 'rgba(255,255,255,0.05)', 
                padding: '8px', 
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '11px',
                color: '#aaa',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}>
                Click on the map to place a marker
              </div>
            )}

            {/* FORM - Only show when there's a pending marker */}
            {editorMode && pendingMarker && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* ID and Grid Row */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px', display: 'block' }}>ID:</label>
                    <input
                      type="text"
                      value={editorForm.id}
                      onChange={(e) => setEditorForm({...editorForm, id: e.target.value})}
                      style={{
                        background: '#222',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '6px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        width: '100%'
                      }}
                      placeholder="Marker ID"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px', display: 'block' }}>Grid:</label>
                    <input
                      type="text"
                      value={editorForm.grid}
                      onChange={(e) => setEditorForm({...editorForm, grid: e.target.value})}
                      style={{
                        background: '#222',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '6px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        width: '100%'
                      }}
                      placeholder="Grid location"
                    />
                  </div>
                </div>

                {/* Custom Field */}
                <div>
                  <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px', display: 'block' }}>
                    Custom field: <span style={{ color: '#888', fontSize: '10px' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editorForm.customField}
                    onChange={(e) => setEditorForm({...editorForm, customField: e.target.value})}
                    style={{
                      background: '#222',
                      color: '#fff',
                      border: '1px solid #444',
                      padding: '6px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      width: '100%'
                    }}
                    placeholder="Enter custom field"
                  />
                </div>

                {/* Category and SubCategory */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px', display: 'block' }}>Category:</label>
                    <select 
                      value={editorForm.category}
                      onChange={(e) => setEditorForm({...editorForm, category: e.target.value, subCategory: ''})}
                      style={{
                        background: '#222',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '6px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Select Category</option>
                      {Object.keys(legendCategories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px', display: 'block' }}>Sub Category:</label>
                    <select 
                      value={editorForm.subCategory}
                      onChange={(e) => setEditorForm({...editorForm, subCategory: e.target.value})}
                      style={{
                        background: '#222',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '6px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                      disabled={!editorForm.category}
                    >
                      <option value="">Select SubCategory</option>
                      {editorForm.category && legendCategories[editorForm.category]?.subItems && 
                        Object.keys(legendCategories[editorForm.category].subItems).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                {/* Pre-made Icons */}
                <div>
                  <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '8px', display: 'block' }}>Pre-made icons:</label>
                  <div style={{ 
                    display: 'flex', 
                    gap: '6px', 
                    flexWrap: 'wrap', 
                    maxHeight: '100px', 
                    overflowY: 'auto', 
                    padding: '8px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '4px',
                    border: '1px solid #333'
                  }}>
                    {markerIcons.map(iconFile => (
                      <button 
                        key={iconFile} 
                        onClick={() => {
                          const url = `/markers/${iconFile}`;
                          if (editorForm.iconSlots.length === 0) {
                            setEditorForm((prev:any) => ({
                              ...prev, 
                              iconSlots: [{ icon: url }]
                            }));
                          } else {
                            setEditorForm((prev:any) => ({
                              ...prev, 
                              iconSlots: prev.iconSlots.map((s:any, idx:number) => 
                                idx === 0 ? { ...s, icon: url } : s
                              )
                            }));
                          }
                          // Clear custom icon when selecting a pre-made icon
                          setCustomIconImage(null);
                        }}
                        title={iconFile.replace('.png', '')}
                        style={{
                          background: editorForm.iconSlots[0]?.icon === `/markers/${iconFile}` ? 'rgba(76, 175, 80, 0.3)' : '#222', 
                          border: editorForm.iconSlots[0]?.icon === `/markers/${iconFile}` ? '1px solid #4CAF50' : '1px solid #444', 
                          padding: '4px', 
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Image 
                          src={`/markers/${iconFile}`} 
                          alt={iconFile} 
                          width={20} 
                          height={20}
                          style={{ objectFit: 'contain' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Icon Upload Section */}
                <div>
                  <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '8px', display: 'block' }}>
                    Custom Icon:
                  </label>
                  
                  {customIconImage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={customIconImage} 
                          alt="Custom Icon" 
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            objectFit: 'contain',
                            borderRadius: '4px',
                            border: '2px solid #4CAF50',
                            padding: '2px'
                          }} 
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '10px', 
                            color: '#4CAF50', 
                            marginBottom: '4px',
                            fontWeight: 'bold'
                          }}>
                            Custom Icon Active
                          </div>
                          <button
                            onClick={removeCustomIcon}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={10} /> Remove Custom Icon
                          </button>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#888',
                        textAlign: 'center'
                      }}>
                        Click a pre-made icon above to switch back
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="custom-icon-upload"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleCustomIconUpload}
                      />
                      <button
                        onClick={() => document.getElementById('custom-icon-upload')?.click()}
                        style={{
                          background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',
                          color: 'white',
                          border: '1px dashed rgba(255,255,255,0.3)',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <Upload size={14} /> Upload Custom Icon
                      </button>
                      <div style={{ 
                        fontSize: '9px', 
                        color: '#666', 
                        marginTop: '4px',
                        textAlign: 'center'
                      }}>
                        PNG, JPG, SVG • Max 2MB
                      </div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px', display: 'block' }}>Title:</label>
                  <input
                    type="text"
                    value={editorForm.title}
                    onChange={(e) => setEditorForm({...editorForm, title: e.target.value})}
                    style={{
                      background: '#222',
                      color: '#fff',
                      border: '1px solid #444',
                      padding: '6px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      width: '100%'
                    }}
                    placeholder="Enter marker title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px', display: 'block' }}>Description:</label>
                  <textarea
                    id="description-textarea"
                    value={editorForm.description}
                    onChange={(e) => setEditorForm({...editorForm, description: e.target.value})}
                    style={{
                      background: '#222',
                      color: '#fff',
                      border: '1px solid #444',
                      padding: '6px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      width: '100%',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Enter marker description"
                  />
                </div>

                {/* Custom Image Description */}
                <div>
                  <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px', display: 'block' }}>Custom image description:</label>
                  {editorForm.descriptionImage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={editorForm.descriptionImage} 
                          alt="Description" 
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #555'
                          }} 
                        />
                        <div style={{ flex: 1 }}>
                          <button
                            onClick={() => insertImageIntoDescription(editorForm.descriptionImage)}
                            style={{
                              background: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              width: '100%',
                              marginBottom: '4px'
                            }}
                          >
                            <ImageIcon size={12} /> Insert into Description
                          </button>
                          <button
                            onClick={removeDescriptionImage}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              width: '100%'
                            }}
                          >
                            <Trash2 size={12} /> Remove Image
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="desc-img-upload"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleDescriptionImageUpload}
                      />
                      <button
                        onClick={() => document.getElementById('desc-img-upload')?.click()}
                        style={{
                          background: '#2196F3',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%'
                        }}
                      >
                        <Upload size={14} /> Upload Image
                      </button>
                    </div>
                  )}
                </div>

                {/* Hashtags */}
                <div>
                  <label style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px', display: 'block' }}>
                    <Hash size={12} style={{ marginRight: '4px' }} />
                    Hashtag placement:
                  </label>
                  <input
                    type="text"
                    value={editorForm.hashtags}
                    onChange={(e) => setEditorForm({...editorForm, hashtags: e.target.value})}
                    style={{
                      background: '#222',
                      color: '#fff',
                      border: '1px solid #444',
                      padding: '6px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      width: '100%'
                    }}
                    placeholder="#example, #tags, #separated, #by, #commas"
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    onClick={handleSaveMarker}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Save size={14} /> Save
                  </button>
                  <button 
                    onClick={handleRemovePendingMarker}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <XCircle size={14} /> Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Saved Markers Section */}
            {customMarkers.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#ccc', fontWeight: 'bold' }}>
                    Saved Markers: {customMarkers.length}
                  </div>
                  <button
                    onClick={handleExportJson}
                    style={{
                      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                      color: 'black',
                      border: 'none',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={12} /> Export JSON
                  </button>
                </div>
                
                {/* Marker List */}
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {customMarkers.slice().reverse().map((marker) => (
                    <div 
                      key={marker.id} 
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '8px',
                        borderRadius: '4px',
                        border: disclosedMarkerId === marker.id ? '1px solid #4CAF50' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>
                            {marker.title || marker.subCategory || 'Untitled Marker'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#aaa' }}>
                            {marker.grid} • {marker.category}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            onClick={() => setDisclosedMarkerId(disclosedMarkerId === marker.id ? null : marker.id)}
                            style={{
                              background: '#555',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              borderRadius: '3px',
                              fontSize: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            {disclosedMarkerId === marker.id ? <EyeOff size={10} /> : <Eye size={10} />} JSON
                          </button>
                          <button
                            onClick={() => handleRemoveMarker(marker.id)}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              borderRadius: '3px',
                              fontSize: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        </div>
                      </div>
                      
                      {disclosedMarkerId === marker.id && (
                        <textarea
                          readOnly
                          value={JSON.stringify(marker, null, 2)}
                          style={{
                            width: '100%',
                            minHeight: '120px',
                            background: '#111',
                            color: '#aeffa1',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            marginTop: '8px',
                            fontSize: '9px',
                            fontFamily: 'monospace',
                            padding: '6px',
                            resize: 'vertical'
                          }}
                          onFocus={(e) => e.target.select()}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!editorMode && !pendingMarker && customMarkers.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '24px 0', 
                color: '#666',
                fontSize: '12px'
              }}>
                Turn on Edit Mode and click on the map to create markers
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    
    </div>  
    )
}