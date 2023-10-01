import { Readable } from 'node:stream';
import fs from 'fs';
import bz2 from 'unbzip2-stream';

const WIKIVOYAGE_DUMP_URL = 'https://dumps.wikimedia.org/enwikivoyage/latest/enwikivoyage-latest-pages-articles.xml.bz2';
const WIKIVOYAGE_DUMP_PATH = './files/wikivoyage.xml';

const Downloader = async (force = false) => {
  if (!force && fs.existsSync(WIKIVOYAGE_DUMP_PATH)) {
    console.log('Downloader: Skipping as file already exists!');
    return;
  }

  console.log('Downloader: Starting...');
  const result = await fetch(WIKIVOYAGE_DUMP_URL);
  const blob = await result.blob();
  const webStream = blob.stream();
  const readStream = Readable.fromWeb(webStream);

  const writeStream = fs.createWriteStream(WIKIVOYAGE_DUMP_PATH);
  readStream
    .pipe(bz2())
    .pipe(writeStream);

  console.log('Downloader: Completed!');
};

export default Downloader;
