const Builder = async (item) => {
  if (checkItemSkip(item)) {
    return;
  }

  const id = getItemId(item);
  const name = getItemName(item);
  const url = getItemUrl(item);

  return {
    id,
    name,
    url,
  };
};

const checkItemSkip = (item) => (
  (item.isRedirect() || item.isDisambiguation())
);

const getItemId = (item) => (
  parseInt(item.pageID())
);

const getItemName = (item) => (
  item.title()
);

const getItemUrl = (item) => (
  item.url()
);

export default Builder;
