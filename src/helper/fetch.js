const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const fetchRecordsApi = async (queryTerm) => {
  let response = await fetch(`${baseUrl}/api/v1/price/all/${queryTerm}`, {
    method: "get",
  });

  return await response.json();
};
