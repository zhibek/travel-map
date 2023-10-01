import wtf from 'wtf_wikipedia';

import ParserItem from './Parser/Item.js';

import {
  WIKIVOYAGE_PARSING_OPTIONS,
} from '../Config/Constants.js';

const Parser = async (chunk) => {
  const contents = parseXml(chunk);
  if (!contents) {
    console.error('Problem parsing XML!');
    return;
  }

  const wiki = parseWiki(contents);
  if (!wiki) {
    console.error('Problem parsing wiki!');
    return;
  }

  const newItems = ParserItem(wiki);
  if (!newItems) {
    console.error('Problem parsing item!');
    return;
  }

  return newItems;
};

const unescapeEntities = (wiki) => (
  wiki
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
);

const parseXml = (xml) => {
  if (!xml) {
    return;
  }

  let title = null;
  let pageID = null;
  let wiki = null;

  // Match page title
  const matchTitle = xml.match(/<title>([\s\S]+?)<\/title>/);
  if (matchTitle !== null) {
    title = matchTitle[1];
  }

  // Match page id
  const matchPageID = xml.match(/<id>([0-9]*?)<\/id>/);
  if (matchPageID !== null) {
    pageID = matchPageID[1];
  }

  // Match wiki text & unescape
  const matchWiki = xml.match(/<text ([\s\S]*?)<\/text>/);
  if (matchWiki !== null) {
    wiki = matchWiki[1].replace(/^.*?>/, '');
    wiki = unescapeEntities(wiki);
  }

  return {
    title,
    pageID,
    wiki,
  };
};

const parseWiki = (contents) => {
  const { title, pageID, wiki } = contents;
  const options = {
    ...WIKIVOYAGE_PARSING_OPTIONS,
    title,
    pageID,
  };

  return wtf(wiki, options);
};

export default Parser;
