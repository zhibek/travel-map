import { Readable } from 'node:stream';
import fs from 'fs';
import bz2 from 'unbzip2-stream';

import Wait from '../Utils/Wait.js';
import {
  WIKIVOYAGE_DUMP_URL,
  WIKIVOYAGE_DUMP_PATH,
} from '../Config/Constants.js';


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

  // Add brief wait to allow file-system to update
  await Wait(500);

  console.log('Downloader: Completed!');
};

export default Downloader;
