const Builder = async (item) => {
  if (item.isRedirect() || item.isDisambiguation()) {
    return;
  }

  // TODO: Item builder logic

  const id = parseInt(item.pageID());

  const name = item.title();

  return {
    id,
    name,
  };
};

export default Builder;
