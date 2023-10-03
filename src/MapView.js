import { useEffect } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

import 'maplibre-gl/dist/maplibre-gl.css';

import mapStyle from './mapStyle.json';
if (mapStyle?.sources?.items?.url) {
  mapStyle.sources.items.url = mapStyle?.sources?.items?.url.replace('/files/', `${window.PUBLIC_URL}/files/`);
}

const MapView = () => {
  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  return (
    <Map
      initialViewState={{
        longitude: 0,
        latitude: 51.5,
        zoom: 6,
      }}
      style={{width: '100%', height: '100%'}}
      mapLib={maplibregl}
      mapStyle={mapStyle}
      hash={true}
    >
      <NavigationControl position="top-left" showCompass={false} />
    </Map>
  );
};

export default MapView;
