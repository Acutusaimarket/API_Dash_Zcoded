/**
 * API Endpoints Configuration
 * This file contains all API endpoint definitions for the application
 */

// API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.zcoded.acutusai.com/api/v1/api-users";

/**
 * Type definitions for API requests and responses
 */

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// User data structure
export interface User {
  created_at: string;
  updated_at: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  total_credits: number;
  credits_consumed: number;
  id: string;
}

// Login Response Data
export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user: User;
}

// Refresh Token Response Data
export interface RefreshTokenResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

/**
 * Login endpoint - Authenticates user with email and password
 * POST /api/v1/api-users/auth/login
 * @param email - User email address
 * @param password - User password
 * @returns Promise with API response containing user data and tokens
 */
export const loginEndpoint = async (
  email: string,
  password: string
): Promise<ApiResponse<LoginResponseData>> => {
  const url = `${API_BASE_URL}/auth/login`;

  try {
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        } as LoginRequest),
      });
    } catch (fetchError) {
      if (
        fetchError instanceof TypeError &&
        fetchError.message.includes("fetch")
      ) {
        throw new ApiError(
          "Network error: Unable to connect to the server. Please check your internet connection and try again.",
          0,
          fetchError
        );
      }
      throw fetchError;
    }

    let data: ApiResponse<LoginResponseData>;
    try {
      const responseText = await response.text();
      if (!responseText) {
        throw new ApiError("Empty response from server", response.status);
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new ApiError(
          "Invalid response from server. Please try again later.",
          response.status,
          parseError
        );
      }
      throw parseError;
    }

    if (!response.ok) {
      const errorMessage =
        data?.message || `Login failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    if (!data.success) {
      throw new ApiError(data.message || "Login failed", response.status, data);
    }

    // Save tokens with timestamp
    if (data.data) {
      saveTokens(data.data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError(
      "An unexpected error occurred during login",
      undefined,
      error
    );
  }
};

/**
 * Helper function to get access token from localStorage
 */
const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

/**
 * Helper function to get refresh token from localStorage
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem("refresh_token");
};

/**
 * Helper function to check if access token is expired
 */
const isTokenExpired = (): boolean => {
  const expiresIn = localStorage.getItem("expires_in");
  const tokenTimestamp = localStorage.getItem("token_timestamp");

  if (!expiresIn || !tokenTimestamp) {
    return true;
  }

  const expirationTime = parseInt(tokenTimestamp) + parseInt(expiresIn) * 1000;
  return Date.now() >= expirationTime;
};

/**
 * Helper function to save tokens to localStorage
 */
const saveTokens = (
  data: RefreshTokenResponseData | LoginResponseData
): void => {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("token_type", data.token_type);
  localStorage.setItem("expires_in", data.expires_in.toString());
  localStorage.setItem(
    "refresh_expires_in",
    data.refresh_expires_in.toString()
  );
  localStorage.setItem("token_timestamp", Date.now().toString());
};

/**
 * Refresh token endpoint - Refreshes the access token using refresh token
 * POST /api/v1/api-users/auth/refresh
 * Sends refresh_token in request body (standard OAuth2 flow)
 * @returns Promise with API response containing new tokens
 */
export const refreshTokenEndpoint = async (): Promise<
  ApiResponse<RefreshTokenResponseData>
> => {
  const url = `${API_BASE_URL}/auth/refresh`;
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new ApiError("No refresh token available. Please login again.", 401);
  }

  try {
    let response: Response;
    try {
      // Try sending refresh_token in body (standard OAuth2 approach)
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });
    } catch (fetchError) {
      if (
        fetchError instanceof TypeError &&
        fetchError.message.includes("fetch")
      ) {
        throw new ApiError(
          "Network error: Unable to connect to the server. Please check your internet connection and try again.",
          0,
          fetchError
        );
      }
      throw fetchError;
    }

    let data: ApiResponse<RefreshTokenResponseData>;
    try {
      const responseText = await response.text();
      if (!responseText) {
        throw new ApiError("Empty response from server", response.status);
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new ApiError(
          "Invalid response from server. Please try again later.",
          response.status,
          parseError
        );
      }
      throw parseError;
    }

    if (!response.ok || !data.success) {
      // If body approach fails with 401, try Authorization header approach
      if (response.status === 401) {
        let headerResponse: Response;
        try {
          headerResponse = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshToken}`,
            },
          });
        } catch (headerFetchError) {
          if (
            headerFetchError instanceof TypeError &&
            headerFetchError.message.includes("fetch")
          ) {
            throw new ApiError(
              "Network error: Unable to connect to the server. Please check your internet connection and try again.",
              0,
              headerFetchError
            );
          }
          throw headerFetchError;
        }

        let headerData: ApiResponse<RefreshTokenResponseData>;
        try {
          const headerResponseText = await headerResponse.text();
          if (!headerResponseText) {
            throw new ApiError(
              "Empty response from server",
              headerResponse.status
            );
          }
          headerData = JSON.parse(headerResponseText);
        } catch (headerParseError) {
          if (headerParseError instanceof SyntaxError) {
            throw new ApiError(
              "Invalid response from server. Please try again later.",
              headerResponse.status,
              headerParseError
            );
          }
          throw headerParseError;
        }

        if (!headerResponse.ok || !headerData.success) {
          const errorMessage = headerData?.message || "Token refresh failed";
          throw new ApiError(errorMessage, headerResponse.status, headerData);
        }

        // Save new tokens
        saveTokens(headerData.data);
        return headerData;
      }

      const errorMessage = data?.message || "Token refresh failed";
      throw new ApiError(errorMessage, response.status, data);
    }

    // Save new tokens
    saveTokens(data.data);

    return data;
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("expires_in");
    localStorage.removeItem("refresh_expires_in");
    localStorage.removeItem("token_timestamp");

    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError(
      "An unexpected error occurred during token refresh",
      undefined,
      error
    );
  }
};

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshPromise: Promise<ApiResponse<RefreshTokenResponseData>> | null =
  null;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * API client wrapper that automatically handles token refresh on 401 errors
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @param retryCount - Internal retry counter (default: 0)
 * @returns Promise with the fetch response
 */
