/**
 * API Configuration
 * Central point for API URL logic to avoid "Failed to fetch" on production.
 */

// Logic to determine the correct API URL
const getApiUrl = () => {
    // 1. Priority: Environment Variable (Injected at build time)
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        // Ensure no trailing slash and append /api if missing
        const cleanUrl = envUrl.replace(/\/$/, "");
        return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
    }

    // 2. Fallback: Production Domain (Explicit)
    if (window.location.hostname.includes("yoviajo.com.ar")) {
        return "https://api.yoviajo.com.ar/api";
    }

    // 3. Fallback: Render Subdomain (If testing on .onrender.com)
    if (window.location.hostname.includes("onrender.com")) {
        return "https://yoviajo-backend.onrender.com/api";
    }

    // 4. Fallback: Localhost default
    return "http://localhost:8003/api";
};

export const API_URL = getApiUrl();
console.log("🔌 API Configured to:", API_URL);
