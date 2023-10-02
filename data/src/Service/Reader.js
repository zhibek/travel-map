import fs from 'fs';
import sundayDriver from 'sunday-driver';

import Parser from './Parser.js';
import Builder from './Builder.js';
import Persister from './Persister.js';

import {
  WIKIVOYAGE_DUMP_PATH,
  WIKIVOYAGE_CHUNK_STRING,
} from '../Config/Constants.js';

const Reader = async () => {
  if (!fs.existsSync(WIKIVOYAGE_DUMP_PATH)) {
    console.error('Reader: Error - input file does not exist!');
    return;
  }

  console.log('Reader: Starting...');

  const config = {
    file: WIKIVOYAGE_DUMP_PATH,
    splitter: WIKIVOYAGE_CHUNK_STRING,
    each: readChunk,
  };
  const result = await sundayDriver(config);

  console.log('Reader: Completed!');
};

const readChunk = async (chunk, nextChunk) => {
  try {
    const wiki = await Parser(chunk);
    if (!wiki) {
      return nextChunk();
    }

    const newItems = await Builder(wiki);
    if (!newItems) {
      return nextChunk();
    }

    await Persister(newItems);
  } catch (err) {
    console.log('Error parsing chunk!');
    console.error(err);
  }

  return nextChunk();
};

export default Reader;
