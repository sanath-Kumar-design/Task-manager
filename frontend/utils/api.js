export const getBaseURL = () => {
  const hostname = window.location.hostname;
  if (hostname === "localhost") return "http://localhost:5000";      // laptop
  if (hostname.startsWith("192.168.")) return `http://${hostname}:5000`; // mobile
  return import.meta.env.VITE_API_URL;  // fallback for production
};
