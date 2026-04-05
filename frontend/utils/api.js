export const getBaseURL = () => {
  const hostname = window.location.hostname;

  if (hostname === "localhost") {
    return "http://localhost:5000";
  }

  return `http://${hostname}:5000`;
};