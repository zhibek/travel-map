import Downloader from './Service/Downloader.js';
import Reader from './Service/Reader.js';
import Exporter from './Service/Exporter.js';
import Tiler from './Service/Tiler.js';

const main = async () => {
  await Downloader();
  const items = await Reader();
  await Exporter(items);
  await Tiler();
};

await main();
