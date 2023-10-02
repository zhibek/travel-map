const Wait = async (ms) => (
  new Promise(resolve => setTimeout(resolve, ms))
);

export default Wait;
