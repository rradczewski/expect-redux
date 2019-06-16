export const trySerialize = (o: any): string => {
  try {
    return JSON.stringify(o);
  } catch (e) {
    return `{ Unserializable Object: ${e} }`;
  }
};
