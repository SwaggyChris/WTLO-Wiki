"use client"

// Prevent Next.js from statically prerendering this page so client-only
// code (which references window) won't run on the server during build.
export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, X, Upload, Trash2, Save, Plus } from "lucide-react"
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
  "Danger.png",
  "Food.png",
  "Forest.png",
  "Fuel.png",
  "Important Marker.png",
  "Key.png",
  "Marked Location.png",
  "Medicine.png",
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

// New standalone marker editor component
const StandaloneMarkerEditor = ({ 
  editorMode, 
  setEditorMode, 
  pendingMarker, 
  setPendingMarker,
  legendCategories,
  currentMap,
  customMarkers,
  onSaveMarkers,
  onRemoveMarker
}: any) => {
  const [editorForm, setEditorForm] = useState<any>({
    category: '',
    subCategory: '',
    grid: '',
    description: '',
    imageSlots: [] as Array<{ id: string; file: File | null; preview: string; title: string; description: string }>
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 50, y: 150 });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('/markers/Simple Marker.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when pendingMarker changes
  useEffect(() => {
    if (pendingMarker) {
      setEditorForm({
        category: Object.keys(legendCategories)[0] || '',
        subCategory: '',
        grid: pendingMarker.grid || '',
        description: '',
        imageSlots: []
      });
      setSelectedIcon('/markers/Simple Marker.png');
    }
  }, [pendingMarker, legendCategories]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newSlots = [...editorForm.imageSlots];
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSlot = {
          id: Date.now().toString() + Math.random(),
          file,
          preview: reader.result as string,
          title: '',
          description: ''
        };
        newSlots.push(newSlot);
        setEditorForm((prev: any) => ({
          ...prev,
          imageSlots: newSlots
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageSlot = (id: string) => {
    setEditorForm((prev: any) => ({
      ...prev,
      imageSlots: prev.imageSlots.filter((slot: any) => slot.id !== id)
    }));
  };

  const updateImageSlot = (id: string, field: string, value: string) => {
    setEditorForm((prev: any) => ({
      ...prev,
      imageSlots: prev.imageSlots.map((slot: any) => 
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleSaveMarker = () => {
    if (!pendingMarker) return;

    // Build popup HTML with images on right side
    const popupId = `marker-popup-${pendingMarker.id}`;
    
    // Images HTML for the right side
    const imagesHtml = editorForm.imageSlots.length > 0 ? `
      <div style="float: right; margin-left: 15px; width: 150px;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${editorForm.imageSlots.map((slot: any) => `
            <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
              <img src="${slot.preview}" alt="${slot.title || 'Image'}" 
                   style="width: 100%; height: auto; border-radius: 3px; margin-bottom: 6px;" />
              ${slot.title ? `<div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">${slot.title}</div>` : ''}
              ${slot.description ? `<div style="font-size: 11px; color: #aaa;">${slot.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // Description HTML for the left side
    const descriptionHtml = `
      <div style="overflow: hidden;">
        ${imagesHtml}
        <div>
          <strong style="font-size: 14px; color: #fff; display: block; margin-bottom: 8px;">${editorForm.description.split('\n')[0] || 'Marker'}</strong>
          <div style="font-size: 12px; line-height: 1.5; color: #ccc; white-space: pre-wrap;">
            ${editorForm.description.replace(/\n/g, '<br/>')}
          </div>
          ${editorForm.grid ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #aaa;">Grid: ${editorForm.grid}</div>` : ''}
        </div>
      </div>
    `;

    const finalMarker = {
      ...pendingMarker,
      category: editorForm.category,
      subCategory: editorForm.subCategory,
      grid: editorForm.grid,
      description: editorForm.description,
      icon: selectedIcon,
      imageSlots: editorForm.imageSlots,
      popup: `<div id="${popupId}" style="min-width: 300px;">${descriptionHtml}</div>`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedList = [...customMarkers, finalMarker];
    onSaveMarkers(updatedList);
    setPendingMarker(null);
    setEditorForm({
      category: '',
      subCategory: '',
      grid: '',
      description: '',
      imageSlots: []
    });
  };

  if (!editorMode) return null;

  return (
    <div 
      className="standalone-marker-editor"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '350px',
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid #444',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        zIndex: 10010,
        backdropFilter: 'blur(10px)',
        cursor: isDragging ? 'grabbing' : 'default',
        overflow: 'hidden'
      }}
    >
      {/* Header with drag handle */}
      <div 
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(40, 40, 40, 0.9)',
          borderBottom: '1px solid #444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'grab',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
      >
        <h3 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: '600' }}>
          Marker Editor {pendingMarker && `- ${pendingMarker.grid}`}
        </h3>
        <button
          onClick={() => setEditorMode(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div style={{ padding: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
        {pendingMarker ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Basic Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Coordinates</label>
              <input
                type="text"
                value={`X: ${pendingMarker.coordinates?.x}, Y: ${pendingMarker.coordinates?.y}`}
                readOnly
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  padding: '8px',
                  color: '#aaa',
                  fontSize: '12px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Grid ID</label>
              <input
                type="text"
                value={editorForm.grid}
                onChange={(e) => setEditorForm({ ...editorForm, grid: e.target.value })}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                placeholder="Enter grid ID (e.g., A1)"
              />
            </div>

            {/* Category Selection */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#ccc' }}>Category</label>
                <select
                  value={editorForm.category}
                  onChange={(e) => setEditorForm({ ...editorForm, category: e.target.value, subCategory: '' })}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    padding: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    width: '100%'
                  }}
                >
                  <option value="">Select Category</option>
                  {Object.keys(legendCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#ccc' }}>Sub Category</label>
                <select
                  value={editorForm.subCategory}
                  onChange={(e) => setEditorForm({ ...editorForm, subCategory: e.target.value })}
                  disabled={!editorForm.category}
                  style={{
                    background: editorForm.category ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    padding: '8px',
                    color: editorForm.category ? '#fff' : '#666',
                    fontSize: '12px',
                    width: '100%'
                  }}
                >
                  <option value="">Select Sub Category</option>
                  {editorForm.category && legendCategories[editorForm.category]?.subItems && 
                    Object.keys(legendCategories[editorForm.category].subItems).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            {/* Icon Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Marker Icon</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid #555',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  onClick={() => setShowIconPicker(!showIconPicker)}
                >
                  <Image 
                    src={selectedIcon} 
                    alt="Selected Icon" 
                    width={32} 
                    height={32}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Choose Icon
                </button>
              </div>

              {showIconPicker && (
                <div style={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  padding: '12px',
                  marginTop: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {markerIcons.map(iconFile => (
                      <button
                        key={iconFile}
                        onClick={() => {
                          setSelectedIcon(`/markers/${iconFile}`);
                          setShowIconPicker(false);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: selectedIcon === `/markers/${iconFile}` ? '2px solid #4CAF50' : '1px solid #444',
                          borderRadius: '4px',
                          padding: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Image 
                          src={`/markers/${iconFile}`} 
                          alt={iconFile} 
                          width={24} 
                          height={24}
                          style={{ objectFit: 'contain' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Description</label>
              <textarea
                value={editorForm.description}
                onChange={(e) => setEditorForm({ ...editorForm, description: e.target.value })}
                placeholder="Enter detailed description..."
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Image Upload Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', color: '#ccc' }}>Additional Images</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Upload size={14} />
                  Upload Images
                </button>
              </div>

              {/* Image Slots */}
              {editorForm.imageSlots.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editorForm.imageSlots.map((slot: any) => (
                    <div 
                      key={slot.id}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flexShrink: 0 }}>
                        <img 
                          src={slot.preview} 
                          alt="Preview" 
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={slot.title}
                          onChange={(e) => updateImageSlot(slot.id, 'title', e.target.value)}
                          placeholder="Image title (optional)"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            padding: '6px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                        <textarea
                          value={slot.description}
                          onChange={(e) => updateImageSlot(slot.id, 'description', e.target.value)}
                          placeholder="Image description (optional)"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            padding: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            minHeight: '40px',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      <button
                        onClick={() => removeImageSlot(slot.id)}
                        style={{
                          background: 'rgba(255,0,0,0.2)',
                          border: '1px solid #f44336',
                          borderRadius: '4px',
                          color: '#f44336',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          height: 'fit-content'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={handleSaveMarker}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} />
                Save Marker
              </button>
              <button
                onClick={() => {
                  setPendingMarker(null);
                  setEditorForm({
                    category: '',
                    subCategory: '',
                    grid: '',
                    description: '',
                    imageSlots: []
                  });
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>Click on the Map</h4>
            <p style={{ fontSize: '12px', margin: 0 }}>
              Click anywhere on the map to place a new marker. The editor will open here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [skinDropdownOpen, setSkinDropdownOpen] = useState(false)
  const [disclosedMarkerId, setDisclosedMarkerId] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false);
  
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

  // Custom markers from editor
  const [customMarkers, setCustomMarkers] = useState<any[]>([])

  // --- MARKER EDITOR STATE ---
  const [editorMode, setEditorMode] = useState(false)
  const [pendingMarker, setPendingMarker] = useState<any | null>(null)

  // ---------------------------
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
      const { map, category, subCategory, grid, coordinates, icon, popup } = markerInfo;

      if (map === currentMap) {
        // Only show if legend category is checked or we are in editor mode (optional, currently strictly following legend)
        const isVisible = legendCategories[category]?.subItems[subCategory] || editorMode; 
        
        if (isVisible) {
          let coords;
          if (coordinates) {
            coords = coordinates;
          } else if (grid) {
            // Re-use logic or import logic (we imported coordinatesToGrid but gridToCoordinates is in markers.ts too)
            // Ideally import gridToCoordinates, but we can rely on `coordinates` being present for custom markers we just made
             // For safety, let's just use the coordinates we saved
             coords = coordinates;
          } else {
            return; 
          }
          
          const customIcon = leafletRef.icon({
            iconUrl: icon,
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
    // Update markers on the map
    updateMarkersHandler(newMarkers);
  };

  // --- MAP CLICK LISTENER FOR EDITOR ---
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef) return;

    const map = mapInstanceRef.current;

    const onMapClick = (e: any) => {
      if (!editorMode) return;

      const { lat, lng } = e.latlng; // In Simple CRS, lat is Y, lng is X
      
      // Calculate Grid
      const gridId = coordinatesToGrid(lng, lat);
      
      // Create a temporary visual marker
      const tempId = `marker-${Date.now()}`;
      const newMarker = {
        id: tempId,
        map: currentMap,
        coordinates: { x: Math.round(lng), y: Math.round(lat) },
        grid: gridId
      };

      setPendingMarker(newMarker);
    };

    if (editorMode) {
      map.on('click', onMapClick);
      // Change cursor to crosshair to indicate edit mode
      document.getElementById('map-container-div')?.style.setProperty('cursor', 'crosshair');
    } else {
      map.off('click', onMapClick);
      document.getElementById('map-container-div')?.style.setProperty('cursor', 'default');
      setPendingMarker(null);
    }

    return () => {
      map.off('click', onMapClick);
    };
  }, [editorMode, currentMap, leafletRef]);

  // --- REMOVE MARKER FUNCTION ---
  const handleRemoveMarker = (markerId: string) => {
    const updatedList = customMarkers.filter(marker => marker.id !== markerId);
    handleSaveCustomMarkers(updatedList);
  };

  // --- EXPORT JSON FUNCTION ---
  const handleExportJson = () => {
    // Convert image slots to base64 strings for export
    const markersForExport = customMarkers.map(marker => ({
      ...marker,
      imageSlots: marker.imageSlots?.map((slot: any) => ({
        ...slot,
        file: null, // Remove file object
        preview: slot.preview // Keep base64 string
      })) || []
    }));
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(markersForExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "markers_export.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
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

            <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0'}} />

            {/* EDITOR TOGGLE AND EXPORT */}
            <div className={styles.wtloMenuSection}>
              <div className={styles.wtloDropdownHeader}>
                <h5 className={styles.wtloDropdownTitle}>Marker Tools</h5>
              </div>

              <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                
                {/* Toggle Edit Mode */}
                <button
                  onClick={() => setEditorMode(!editorMode)}
                  style={{
                    background: editorMode ? '#4CAF50' : '#333',
                    color: 'white',
                    border: '1px solid #555',
                    padding: '8px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '11px'
                  }}
                >
                  {editorMode ? 'Turn Edit Mode OFF' : 'Turn Edit Mode ON'}
                </button>

                {editorMode && (
                  <div style={{ fontSize: '11px', color: '#aaa', fontStyle: 'italic', textAlign: 'center' }}>
                    Click on the map to place a marker.
                  </div>
                )}

                {/* Export Button */}
                {customMarkers.length > 0 && (
                  <div style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444'}}>
                     <div style={{fontSize: '11px', marginBottom: '5px', color: '#aaa'}}>
                       Created markers: {customMarkers.length}
                     </div>
                     <button
                      onClick={handleExportJson}
                      style={{
                        width: '100%',
                        background: '#FF9800',
                        color: 'black',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    >
                      EXPORT ALL TO JSON
                    </button>
                    
                    {/* Marker List with Delete Options */}
                    <div style={{marginTop: '15px'}}>
                      <h6 style={{color: '#ccc', fontSize: '12px', marginBottom: '5px'}}>Created Markers:</h6>
                      {customMarkers.map((marker) => (
                        <div 
                          key={marker.id} 
                          style={{
                            background: 'rgba(0,0,0,0.2)', 
                            padding: '8px', 
                            borderRadius: '4px', 
                            marginBottom: '5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <div style={{flex: 1}}>
                            <div style={{fontSize: '11px', color: '#ddd', fontWeight: 'bold'}}>
                              {marker.subCategory || 'Untitled'}
                            </div>
                            <div style={{fontSize: '10px', color: '#aaa'}}>
                              {marker.grid} - {marker.description.substring(0, 30)}...
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMarker(marker.id)}
                            style={{
                              background: 'rgba(244, 67, 54, 0.2)',
                              border: '1px solid #f44336',
                              color: '#f44336',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              borderRadius: '3px',
                              fontSize: '10px'
                            }}
                            title="Delete this marker"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}
    </div>

    {/* Standalone Marker Editor Component */}
    <StandaloneMarkerEditor
      editorMode={editorMode}
      setEditorMode={setEditorMode}
      pendingMarker={pendingMarker}
      setPendingMarker={setPendingMarker}
      legendCategories={legendCategories}
      currentMap={currentMap}
      customMarkers={customMarkers}
      onSaveMarkers={handleSaveCustomMarkers}
      onRemoveMarker={handleRemoveMarker}
    />
    
    </div>  
    )
}