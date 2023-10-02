const Builder = async (wiki) => {
  const newItems = [];

  if (checkItemSkip(wiki)) {
    return newItems;
  }

  const parentItem = buildItem(wiki);
  if (parentItem) {
    newItems.push(parentItem);
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

export default Builder;
