const Builder = async (item) => {
  const newItems = [];

  if (checkItemSkip(item)) {
    return newItems;
  }

  newItems.push(buildItem(item));

  return newItems;
};

const checkItemSkip = (item) => (
  (item.isRedirect() || item.isDisambiguation())
);

const buildItem = (item) => {
  const id = getItemId(item);
  const name = getItemName(item);
  const url = getItemUrl(item);
  const parent = getItemParent(item);
  const coordinates = getItemCoordinates(item);
  const description = getItemDescription(item);
  const characters = getItemCharacters(item);
  const wikidata = getItemWikidata(item);
  const image = getItemImage(item);

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

const getItemId = (item) => (
  parseInt(item.pageID())
);

const getItemName = (item) => (
  item.title()
);

const getItemUrl = (item) => (
  item.url()
);

const getItemParent = (item) => {
  let parent = null;

  item.templates('isPartOf').some((template) => {
    const parents = template.json()?.list;

    if (parents && parents.length) {
      parent = parents[0];
    }

    return true;
  });

  return parent;
};

const getItemCoordinates = (item) => {
  let coordinates = null;

  item.templates('geo').some((template) => {
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

const getItemDescription = (item) => (
  item.paragraph(0)?.text()?.trim() || null
);

const getItemCharacters = (item) => (
  item.text()?.trim()?.length || 0
);

const getItemWikidata = (item) => (
  item.wikidata()
);

const getItemImage = (item) => {
  let imageUrl = null;

  item.images().some((image) => {
    imageUrl = image.json()?.url;

    return true;
  });

  return imageUrl;
};

export default Builder;
