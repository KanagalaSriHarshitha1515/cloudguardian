export function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object") {
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.projects)) return response.projects;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.results)) return response.results;
    const firstArray = Object.values(response).find((v) => Array.isArray(v));
    if (firstArray) return firstArray;
  }
  console.warn("[normalizeList] Expected an array-shaped response but got:", response, "— defaulting to empty list.");
  return [];
}