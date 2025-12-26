import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeClosed, Copy, RefreshCircle } from "@solar-icons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import {
  createApiKeyEndpoint,
  listApiKeysEndpoint,
  deleteApiKeyEndpoint,
  type ApiKey,
  ApiError,
} from "@/lib/api/endpoints";

export function ApiKey() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalKeys, setTotalKeys] = useState(0);
  const [maxAllowed, setMaxAllowed] = useState(5);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Fetch API keys on component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listApiKeysEndpoint();
      if (
        response.data &&
        response.data.keys &&
        response.data.keys.length > 0
      ) {
        // Convert ApiKeyListItem[] to ApiKey[] (without full key, only masked)
        const keys: ApiKey[] = response.data.keys.map((item) => ({
          id: item.id,
          label: item.label,
          masked_suffix: item.masked_suffix,
        }));
        setApiKeys(keys);
        setTotalKeys(response.data.total);
        setMaxAllowed(response.data.max_allowed);
      } else {
        setApiKeys([]);
        setTotalKeys(0);
        if (response.data) {
          setMaxAllowed(response.data.max_allowed || 5);
        }
      }
    } catch (err) {
      let errorMessage = "Failed to fetch API keys";
      if (err instanceof ApiError) {
        errorMessage = err.message;
        // Handle specific error cases
        if (err.status === 401) {
          errorMessage = "Session expired. Please refresh the page.";
        } else if (err.status === 0) {
          errorMessage =
            "Network error: Unable to connect to the server. Please check your internet connection.";
        } else if (err.status && err.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Error fetching API keys:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerateNew = async () => {
    setIsCreating(true);
    setError(null);
    setNewlyCreatedKey(null);
    try {
      const response = await createApiKeyEndpoint();
      if (response.data && response.data.api_key) {
        const fullKey = response.data.api_key;

        // Store the newly created key to show it prominently
        setNewlyCreatedKey(fullKey);
        setTotalKeys(response.data.total_keys);
        setMaxAllowed(response.data.max_allowed);

        // Refetch the list to get the updated keys from the server
        await fetchApiKeys();

        // Note: The newly created key will remain visible until user dismisses it
        // This ensures users have time to copy the key securely
      }
    } catch (err) {
      let errorMessage = "Failed to create API key";
      if (err instanceof ApiError) {
        errorMessage = err.message;
        // Handle specific error cases
        if (err.status === 401) {
          errorMessage = "Session expired. Please refresh the page.";
        } else if (err.status === 0) {
          errorMessage =
            "Network error: Unable to connect to the server. Please check your internet connection.";
        } else if (err.status === 403) {
          errorMessage =
            "You have reached the maximum number of API keys allowed.";
        } else if (err.status && err.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Error creating API key:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (keyId: number | string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await deleteApiKeyEndpoint(keyId);
      // Remove the deleted key from the list
      setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
      // Refetch to update the total count
      fetchApiKeys();
    } catch (err) {
      let errorMessage = "Failed to delete API key";
      if (err instanceof ApiError) {
        errorMessage = err.message;
        // Handle specific error cases
        if (err.status === 401) {
          errorMessage = "Session expired. Please refresh the page.";
        } else if (err.status === 0) {
          errorMessage =
            "Network error: Unable to connect to the server. Please check your internet connection.";
        } else if (err.status === 404) {
          errorMessage = "API key not found. It may have already been deleted.";
        } else if (err.status && err.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Error deleting API key:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = (keyId: number | string) => {
    setIsVisible((prev) => ({
      ...prev,
      [String(keyId)]: !prev[String(keyId)],
    }));
  };

  // Helper function to get display value for a key
  const getKeyDisplayValue = (key: ApiKey): string => {
    if (key.key) {
      // Full key is available (just created)
      return key.key;
    }
    // Only masked suffix available, show masked format with dots prefix
    return `........${key.masked_suffix}`;
  };

  return (
    <div className="space-y-6">
      <div className="dashboard-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e5e5e5] dark:border-[#1f1f1f]">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-1">
            API Keys
          </h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">
            Manage your API keys for accessing the API endpoints
          </p>
        </div>
        <Button
          variant="default"
          onClick={handleGenerateNew}
          disabled={isCreating || isLoading || totalKeys >= maxAllowed}
          className="bg-[#00c950] hover:bg-[#00b045] text-white font-medium shadow-sm"
        >
          <RefreshCircle size={18} className="mr-2" />
          {isCreating
            ? "Creating..."
            : totalKeys >= maxAllowed
            ? `Limit Reached (${maxAllowed})`
            : "Generate New Key"}
        </Button>
      </div>

      {error && (
        <div className="animate-fade-in-up rounded-lg bg-[#ef4444]/10 dark:bg-[#ef4444]/20 border border-[#ef4444]/20 p-4 text-sm text-[#ef4444] font-medium">
          {error}
        </div>
      )}

      {newlyCreatedKey && (
        <Card
          size="sm"
          className="animate-scale-in border-[#00c950] bg-[#00c950]/5 dark:bg-[#00c950]/10 shadow-sm"
        >
          <CardHeader className="border-b border-[#00c950]/20 pb-3">
            <CardTitle className="text-[#00c950] dark:text-[#00c950] text-base font-semibold">
              ✅ API Key Created Successfully!
            </CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#999999] mt-1 text-xs">
              This is the only time you'll see the full API key. Make sure to
              copy and store it securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newlyCreatedKey}
                readOnly
                className="font-mono text-sm bg-white dark:bg-[#0a0a0a] border-[#e5e5e5] dark:border-[#1f1f1f] text-black dark:text-white"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(newlyCreatedKey);
                  setCopied(newlyCreatedKey);
                  setTimeout(() => setCopied(null), 2000);
                }}
                className="border-[#00c950] text-[#00c950] hover:bg-[#00c950]/10 dark:hover:bg-[#00c950]/20"
              >
                <Copy size={18} className="mr-2" />
                {copied === newlyCreatedKey ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setNewlyCreatedKey(null)}
                className="hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] text-black dark:text-white"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card
        size="sm"
        className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm"
      >
        <CardContent className="pt-4">
          <div className="space-y-4">
            {isLoading && apiKeys.length === 0 ? (
              <div className="animate-fade-in text-center py-12 text-[#666666] dark:text-[#999999]">
                Loading API keys...
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="animate-fade-in-up text-center py-12">
                <p className="mb-4 text-[#666666] dark:text-[#999999]">
                  No API keys found.
                </p>
                <Button
                  onClick={handleGenerateNew}
                  disabled={isCreating || totalKeys >= maxAllowed}
                  className="bg-[#00c950] hover:bg-[#00b045] text-white font-medium shadow-sm"
                >
                  <RefreshCircle size={18} className="mr-2" />
                  {totalKeys >= maxAllowed
                    ? `Limit Reached (${maxAllowed})`
                    : "Create Your First API Key"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key, index) => {
                  const keyIdStr = String(key.id);
                  const isKeyVisible = isVisible[keyIdStr];
                  const displayValue = getKeyDisplayValue(key);
                  const hasFullKey = !!key.key;

                  // Staggered animation delay
                  const delayClass =
                    index === 0
                      ? "animate-delay-100"
                      : index === 1
                      ? "animate-delay-200"
                      : index === 2
                      ? "animate-delay-300"
                      : index === 3
                      ? "animate-delay-400"
                      : index === 4
                      ? "animate-delay-500"
                      : "animate-delay-600";

                  return (
                    <div
                      key={keyIdStr}
                      className={`animate-fade-in-up ${delayClass} space-y-3 p-4 rounded-lg border border-[#e5e5e5] dark:border-[#1f1f1f] bg-[#fafafa] dark:bg-[#111111]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="default"
                            className="bg-[#00c950] text-white font-medium"
                          >
                            Active
                          </Badge>
                          {key.label && (
                            <span className="text-sm text-[#666666] dark:text-[#999999]">
                              {key.label}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(key.id)}
                          disabled={isLoading}
                          className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={16} />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id={`api-key-${keyIdStr}`}
                          type={
                            hasFullKey
                              ? isKeyVisible
                                ? "text"
                                : "password"
                              : "text"
                          }
                          value={displayValue}
                          readOnly
                          className="font-mono text-sm bg-white dark:bg-[#0a0a0a] border-[#e5e5e5] dark:border-[#1f1f1f] text-black dark:text-white"
                        />
                        {hasFullKey && (
                          <Button
                            variant="outline"
                            onClick={() => toggleVisibility(key.id)}
                            className="border-[#e5e5e5] dark:border-[#1f1f1f] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] text-black dark:text-white"
                          >
                            {isKeyVisible ? (
                              <>
                                <EyeClosed size={18} className="mr-2" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye size={18} className="mr-2" />
                                Show
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => handleCopy(displayValue)}
                          className="border-[#e5e5e5] dark:border-[#1f1f1f] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] text-black dark:text-white"
                        >
                          <Copy size={18} className="mr-2" />
                          {copied === displayValue ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      {hasFullKey && (
                        <div className="rounded-lg bg-[#fbbf24]/10 dark:bg-[#fbbf24]/20 border border-[#fbbf24]/20 p-3 text-sm text-[#92400e] dark:text-[#fbbf24]">
                          ⚠️ This is the only time you'll see the full API key.
                          Make sure to copy and store it securely.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
