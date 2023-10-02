import fs from 'fs';
import sundayDriver from 'sunday-driver';

import Parser from './Parser.js';
import Builder from './Builder.js';
import PersisterInstance from './Persister.js';

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

  const persister = await PersisterInstance();

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

      persister.saveItems(newItems);
    } catch (err) {
      console.log('Error parsing chunk!');
      console.error(err);
    }

    return nextChunk();
  };

  const config = {
    file: WIKIVOYAGE_DUMP_PATH,
    splitter: WIKIVOYAGE_CHUNK_STRING,
    each: readChunk,
    start: `0%`,
    end: `100%`,
  };
  const result = await sundayDriver(config);
  //console.log(`Reader: Completed! (${result.chunksDone} chunks)`);

  const items = persister.getItems();
  console.log(`Reader: Completed! (${items.length} items)`);

  return items;
};

export default Reader;
