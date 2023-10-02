const Builder = async (wiki) => {
  const newItems = [];

  if (checkItemSkip(wiki)) {
    return newItems;
  }

  const parentItem = buildItem(wiki);
  if (parentItem) {
    newItems.push(parentItem);
  }

  const childItems = buildChildItems(wiki, parentItem);
  if (childItems && childItems.length) {
    newItems.push(...childItems);
  }

  return newItems;
};

const checkItemSkip = (wiki) => (
  (wiki.isRedirect() || wiki.isDisambiguation())
);

const buildItem = (wiki) => {
  const id = getItemId(wiki);
  const name = getItemName(wiki);
  const url = getItemUrl(wiki);
  const parent = getItemParent(wiki);
  const coordinates = getItemCoordinates(wiki);
  const description = getItemDescription(wiki);
  const characters = getItemCharacters(wiki);
  const wikidata = getItemWikidata(wiki);
  const image = getItemImage(wiki);

  return {
    id,
    name,
    url,
    parent,
    coordinates,
    description,
    characters,
    wikidata,
    image,
  };
};

const getItemId = (wiki) => (
  parseInt(wiki.pageID())
);

const getItemName = (wiki) => (
  wiki.title()
);

const getItemUrl = (wiki) => (
  wiki.url()
);

const getItemParent = (wiki) => {
  let parent = null;

  wiki.templates('isPartOf').some((template) => {
    const parents = template.json()?.list;

    if (parents && parents.length) {
      parent = parents[0];
    }

    return true;
  });

  return parent;
};

const getItemCoordinates = (wiki) => {
  let coordinates = null;

  wiki.templates('geo').some((template) => {
    const geo = template.json();

    const lat = geo?.lat ? parseFloat(geo.lat) : null;
    const lon = geo?.lon ? parseFloat(geo.lon) : null;

    if (!lat || !lon) {
      return true;
    }

    // Order required for maplibre-gl/mapbox-gl
    coordinates = [
      lon,
      lat,
    ];

    return true;
  });

  return coordinates;
};

const getItemDescription = (wiki) => (
  wiki.paragraph(0)?.text()?.trim() || null
);

const getItemCharacters = (wiki) => (
  wiki.text()?.trim()?.length || 0
);

const getItemWikidata = (wiki) => (
  wiki.wikidata()
);

const getItemImage = (wiki) => {
  let imageUrl = null;

  wiki.images().some((image) => {
    imageUrl = image.json()?.url;

    return true;
  });

  return imageUrl;
};

const buildChildItems = (wiki, parentItem) => {
  const newItems = [];

  const types = [
    'see',
    'do',
    'go',
  ];

  let counter = 0;

  types.forEach((type) => {
    wiki.templates(type).forEach((template) => {
      const data = template.json();
      const childItem = buildChildItem(data, parentItem, counter++);
      if (childItem) {
        newItems.push(childItem);
      }
    });
  });

  return newItems;
};

const buildChildItem = (data, parentItem, counter) => {
  const { url, parent } = parentItem;

  const id = getChildItemId(parentItem, counter);
  const name = getChildItemName(data);
  const coordinates = getChildItemCoordinates(data);
  const description = getChildItemDescription(data);
  const characters = getChildItemCharacters(data);
  const wikidata = getChildItemWikidata(data);
  const image = getChildItemImage(data);

  return {
    id,
    name,
    url,
    parent,
    coordinates,
    description,
    characters,
    wikidata,
    image,
  };
};

const getChildItemId = (parentItem, counter) => (
  (parentItem.id * 100000000) + counter
);

const getChildItemName = (data) => (
  data?.name || null
);

const getChildItemCoordinates = (data) => {
  const lat = data?.lat ? parseFloat(data?.lat) : null;
  const lon = data?.long ? parseFloat(data?.long) : null;

  if (!lat || !lon) {
    return null;
  }

  // Order required for maplibre-gl/mapbox-gl
  return [
    lon,
    lat,
  ];
};

const getChildItemDescription = (data) => (
  data?.content || null
);

const getChildItemCharacters = (data) => (
  data?.content?.length || 0
);

const getChildItemWikidata = (data) => (
  data?.wikidata || null
);

const getChildItemImage = (data) => {
  let imageUrl = null;

  if (data?.image) {
    imageUrl = 'https://wikivoyage.org/wiki/Special:Redirect/file/' + encodeURIComponent(data?.image);
  }

  return imageUrl;
};

export default Builder;
