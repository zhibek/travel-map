import { useState, useEffect } from 'react';
import Map, { NavigationControl, Popup } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

import 'maplibre-gl/dist/maplibre-gl.css';

import mapStyle from './mapStyle.json';
const { NODE_ENV, PUBLIC_URL } = process.env;
if (NODE_ENV === 'development') {
  mapStyle.sources.items.url = mapStyle.sources.items.url.replace('/files/', `${PUBLIC_URL}/files/`);
}

const MapView = () => {
  const [activeFeatures, setActiveFeatures] = useState([]);

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  const onMouseEnter = (e) => {
    const features = e.features || [];

    if (features.length > 0) {
      setActiveFeatures(current => [...current, features[0]]);
    }
  };

  const onMouseLeave = (e) => {
    const features = e.features || [];

    if (features.length > 0) {
      setActiveFeatures([]);
    }
  };

  const onClick = (e) => {
    const features = e.features || [];

    if (features.length > 0) {
      setActiveFeatures(current => [...current, features[0]]);
    } else {
      setActiveFeatures([]);
    }
  };

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
      interactiveLayerIds={["place_city","place_detail"]}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <NavigationControl position="top-left" showCompass={false} />
      {activeFeatures.map(feature => (
        <Popup
          key={feature.properties.name}
          longitude={feature.geometry.coordinates[0]}
          latitude={feature.geometry.coordinates[1]}
          closeButton={false}
          anchor="center"
        >
          <div><strong>{feature.properties.name}</strong> (rank: {feature.properties.rank})</div>
          {feature.properties.image && (
            <div><img width="300" src={`${feature.properties.image}?width=300`} alt="" /></div>
          )}
          <div>{feature.properties.description}</div>
          <div><a href={feature.properties.url} rel="noreferrer" target="_blank">More information...</a></div>
        </Popup>
      ))}
    </Map>
  );
};

export default MapView;
