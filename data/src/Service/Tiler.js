import tippecanoe from 'tippecanoe';

import {
  ITEMS_GEOJSON_PATH,
  ITEMS_TILES_PATH,
} from '../Config/Constants.js';

const Tiler = async () => {
  console.log('Tiler: Starting...');

  tippecanoe([
    ITEMS_GEOJSON_PATH
  ], {
    zg: true,
    dropDensestAsNeeded: true,
    force: true,
    output: ITEMS_TILES_PATH,
  });

  console.log('Tiler: Completed!');
};

export default Tiler;
