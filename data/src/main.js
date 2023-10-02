import Downloader from './Service/Downloader.js';
import Reader from './Service/Reader.js';

const main = async () => {
  await Downloader();
  await Reader();
};

await main();
