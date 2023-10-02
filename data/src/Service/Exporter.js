import fs from 'fs';

import {
  ITEMS_GEOJSON_PATH,
} from '../Config/Constants.js';

const Exporter = async (items, force = true) => {
  if (!force && fs.existsSync(ITEMS_GEOJSON_PATH)) {
    console.log('Exporter: Skipping as file already exists!');
    return;
  }

  console.log('Exporter: Starting...');

  const features = [];

  items.forEach((item) => {
    if (checkItemExportSkip(item)) {
      return;
    }
    const feature = buildGeojsonFeatureFromItem(item);
    features.push(feature);
  });

  const collection = buildGeojsonFeatureCollection(features);

  fs.writeFileSync(ITEMS_GEOJSON_PATH, JSON.stringify(collection));

  console.log(`Exporter: Completed! (${features.length} features)`);
};

// Stricter requirements for including item in export (item must have coordinates!)
const checkItemExportSkip = (item) => (
  (!item.id || !item.name || !item.url || !item.coordinates)
);

const buildGeojsonFeatureFromItem = (item) => {
  const { id } = item;
  const { coordinates, ...properties } = item;

  return buildGeojsonFeature(id, coordinates, properties);
};

const buildGeojsonFeature = (id, coordinates = [], properties = {}) => ({
  type: 'Feature',
  id,
  geometry: {
    type: 'Point',
    coordinates,
  },
  properties,
});

const buildGeojsonFeatureCollection = (features = []) => ({
  type: 'FeatureCollection',
  features,
});

export default Exporter;