export const apiClient = async (
  url: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<Response> => {
  try {
    // Check if token is expired and refresh proactively
    if (isTokenExpired() && getRefreshToken() && !isRefreshing) {
      try {
        await refreshTokenEndpoint();
      } catch (error) {
        // If refresh fails, redirect to login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw error;
      }
    }

    // Add auth headers if not already present
    const headers = new Headers(options.headers);
    const token = getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (fetchError) {
      // Handle network errors
      if (
        fetchError instanceof TypeError &&
        fetchError.message.includes("fetch")
      ) {
        throw new ApiError(
          "Network error: Unable to connect to the server. Please check your internet connection and try again.",
          0,
          fetchError
        );
      }
      throw fetchError;
    }

    // Handle 401 Unauthorized - token expired
    if (response.status === 401 && retryCount < 1) {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        // Prevent multiple simultaneous refresh requests
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshTokenEndpoint();
        }

        try {
          await refreshPromise;
          isRefreshing = false;
          refreshPromise = null;

          // Retry the original request with new token
          const newHeaders = new Headers(options.headers);
          const newToken = getAccessToken();
          if (newToken) {
            newHeaders.set("Authorization", `Bearer ${newToken}`);
          }
          if (!newHeaders.has("Content-Type")) {
            newHeaders.set("Content-Type", "application/json");
          }

          try {
            return await fetch(url, {
              ...options,
              headers: newHeaders,
            });
          } catch (retryError) {
            if (
              retryError instanceof TypeError &&
              retryError.message.includes("fetch")
            ) {
              throw new ApiError(
                "Network error: Unable to connect to the server. Please check your internet connection and try again.",
                0,
                retryError
              );
            }
            throw retryError;
          }
        } catch (refreshError) {
          isRefreshing = false;
          refreshPromise = null;

          // Clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("token_type");
          localStorage.removeItem("expires_in");
          localStorage.removeItem("refresh_expires_in");
          localStorage.removeItem("token_timestamp");

          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }

          throw refreshError;
        }
      } else {
        // No refresh token available, redirect to login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw new ApiError("Session expired. Please login again.", 401);
      }
    }

    return response;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    // Wrap other errors
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError("An unexpected error occurred", undefined, error);
  }
};

/**
 * API Key data structure (from list endpoint)
 */
export interface ApiKeyListItem {
  id: number;
  label: string;
  masked_suffix: string;
}

/**
 * API Key data structure (for display in component)
 * Combines list item with optional full key (only available when just created)
 */
export interface ApiKey {
  id: number | string;
  label: string;
  masked_suffix: string;
  key?: string; // Only available when just created
}

/**
 * List API Keys Response Data
 */
