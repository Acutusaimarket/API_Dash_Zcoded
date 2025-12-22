import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeClosed, Copy, RefreshCircle, Document } from "@solar-icons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import { createApiKeyEndpoint, listApiKeysEndpoint, deleteApiKeyEndpoint, type ApiKey } from "@/lib/api/endpoints";

interface ApiKeyProps {
  onToggleSidebar?: () => void;
}

export function ApiKey({ onToggleSidebar }: ApiKeyProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch API keys on component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listApiKeysEndpoint();
      if (response.data && response.data.length > 0) {
        setApiKeys(response.data);
        setSelectedKey(response.data[0]);
      } else {
        setApiKeys([]);
        setSelectedKey(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch API keys";
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
    try {
      const response = await createApiKeyEndpoint();
      if (response.data) {
        // Add the new key to the list
        setApiKeys((prev) => [response.data, ...prev]);
        setSelectedKey(response.data);
        setIsVisible((prev) => ({ ...prev, [response.data.id]: true }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create API key";
      setError(errorMessage);
      console.error("Error creating API key:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await deleteApiKeyEndpoint(keyId);
      // Remove the deleted key from the list
      setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
      // If the deleted key was selected, select the first remaining key or null
      if (selectedKey?.id === keyId) {
        const remainingKeys = apiKeys.filter((key) => key.id !== keyId);
        setSelectedKey(remainingKeys.length > 0 ? remainingKeys[0] : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete API key";
      setError(errorMessage);
      console.error("Error deleting API key:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = (keyId: string) => {
    setIsVisible((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-9 w-9 rounded-md hover:bg-muted -ml-1"
        >
          <div className="flex items-center gap-1">
            <Document size={18} className="text-foreground" />
            <div className="w-px h-4 bg-border/60" />
          </div>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage your API keys for accessing the API endpoints.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>
                Keep your API keys secure and never share them publicly
              </CardDescription>
            </div>
            <Button 
              variant="default" 
              onClick={handleGenerateNew}
              disabled={isCreating || isLoading}
            >
              <RefreshCircle size={18} className="mr-2" />
              {isCreating ? "Creating..." : "Generate New Key"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading API keys...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No API keys found.</p>
              <Button onClick={handleGenerateNew} disabled={isCreating}>
                <RefreshCircle size={18} className="mr-2" />
                Create Your First API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => {
                const isKeyVisible = isVisible[key.id];
                const isKeyCopied = copied === key.key;
                const isSelected = selectedKey?.id === key.id;

                return (
                  <Card key={key.id} className={isSelected ? "border-primary" : ""}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`api-key-${key.id}`}>API Key</Label>
                          <div className="flex items-center gap-2">
                            <Badge variant={key.is_active ? "default" : "secondary"} className="mr-2">
                              {key.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedKey(key)}
                              className={isSelected ? "bg-muted" : ""}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(key.id)}
                              disabled={isLoading}
                              className="text-destructive hover:text-destructive"
                            >
                              <HugeiconsIcon icon={Delete01Icon} size={16} />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id={`api-key-${key.id}`}
                            type={isKeyVisible ? "text" : "password"}
                            value={key.key}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            onClick={() => toggleVisibility(key.id)}
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
                          <Button
                            variant="outline"
                            onClick={() => handleCopy(key.key)}
                          >
                            <Copy size={18} className="mr-2" />
                            {isKeyCopied ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(key.created_at).toLocaleString()}
                          {key.last_used_at && (
                            <> • Last used: {new Date(key.last_used_at).toLocaleString()}</>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {selectedKey && (
            <>
              <Separator />
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium mb-2">Usage Instructions</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Include your API key in the Authorization header of your requests:
                </p>
                <code className="block mt-2 p-2 bg-background rounded text-xs">
                  Authorization: Bearer {selectedKey.key.substring(0, 20)}...
                </code>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

