const NOT_FOUND = 404;
const BAD_TOKEN = 403;

const TOKEN = process.env.REACT_APP_TOKEN;

export const getTileAPI = async (
  x: number,
  y: number,
  z: number,
): Promise<string> => {
  const response = await fetch(
    `https://challenge-tiler.services.propelleraero.com/tiles/${z}/${x}/${y}?token=${TOKEN}`,
  );

  if (!response.ok) {
    if (response.status === NOT_FOUND) {
      throw new Error(`(z, x, y) = (${z}, ${x}, ${y}) not found`);
    } else if (response.status === BAD_TOKEN) {
      throw new Error("Bad token");
    } else {
      throw new Error("Unhandled exception");
    }
  }

  const blob = await response.blob();
  const imgURL = URL.createObjectURL(blob);
  return imgURL;
};
