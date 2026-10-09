import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface TaskingMapProps {
  onAOIDrawn: (aoi: any) => void;
  currentAOI: any;
}

export const TaskingMap = ({ onAOIDrawn, currentAOI }: TaskingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [25.0, 65.0], // Finland
      zoom: 4,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'simple_select',
    });

    map.addControl(draw, 'top-left');

    map.on('draw.create', (e) => {
      if (e.features && e.features.length > 0) {
        processDrawnPolygon(e.features[0], draw);
      }
    });

    map.on('draw.update', (e) => {
      if (e.features && e.features.length > 0) {
        processDrawnPolygon(e.features[0], draw);
      }
    });

    map.on('load', () => setMapLoaded(true));

    mapRef.current = map;
    drawRef.current = draw;

    return () => {
      map.remove();
      mapRef.current = null;
      drawRef.current = null;
    };
  }, []);

  const processDrawnPolygon = (feature: any, draw: MapboxDraw) => {
    try {
      const polygon = turf.polygon(feature.geometry.coordinates);
      const area = turf.area(polygon) / 1_000_000; // km²
      const center = turf.centroid(polygon);

      const aoi = {
        geometry: feature.geometry,
        area: parseFloat(area.toFixed(2)),
        centerLat: center.geometry.coordinates[1],
        centerLon: center.geometry.coordinates[0],
      };

      // Limit to one polygon
      const allFeatures = draw.getAll();
      if (allFeatures.features.length > 1) {
        allFeatures.features.forEach((f: any) => {
          if (f.id !== feature.id) draw.delete(f.id);
        });
      }

      onAOIDrawn(aoi);
    } catch (error) {
      console.error('Error processing polygon:', error);
    }
  };

  useEffect(() => {
    if (!drawRef.current || !mapLoaded) return;

    if (currentAOI) {
      drawRef.current.deleteAll();
      drawRef.current.add({
        type: 'Feature',
        properties: {},
        geometry: currentAOI.geometry,
      });
    }
  }, [currentAOI, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {!currentAOI && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-md text-sm pointer-events-none z-10">
          <div>1. Click the polygon icon (top-left) ⬜</div>
          <div>2. Click on map to draw points</div>
          <div>3. Click first point again to close polygon</div>
        </div>
      )}

      {currentAOI && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-85 text-white p-4 rounded-lg text-sm min-w-[200px] z-10">
          <div className="font-bold mb-2">Area of Interest</div>
          <div className="opacity-90">
            <div>Area: {currentAOI.area} km²</div>
            <div>
              Center: {currentAOI.centerLat.toFixed(4)}°,{' '}
              {currentAOI.centerLon.toFixed(4)}°
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