export interface ListApiKeysResponseData {
  keys: ApiKeyListItem[];
  total: number;
  max_allowed: number;
}

/**
 * Create API Key Response Data
 */
export interface CreateApiKeyResponseData {
  api_key: string;
  total_keys: number;
  max_allowed: number;
}

/**
 * Create API Key Request
 */
export interface CreateApiKeyRequest {
  access_token?: string;
}

/**
 * Delete API Key Request
 */
export interface DeleteApiKeyRequest {
  key_id: string;
}

/**
 * Create API Key endpoint - Creates a new API key for the authenticated user
 * POST /api/v1/api-users/auth/api-keys
 * @returns Promise with API response containing the new API key
 */
export const createApiKeyEndpoint = async (): Promise<
  ApiResponse<CreateApiKeyResponseData>
> => {
  const url = `${API_BASE_URL}/auth/api-keys`;

  try {
    const response = await apiClient(url, {
      method: "POST",
      body: JSON.stringify({}),
    });

    let data: ApiResponse<CreateApiKeyResponseData>;
    try {
      const responseText = await response.text();
      if (!responseText) {
        throw new ApiError("Empty response from server", response.status);
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new ApiError(
          "Invalid response from server. Please try again later.",
          response.status,
          parseError
        );
      }
      throw parseError;
    }

    if (!response.ok) {
      const errorMessage =
        data?.message || `Failed to create API key (status ${response.status})`;
      throw new ApiError(errorMessage, response.status, data);
    }

    if (!data.success) {
      throw new ApiError(
        data.message || "Failed to create API key",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError(
      "An unexpected error occurred while creating API key",
      undefined,
      error
    );
  }
};

/**
 * List API Keys endpoint - Retrieves all API keys for the authenticated user
 * GET /api/v1/api-users/auth/api-keys
 * @returns Promise with API response containing list of API keys
 */
export const listApiKeysEndpoint = async (): Promise<
  ApiResponse<ListApiKeysResponseData>
> => {
  const url = `${API_BASE_URL}/auth/api-keys`;

  try {
    const response = await apiClient(url, {
      method: "GET",
    });

    let data: ApiResponse<ListApiKeysResponseData>;
    try {
      const responseText = await response.text();
      if (!responseText) {
        throw new ApiError("Empty response from server", response.status);
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new ApiError(
          "Invalid response from server. Please try again later.",
          response.status,
          parseError
        );
      }
      throw parseError;
    }

    if (!response.ok) {
      const errorMessage =
        data?.message || `Failed to fetch API keys (status ${response.status})`;
      throw new ApiError(errorMessage, response.status, data);
    }

    if (!data.success) {
      throw new ApiError(
        data.message || "Failed to fetch API keys",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError(
      "An unexpected error occurred while fetching API keys",
      undefined,
      error
    );
  }
};

/**
 * Delete API Key endpoint - Revokes an API key by its ID
 * DELETE /api/v1/api-users/auth/api-keys/{key_id}
 * @param keyId - The ID of the API key to revoke
 * @returns Promise with API response
 */
export const deleteApiKeyEndpoint = async (
  keyId: number | string
): Promise<ApiResponse<null>> => {
  const url = `${API_BASE_URL}/auth/api-keys/${keyId}`;

  try {
    const response = await apiClient(url, {
      method: "DELETE",
    });

    let data: ApiResponse<null>;
    try {
      const responseText = await response.text();
      if (!responseText) {
        throw new ApiError("Empty response from server", response.status);
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new ApiError(
          "Invalid response from server. Please try again later.",
          response.status,
          parseError
        );
      }
      throw parseError;
    }

    if (!response.ok) {
      const errorMessage =
        data?.message || `Failed to delete API key (status ${response.status})`;
      throw new ApiError(errorMessage, response.status, data);
    }

    if (!data.success) {
      throw new ApiError(
        data.message || "Failed to delete API key",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError(
      "An unexpected error occurred while deleting API key",
      undefined,
      error
    );
  }
};

/**
 * API Key Stats Request
 */
export interface ApiKeyStatsRequest {
  key_id: number | null;
  date_from: string | null;
  date_to: string | null;
  consumed_by?:
    | "product_ocr"
    | "persona_generation_clustering"
    | "concept_simulation"
    | "media_simulation"
    | null;
  granularity?: "daily" | "weekly" | "monthly";
  include_chart_data?: boolean;
  charts_only?: boolean;
}

/**
 * Time Series Data Point
 */
export interface TimeSeriesDataPoint {
  date: string;
  credits: number;
  records: number;
}

/**
 * Time Series by Type Data Point
 */
export interface TimeSeriesByTypeDataPoint {
  date: string;
  credits_by_type: {
    [key: string]: number;
  };
  total_credits: number;
}

/**
 * Cumulative Totals Data Point
 */
export interface CumulativeTotalsDataPoint {
  date: string;
  credits: number;
  records: number;
}

/**
 * Chart Data
 */
export interface ChartData {
  time_series: TimeSeriesDataPoint[];
  time_series_by_type: TimeSeriesByTypeDataPoint[];
  cumulative_totals: CumulativeTotalsDataPoint[];
}

/**
 * Individual API Key Stats Data
 */
export interface ApiKeyStatsItem {
  key_id: number;
  masked_suffix: string;
  total_credits_used: number;
  total_records: number;
  credits_by_consumed_by: {
    [key: string]: number;
  };
  records_by_consumed_by: {
    [key: string]: number;
  };
  average_credits_per_record: number;
  chart_data: ChartData;
}

/**
 * API Key Stats Response Data (for single key)
 */
export interface ApiKeyStatsResponseData {
  key_id: number | null;
  masked_suffix: string;
  total_credits_used: number;
  total_records: number;
  credits_by_consumed_by: {
    [key: string]: number;
  };
  records_by_consumed_by: {
    [key: string]: number;
  };
  average_credits_per_record: number;
  chart_data: ChartData;
}

/**
 * Overview Stats Response Data (for all keys)
 */
export interface OverviewStatsResponseData {
  keys: ApiKeyStatsItem[];
}

/**
 * Get API Key Stats endpoint - Retrieves statistics for API keys
 * POST /api/v1/api-users/stats/
 * @param request - Stats request parameters
 * @returns Promise with API response containing stats data (single key or overview with keys array)
 */
export const getApiKeyStatsEndpoint = async (
  request: ApiKeyStatsRequest
): Promise<
  ApiResponse<ApiKeyStatsResponseData | OverviewStatsResponseData>
> => {
  const url = `${API_BASE_URL}/stats/`;

  try {
    const response = await apiClient(url, {
      method: "POST",
      body: JSON.stringify(request),
    });

    let data: ApiResponse<ApiKeyStatsResponseData | OverviewStatsResponseData>;
    try {
      const responseText = await response.text();
      if (!responseText) {
        throw new ApiError("Empty response from server", response.status);
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new ApiError(
          "Invalid response from server. Please try again later.",
          response.status,
          parseError
        );
      }
      throw parseError;
    }

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        `Failed to fetch API key stats (status ${response.status})`;
      throw new ApiError(errorMessage, response.status, data);
    }

    if (!data.success) {
      throw new ApiError(
        data.message || "Failed to fetch API key stats",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError(
      "An unexpected error occurred while fetching API key stats",
      undefined,
      error
    );
  }
};

/**
 * Subscription Plan Pricing
 */
export interface SubscriptionPlanPricing {
  monthly: number | null;
  yearly: number | null;
  currency: string;
}

/**
 * Additional Credits Pricing
 */
export interface AdditionalCreditsPricing {
  credits: number;
  price: number;
  currency: string;
}

/**
 * Subscription Plan Data
 */
export interface SubscriptionPlan {
  _id: string;
  name: string;
  plan_type: string;
  pricing: SubscriptionPlanPricing[];
  max_users: number;
  features: string[];
  credits: number;
  api_access: boolean;
  priority_support: boolean;
  no_of_parallel_simulations: number;
  has_restrictions: boolean;
  is_persona_generation_limited: boolean;
  is_media_simulation_limited: boolean;
  is_concept_simulation_limited: boolean;
  is_chat_simulation_limited: boolean;
  persona_count_limit: number;
  concept_count_limit: number;
  media_count_limit: number;
  chat_count_limit: number;
  associated_user_id: string;
  additional_credits_pricing: AdditionalCreditsPricing[];
  created_at: string;
  updated_at: string;
}

/**
 * Get Plan Associated With User endpoint - Retrieves the subscription plan associated with the authenticated user
 * GET /api/v1/subscription/plan/associated-with-user
 * @returns Promise with API response containing subscription plan data
 */
export const getSubscriptionPlanEndpoint = async (): Promise<
  ApiResponse<SubscriptionPlan>
> => {
  // Construct base URL for subscription endpoint
  // If VITE_API_BASE_URL is like 'https://api.zcoded.acutusai.com/api/v1/api-users',
  // we need to get 'https://api.zcoded.acutusai.com/api/v1' and append '/subscription/plan/associated-with-user'
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.zcoded.acutusai.com/api/v1/api-users";
  // Remove '/api-users' if present, or use the base URL if it already ends with '/api/v1'
  const apiBaseUrl =
    baseUrl.replace(/\/api-users\/?$/, "") ||
    "https://api.zcoded.acutusai.com/api/v1";
  const url = `${apiBaseUrl}/subscription/plan/associated-with-user`;

  try {
    const response = await apiClient(url, {
      method: "GET",
    });

    let data: ApiResponse<SubscriptionPlan>;
    try {
      const responseText = await response.text();
      if (!responseText) {
        throw new ApiError("Empty response from server", response.status);
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new ApiError(
          "Invalid response from server. Please try again later.",
          response.status,
          parseError
        );
      }
      throw parseError;
    }

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        `Failed to fetch subscription plan (status ${response.status})`;
      throw new ApiError(errorMessage, response.status, data);
    }

    if (!data.success) {
      throw new ApiError(
        data.message || "Failed to fetch subscription plan",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError(
      "An unexpected error occurred while fetching subscription plan",
      undefined,
      error
    );
  }
};

/**
 * Subscription Checkout Request
 */
export interface SubscriptionCheckoutRequest {
  plan_id: string;
  billing_cycle?: string;
  currency: string;
}

/**
 * Subscription Checkout Response Data
 */
export interface SubscriptionCheckoutResponseData {
  razorpay_key_id: string;
  subscription_id: string;
  customer_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  billing_cycle: string;
}

/**
 * Create Subscription Checkout endpoint - Creates a checkout session for subscription
 * POST /api/v1/subscription/checkout
 * @param plan_id - The subscription plan ID
 * @param billing_cycle - The billing cycle (monthly or yearly), optional
 * @param currency - The currency code (e.g., "INR")
 * @returns Promise with API response containing checkout data
 */
export const createSubscriptionCheckoutEndpoint = async (
  plan_id: string,
  billing_cycle: string | null,
  currency: string
): Promise<ApiResponse<SubscriptionCheckoutResponseData>> => {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.zcoded.acutusai.com/api/v1/api-users";
  const apiBaseUrl =
    baseUrl.replace(/\/api-users\/?$/, "") ||
    "https://api.zcoded.acutusai.com/api/v1";
  const url = `${apiBaseUrl}/subscription/checkout`;

  try {
    // Build request body - only include billing_cycle if it's not null
    const requestBody: SubscriptionCheckoutRequest = {
      plan_id,
      currency,
    };

    if (billing_cycle !== null && billing_cycle !== undefined) {
      requestBody.billing_cycle = billing_cycle;
    }

    const response = await apiClient(url, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    let data: ApiResponse<SubscriptionCheckoutResponseData>;
    try {
      const responseText = await response.text();
      if (!responseText) {
        throw new ApiError("Empty response from server", response.status);
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new ApiError(
          "Invalid response from server. Please try again later.",
          response.status,
          parseError
        );
      }
      throw parseError;
    }

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        `Failed to create subscription checkout (status ${response.status})`;
      throw new ApiError(errorMessage, response.status, data);
    }

    if (!data.success) {
      throw new ApiError(
        data.message || "Failed to create subscription checkout",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError(
      "An unexpected error occurred while creating subscription checkout",
      undefined,
      error
    );
  }
};

/**
 * Refresh User Data endpoint - Fetches fresh user data from login endpoint
 * POST /api/v1/api-users/auth/login
 * Uses stored email and password from sessionStorage to refresh user data
 * @returns Promise with API response containing fresh user data and tokens
 */
export const refreshUserDataEndpoint = async (): Promise<
  ApiResponse<LoginResponseData>
> => {
  const email = localStorage.getItem("userEmail");
  const password = sessionStorage.getItem("userPassword");

  if (!email || !password) {
    throw new ApiError("Email or password not found. Please login again.", 401);
  }

  return loginEndpoint(email, password);
};

/**
 * Future API endpoints will be added here:
 *
 * export const registerEndpoint = async (data: RegisterData) => { ... }
 * export const logoutEndpoint = async () => { ... }
 * export const getUserProfileEndpoint = async (userId: string) => { ... }
 * export const updateUserProfileEndpoint = async (userId: string, data: UpdateData) => { ... }
 */
