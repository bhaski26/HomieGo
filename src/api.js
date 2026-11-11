const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const TOKEN_KEY = "hgAccessToken";

function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setAccessToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

function clearAccessToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request(endpoint, options = {}) {
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  const token = getAccessToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Unable to connect to HomieGo server.",
      0
    );
  }

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const detail = data?.detail;

    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail || "Something went wrong.";

    throw new ApiError(message, response.status);
  }

  return data;
}

export const api = {
  // ----------------------------------------
  // AUTHENTICATION
  // ----------------------------------------

  auth: {
    async register(payload) {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setAccessToken(data.access_token);

      return data;
    },

    async login(payload) {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setAccessToken(data.access_token);

      return data;
    },

    async me() {
      return request("/profiles/me");
    },

    logout() {
      clearAccessToken();
    },

    isAuthenticated() {
      return Boolean(getAccessToken());
    },
  },

  // ----------------------------------------
  // USER PROFILES
  // ----------------------------------------

  profiles: {
    // Retrieve the authenticated user's profile
    me() {
      return request("/profiles/me");
    },

    // Update the authenticated user's profile
    update(payload) {
      return request("/profiles/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },

    // Discover other user profiles
    discover(params = {}) {
      const query = new URLSearchParams(params);

      return request(`/discover?${query.toString()}`);
    },
  },

  // ----------------------------------------
  // PROPERTY LISTINGS
  // ----------------------------------------

  properties: {
    list(params = {}) {
      const query = new URLSearchParams(params);

      return request(`/properties?${query.toString()}`);
    },

    create(payload) {
      return request("/properties", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },

  // ----------------------------------------
  // CONNECTIONS
  // ----------------------------------------

  connections: {
    send(recipientId) {
      return request(`/connections/${recipientId}`, {
        method: "POST",
      });
    },
  },
};

// ----------------------------------------
// TOKEN UTILITIES
// ----------------------------------------

export {
  getAccessToken,
  clearAccessToken,
};