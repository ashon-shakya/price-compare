const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const fetchRecordsApi = async (queryTerm) => {
  let response = await fetch(`${baseUrl}/api/v1/price/all/${queryTerm}`, {
    method: "get",
    headers: {
      "ngrok-skip-browser-warning": "true", // often used for ngrok
      "X-Tunnel-Skip-Anti-Phishing-Page": "1", // specifically for MS Dev Tunnels
    },
  });

  return await response.json();
};
