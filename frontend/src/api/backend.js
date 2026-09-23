const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api`;

const request = async (path, options) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const uploadPdf = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return request("/upload-pdf", { method: "POST", body: formData });
};

export const queryDocuments = (query, topK = 3) =>
  request("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
  });