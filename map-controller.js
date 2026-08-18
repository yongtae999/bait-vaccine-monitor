/**
 * Map Controller Module (MapLibre GL JS 3D Satellite)
 * IP Camera 3D Pinpoints & FlyTo Orbiting for Bait Vaccine Monitoring
 */

class MapController {
  constructor(containerId = 'map-viewport') {
    this.containerId = containerId;
    this.map = null;
    this.cameras = [];
    this.activeCamera = null;
    this.markers = [];
  }

  init(camerasData) {
    this.cameras = camerasData || [];
    
    // Default Gongju Mun-geum-ri Precision Center
    const defaultCenter = [127.010993, 36.640800];

    this.map = new maplibregl.Map({
      container: this.containerId,
      style: {
        version: 8,
        sources: {
          'google-satellite': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            maxzoom: 22
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'google-satellite',
            minzoom: 0,
            maxzoom: 24,
            paint: {
              'raster-resampling': 'linear',
              'raster-opacity': 1.0
            }
          }
        ]
      },
      center: defaultCenter,
      zoom: 16.8,
      pitch: 65,
      bearing: 328,
      maxPitch: 85,
      antialias: true
    });

    this.map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    this.map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

    this.map.on('load', () => {
      this.renderCameraMarkers();
      this.bindMapRotationEvents();
      this.updateHudTelemetry();
    });

    this.map.on('move', () => {
      this.updateHudTelemetry();
    });

    return this.map;
  }

  bindMapRotationEvents() {
    this.map.on('rotate', () => this.updateMarkerOrientations());
    this.map.on('move', () => this.updateMarkerOrientations());
  }

  updateMarkerOrientations() {
    if (!this.map || !this.markers) return;
    const mapBearing = this.map.getBearing();

    this.markers.forEach(({ el, cam }) => {
      const arrow = el.querySelector('.cam-marker-arrow');
      if (arrow) {
        const camBearing = cam.bearing || 0;
        arrow.style.transform = `rotate(${camBearing - mapBearing}deg)`;
      }
    });
  }

  renderCameraMarkers() {
    // Clear old markers
    if (this.markers && this.markers.length) {
      this.markers.forEach(m => m.marker.remove());
    }
    this.markers = [];

    const currentMapBearing = this.map ? this.map.getBearing() : 0;

    this.cameras.forEach((cam) => {
      const el = document.createElement('div');
      el.className = 'camera-marker-pin';
      el.id = `marker-${cam.id}`;
      
      const camBearing = cam.bearing || 0;
      const initialRot = camBearing - currentMapBearing;

      el.innerHTML = `
        <div class="cam-pulse"></div>
        <div class="cam-marker-arrow" style="transform: rotate(${initialRot}deg);"></div>
        <div class="cam-marker-icon" title="${cam.name}">
          <i class="fa-solid fa-video"></i>
        </div>
      `;

      el.addEventListener('click', () => {
        this.flyToCamera(cam.id);
      });

      // Custom Popup
      const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="padding: 6px; font-family: sans-serif;">
            <b style="color: #38bdf8; font-size: 0.85rem;">${cam.name}</b><br>
            <span style="font-size: 0.75rem; color: #cbd5e1;">${cam.address}</span><br>
            <span style="font-size: 0.72rem; color: #10b981; font-weight: bold;">미끼: ${cam.bait_type}</span><br>
            <small style="color: #f43f5e; font-weight: bold;">멧돼지 확정 ${cam.wildboar_confirmed}건</small>
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([cam.lng, cam.lat])
        .setPopup(popup)
        .addTo(this.map);

      this.markers.push({ marker, el, cam });
    });

    this.updateMarkerOrientations();
  }

  flyToCamera(cameraId) {
    const cam = this.cameras.find(c => c.id === cameraId);
    if (!cam) return;

    this.activeCamera = cam;

    // Highlight card
    document.querySelectorAll('.cam-card').forEach(c => {
      c.classList.toggle('active', c.dataset.id === cameraId);
    });

    this.map.flyTo({
      center: [cam.lng, cam.lat],
      zoom: 18.2,
      pitch: cam.pitch || 65,
      bearing: cam.bearing || 45,
      duration: 2200,
      essential: true
    });

    if (this.onCameraSelect) {
      this.onCameraSelect(cameraId, cam);
    }
  }

  flyToRegion(regionKey) {
    if (regionKey === 'gyeongsan' || regionKey === 'daegu') {
      const gsCam = this.cameras.find(c => c.id === 'cam-dg-1' || c.region === '경산' || c.region === '대구') || { lng: 128.768866, lat: 35.891543, pitch: 62, bearing: 135 };
      this.map.flyTo({
        center: [gsCam.lng, gsCam.lat],
        zoom: 17.8,
        pitch: gsCam.pitch || 62,
        bearing: gsCam.bearing || 135,
        duration: 2500,
        essential: true
      });
    } else {
      // Gongju Mun-geum-ri Precision Overview
      this.map.flyTo({
        center: [127.010993, 36.640800],
        zoom: 16.5,
        pitch: 62,
        bearing: 328,
        duration: 2500,
        essential: true
      });
    }
  }

  updateHudTelemetry() {
    if (!this.map) return;
    const center = this.map.getCenter();
    const pitch = Math.round(this.map.getPitch());
    const bearing = Math.round(this.map.getBearing());
    const zoom = this.map.getZoom();

    const latElem = document.getElementById('hud-lat');
    const lonElem = document.getElementById('hud-lon');
    const altElem = document.getElementById('hud-alt');
    const hdgElem = document.getElementById('hud-hdg');
    const sightTag = document.getElementById('sight-coord-tag');

    if (latElem) latElem.textContent = `${center.lat.toFixed(6)}° N`;
    if (lonElem) lonElem.textContent = `${center.lng.toFixed(6)}° E`;
    if (altElem) altElem.textContent = `${Math.round((21 - zoom) * 40 + pitch * 0.5)}m`;
    
    let normHdg = (bearing % 360 + 360) % 360;
    if (hdgElem) hdgElem.textContent = `HDG ${normHdg.toString().padStart(3, '0')}°`;

    if (sightTag) {
      sightTag.textContent = `${center.lat.toFixed(6)}° N, ${center.lng.toFixed(6)}° E`;
    }
  }
}

window.MapController = MapController;
