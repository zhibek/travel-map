const ParserItem = async (item) => {
  if (item.isRedirect() || item.isDisambiguation()) {
    return;
  }

  // TODO: Item parser logic

  const id = parseInt(item.pageID());

  const name = item.title();

  return {
    id,
    name,
  };
};

export default ParserItem;
