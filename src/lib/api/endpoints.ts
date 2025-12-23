/**
 * API Endpoints Configuration
 * This file contains all API endpoint definitions for the application
 */

// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/api-users';

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
export const loginEndpoint = async (email: string, password: string): Promise<ApiResponse<LoginResponseData>> => {
  const url = `${API_BASE_URL}/auth/login`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      } as LoginRequest),
    });

    const data: ApiResponse<LoginResponseData> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    // Save tokens with timestamp
    if (data.data) {
      saveTokens(data.data);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during login');
  }
};

/**
 * Helper function to get access token from localStorage
 */
const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Helper function to get refresh token from localStorage
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

/**
 * Helper function to check if access token is expired
 */
const isTokenExpired = (): boolean => {
  const expiresIn = localStorage.getItem('expires_in');
  const tokenTimestamp = localStorage.getItem('token_timestamp');
  
  if (!expiresIn || !tokenTimestamp) {
    return true;
  }
  
  const expirationTime = parseInt(tokenTimestamp) + (parseInt(expiresIn) * 1000);
  return Date.now() >= expirationTime;
};

/**
 * Helper function to save tokens to localStorage
 */
const saveTokens = (data: RefreshTokenResponseData | LoginResponseData): void => {
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem('token_type', data.token_type);
  localStorage.setItem('expires_in', data.expires_in.toString());
  localStorage.setItem('refresh_expires_in', data.refresh_expires_in.toString());
  localStorage.setItem('token_timestamp', Date.now().toString());
};

/**
 * Refresh token endpoint - Refreshes the access token using refresh token
 * POST /api/v1/api-users/auth/refresh
 * Sends refresh_token in request body (standard OAuth2 flow)
 * @returns Promise with API response containing new tokens
 */
export const refreshTokenEndpoint = async (): Promise<ApiResponse<RefreshTokenResponseData>> => {
  const url = `${API_BASE_URL}/auth/refresh`;
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    // Try sending refresh_token in body (standard OAuth2 approach)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    const data: ApiResponse<RefreshTokenResponseData> = await response.json();

    if (!response.ok || !data.success) {
      // If body approach fails with 401, try Authorization header approach
      if (response.status === 401) {
        const headerResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`,
          },
        });

        const headerData: ApiResponse<RefreshTokenResponseData> = await headerResponse.json();

        if (!headerResponse.ok || !headerData.success) {
          throw new Error(headerData.message || 'Token refresh failed');
        }

        // Save new tokens
        saveTokens(headerData.data);
        return headerData;
      }
      
      throw new Error(data.message || 'Token refresh failed');
    }

    // Save new tokens
    saveTokens(data.data);
    
    return data;
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('refresh_expires_in');
    localStorage.removeItem('token_timestamp');
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during token refresh');
  }
};

/**
 * Helper function to get authorization headers
 */
const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshPromise: Promise<ApiResponse<RefreshTokenResponseData>> | null = null;

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
  // Check if token is expired and refresh proactively
  if (isTokenExpired() && getRefreshToken() && !isRefreshing) {
    try {
      await refreshTokenEndpoint();
    } catch (error) {
      // If refresh fails, redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // Add auth headers if not already present
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

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
          newHeaders.set('Authorization', `Bearer ${newToken}`);
        }
        if (!newHeaders.has('Content-Type')) {
          newHeaders.set('Content-Type', 'application/json');
        }
        
        return fetch(url, {
          ...options,
          headers: newHeaders,
        });
      } catch (refreshError) {
        isRefreshing = false;
        refreshPromise = null;
        
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('refresh_expires_in');
        localStorage.removeItem('token_timestamp');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        throw refreshError;
      }
    } else {
      // No refresh token available, redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  return response;
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
export const createApiKeyEndpoint = async (): Promise<ApiResponse<CreateApiKeyResponseData>> => {
  const url = `${API_BASE_URL}/auth/api-keys`;
  
  try {
    const response = await apiClient(url, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const data: ApiResponse<CreateApiKeyResponseData> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create API key');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while creating API key');
  }
};

/**
 * List API Keys endpoint - Retrieves all API keys for the authenticated user
 * GET /api/v1/api-users/auth/api-keys
 * @returns Promise with API response containing list of API keys
 */
export const listApiKeysEndpoint = async (): Promise<ApiResponse<ListApiKeysResponseData>> => {
  const url = `${API_BASE_URL}/auth/api-keys`;
  
  try {
    const response = await apiClient(url, {
      method: 'GET',
    });

    const data: ApiResponse<ListApiKeysResponseData> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch API keys');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching API keys');
  }
};

/**
 * Delete API Key endpoint - Revokes an API key by its ID
 * DELETE /api/v1/api-users/auth/api-keys/{key_id}
 * @param keyId - The ID of the API key to revoke
 * @returns Promise with API response
 */
export const deleteApiKeyEndpoint = async (keyId: number | string): Promise<ApiResponse<null>> => {
  const url = `${API_BASE_URL}/auth/api-keys/${keyId}`;
  
  try {
    const response = await apiClient(url, {
      method: 'DELETE',
    });

    const data: ApiResponse<null> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete API key');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while deleting API key');
  }
};

/**
 * API Key Stats Request
 */
export interface ApiKeyStatsRequest {
  key_id: number | null;
  date_from: string | null;
  date_to: string | null;
  consumed_by?: "product_ocr" | "persona_generation_clustering" | "concept_simulation" | "media_simulation" | null;
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
export const getApiKeyStatsEndpoint = async (request: ApiKeyStatsRequest): Promise<ApiResponse<ApiKeyStatsResponseData | OverviewStatsResponseData>> => {
  const url = `${API_BASE_URL}/stats/`;
  
  try {
    const response = await apiClient(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    const data: ApiResponse<ApiKeyStatsResponseData | OverviewStatsResponseData> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch API key stats');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching API key stats');
  }
};

/**
 * Future API endpoints will be added here:
 * 
 * export const registerEndpoint = async (data: RegisterData) => { ... }
 * export const logoutEndpoint = async () => { ... }
 * export const getUserProfileEndpoint = async (userId: string) => { ... }
 * export const updateUserProfileEndpoint = async (userId: string, data: UpdateData) => { ... }
 */

