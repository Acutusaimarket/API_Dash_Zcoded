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
 * Helper function to get authorization headers
 */
const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * API Key data structure
 */
export interface ApiKey {
  id: string;
  key: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_used_at?: string;
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
export const createApiKeyEndpoint = async (): Promise<ApiResponse<ApiKey>> => {
  const url = `${API_BASE_URL}/auth/api-keys`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });

    const data: ApiResponse<ApiKey> = await response.json();

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
export const listApiKeysEndpoint = async (): Promise<ApiResponse<ApiKey[]>> => {
  const url = `${API_BASE_URL}/auth/api-keys`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: ApiResponse<ApiKey[]> = await response.json();

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
export const deleteApiKeyEndpoint = async (keyId: string): Promise<ApiResponse<null>> => {
  const url = `${API_BASE_URL}/auth/api-keys/${keyId}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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
 * Future API endpoints will be added here:
 * 
 * export const registerEndpoint = async (data: RegisterData) => { ... }
 * export const logoutEndpoint = async () => { ... }
 * export const getUserProfileEndpoint = async (userId: string) => { ... }
 * export const updateUserProfileEndpoint = async (userId: string, data: UpdateData) => { ... }
 */

