import wtf from 'wtf_wikipedia';

import {
  WIKIVOYAGE_PARSING_OPTIONS,
} from '../Config/Constants.js';

const Parser = async (chunk) => {
  const contents = splitXml(chunk);
  if (!contents) {
    console.error('Problem splitting XML!');
    return;
  }

  // Skip pages outside of main namespace
  if (contents?.namespace !== '0' || !contents?.title) {
    return;
  }

  const wiki = parseWiki(contents);
  if (!wiki) {
    console.error('Problem parsing wiki!');
    return;
  }

  return wiki;
};

const unescapeEntities = (raw) => (
  raw
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
);

const splitXml = (xml) => {
  if (!xml) {
    return;
  }

  let title = null;
  let namespace = null;
  let pageID = null;
  let raw = null;

  // Match page title
  const matchTitle = xml.match(/<title>([\s\S]+?)<\/title>/);
  if (matchTitle !== null) {
    title = matchTitle[1];
  }

  // Match namespace
  const matchNamespace = xml.match(/<ns>([0-9]*?)<\/ns>/);
  if (matchNamespace !== null) {
    namespace = matchNamespace[1];
  }

  // Match page id
  const matchPageID = xml.match(/<id>([0-9]*?)<\/id>/);
  if (matchPageID !== null) {
    pageID = matchPageID[1];
  }

  // Match raw wiki & unescape
  const matchRaw = xml.match(/<text ([\s\S]*?)<\/text>/);
  if (matchRaw !== null) {
    raw = matchRaw[1].replace(/^.*?>/, '');
    raw = unescapeEntities(raw);
  }

  return {
    title,
    namespace,
    pageID,
    raw,
  };
};

const parseWiki = (contents) => {
  const { title, namespace, pageID, raw } = contents;
  const options = {
    ...WIKIVOYAGE_PARSING_OPTIONS,
    title,
    pageID,
    namespace,
  };

  const wiki = wtf(raw, options);
  wiki.language(WIKIVOYAGE_PARSING_OPTIONS.lang);
  wiki.namespace(namespace);

  return wiki;
};

export default Parser;
