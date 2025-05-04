// api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:2358", // or your VPS IP/domain
});

export const executeCode = async (languageId, sourceCode, stdin = "") => {
  const response = await API.post("/submissions?base64_encoded=false&wait=true", {
    source_code: sourceCode,
    language_id: languageId,
    stdin,
  });
  return response.data;
};
