import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import {
  ITEMS_PERSIST_DB,
  ITEMS_DB_PATH,
} from '../Config/Constants.js';

let instance;

const PersisterInstance = async () => {
  if (!instance) {
    instance = new Persister();
    await instance.init();
    await instance.setupDb();
  }

  return instance;
};

class Persister {
  async init() {
    if (!ITEMS_PERSIST_DB) {
      return;
    }

    this.items = [];
    this.db = await open({
      filename: ITEMS_DB_PATH,
      driver: sqlite3.cached.Database,
    });
  }

  async setupDb() {
    if (!ITEMS_PERSIST_DB) {
      return;
    }

    return this.db.exec(`CREATE TABLE IF NOT EXISTS items (
      id INT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      coordinates TEXT,
      parent TEXT,
      description TEXT,
      characters INT,
      wikidata TEXT,
      image TEXT
    ) STRICT`);
  }

  async saveItems(newItems) {
    for (const item of newItems) {
      this.items.push(item);
      if (ITEMS_PERSIST_DB) {
        await this.insertDbItem(item);
      }
    }
  }

  async insertDbItem(item) {
    return this.db.run(`INSERT INTO items (
      id,
      name,
      url,
      coordinates,
      parent,
      description,
      characters,
      wikidata,
      image
    ) VALUES (
      :id,
      :name,
      :url,
      :coordinates,
      :parent,
      :description,
      :characters,
      :wikidata,
      :image
    ) ON CONFLICT(id) DO UPDATE SET
      name = :name,
      url = :url,
      coordinates = :coordinates,
      parent = :parent,
      description = :description,
      characters = :characters,
      wikidata = :wikidata,
      image = :image
    `, {
      ':id': item?.id,
      ':name': item?.name,
      ':url': item?.url,
      ':parent': item?.parent,
      ':coordinates': item?.coordinates?.join(','),
      ':description': item?.description,
      ':characters': item?.characters,
      ':wikidata': item?.wikidata,
      ':image': item?.image,
    });
  }

  getItems() {
    return this.items;
  }
}

export default PersisterInstance;
