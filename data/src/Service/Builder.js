const Builder = async (wiki) => {
  const newItems = [];

  if (checkItemSkip(wiki)) {
    return newItems;
  }

  const parentItem = buildItem(wiki);
  if (!parentItem) {
    return newItems;
  }
  newItems.push(parentItem);

  const childItems = buildChildItems(wiki, parentItem);
  childItems.forEach((childItem) => {
    if (childItem) {
      newItems.push(childItem);
    }
  });

  return newItems;
};

const checkItemSkip = (wiki) => (
  (wiki.isRedirect() || wiki.isDisambiguation())
);

const checkAttributesSkip = (id, name, url) => (
  (!id || !name || !url)
);

const buildItem = (wiki) => {
  const id = getItemId(wiki);
  const name = getItemName(wiki);
  const url = getItemUrl(wiki);

  if (checkAttributesSkip(id, name, url)) {
    return;
  }

  const parent = getItemParent(wiki);
  const coordinates = getItemCoordinates(wiki);
  const { type, level } = getItemTypeAndLevel(wiki, parent);
  const description = getItemDescription(wiki);
  const characters = getItemCharacters(wiki);
  const wikidata = getItemWikidata(wiki);
  const image = getItemImage(wiki);
  const rank = calculateRank(type, level, characters);

  return {
    id,
    name,
    url,
    parent,
    coordinates,
    type,
    level,
    description,
    characters,
    wikidata,
    image,
    rank,
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

const getItemTypeAndLevel = (wiki, parent) => {
  let result = {
    type: 'unknown',
    level: 'unknown',
  };

  const types = [
    'park',
    'airport',
    'ruralarea',
    'diveguide',
    'district',
    'city',
    'region',
    'country',
    'continent',
  ];
  const levels = [
    'extra',
    'stub',
    'outline',
    'usable',
    'informative',
    'guide',
    'star',
  ];
  const continents = [
    'Africa',
    'Antartica',
    'Asia',
    'Europe',
    'Oceania',
    'North America',
    'South America',
  ];

  exit_loops:
  for (const type of types) {
    for (const level of levels) {
      const template = level + type;
      if (wiki.templates(template).length > 0) {
        result = {
          type,
          level,
        };
        break exit_loops;
      }
    }
  }

  if (result.type === 'city') {
    // TODO: Improve logic for checking "huge" cities (results poor with current logic)
    if (wiki.templates('regionlist').length) {
      result.level = 'huge';
    }
  }

  // Check for "subcontinent" region
  if (result.type === 'region' && result.level !== 'extra') {
    if (continents.includes(parent)) {
      result.level = 'subcontinent';
    }
  }

  return result;
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
  const id = getChildItemId(parentItem, counter);
  const name = getChildItemName(data);
  const { url } = parentItem;

  if (checkAttributesSkip(id, name, url)) {
    return;
  }

  const { parent } = parentItem;
  const coordinates = getChildItemCoordinates(data);
  const { type, level } = getChildItemTypeAndLevel(data);
  const description = getChildItemDescription(data);
  const characters = getChildItemCharacters(data);
  const wikidata = getChildItemWikidata(data);
  const image = getChildItemImage(data);
  const rank = calculateRank(type, level, characters);

  return {
    id,
    name,
    url,
    parent,
    coordinates,
    type,
    level,
    description,
    characters,
    wikidata,
    image,
    rank,
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

const getChildItemTypeAndLevel = (data) => ({
  type: data?.template,
  level: null,
});

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

const calculateRank = (type, level, characters) => {
  let rank = 10;

  switch (type) {
    case 'continent':
      rank = 1;
      break;
    case 'country':
      rank = 3;
      break;
    case 'region':
      // Separate regions above countries ("subcontinents") and those below
      if (level === 'subcontinent') {
        rank = 2;
      } else if (characters >= 20000) {
        rank = 4;
      } else {
        rank = 5;
      }
      break;

    case 'city':
      // Find "huge" cities & give them high ranking
      if (level === 'huge') {
        rank = 3;
      } else if (characters >= 50000) {
        rank = 4;
      } else if (characters >= 20000) {
        rank = 5;
      } else if (characters >= 10000) {
        rank = 6;
      } else {
        rank = 7;
      }
      break;

    case 'park':
    case 'ruralarea':
    case 'diveguide':
    case 'airport':
      if (characters >= 20000) {
        rank = 7;
      } else {
        rank = 9;
      }
      break;

    case 'district':
      if (characters >= 20000) {
        rank = 8;
      } else if (characters > 0) {
        rank = 9;
      } else {
        rank = 10;
      }
      break;

    case 'see':
    case 'do':
    default:
      if (characters >= 200) {
        rank = 8;
      } else if (characters > 0) {
        rank = 9;
      } else {
        rank = 10;
      }
      break;
  }

  return rank;
};

export default Builder;
