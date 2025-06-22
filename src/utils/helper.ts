// Membentuk Base URL getAssetUrl() → "http://localhost:3000/uploads/thumbnails/"
export const getAssetUrl = (path = "thumbnails") => {
  const appurl = process.env.APP_URL ?? "";

  return `${appurl}/uploads/${path}/`;
};
