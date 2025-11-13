// When using Vite's proxy in development, we don't need the full URL
// In production, we use the Render backend URLs
const API_URL = import.meta.env.DEV ? "" : "https://saajjewels.onrender.com";

export async function fetchApi(endpoint, options = {}) {
  // Determine which URL to use based on the endpoint
  let baseURL = API_URL;
  if (endpoint.startsWith("/api/razorpay")) {
    baseURL = RAZORPAY_URL;
  }

  // Get admin token from localStorage for admin endpoints
  const isAdminEndpoint = endpoint.startsWith("/api/admin") || 
                         endpoint.startsWith("/api/orders") || 
                         endpoint.startsWith("/api/admin/customers");
  const adminToken = isAdminEndpoint ? localStorage.getItem("adminToken") : null;
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      // Include admin token for admin endpoints if available
      ...(isAdminEndpoint && adminToken ? { "x-admin-token": adminToken } : {})
    },
  };

  try {
    console.log(`Making request to: ${baseURL}${endpoint}`);
    
    const res = await fetch(`${baseURL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    });

    // Try to parse JSON safely
    let data = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      // Better error handling to avoid [object Object] errors
      let message = `HTTP error ${res.status}`;
      
      if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else if (data.message) {
          message = data.message;
        } else if (typeof data === 'object') {
          // Check if it's a MongoDB validation error
          if (data.errors) {
            const errorMessages = Object.values(data.errors).map(err => err.message);
            message = errorMessages.join(', ');
          } else {
            // Convert object to string representation
            message = JSON.stringify(data);
          }
        }
      }
      
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.error("API Error:", err);
    
    // Better error handling for network issues
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error("Network error - please check your connection and ensure the backend server is running on port 8000");
    } else if (err instanceof Error) {
      throw new Error(err.message || "Network error - please check your connection");
    } else if (typeof err === 'string') {
      throw new Error(err);
    } else if (typeof err === 'object') {
      // Check if it's a MongoDB validation error
      if (err && err.errors) {
        const errorMessages = Object.values(err.errors).map(e => e.message);
        throw new Error(errorMessages.join(', '));
      }
      throw new Error(JSON.stringify(err));
    } else {
      throw new Error("Network error - please check your connection");
    }
  }
}

export default fetchApi;