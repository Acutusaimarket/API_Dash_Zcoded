import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Login as LoginIcon } from "@solar-icons/react";
import { loginEndpoint } from "@/lib/api/endpoints";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Call the login API endpoint
      const response = await loginEndpoint(email, password);
      
      if (response.success && response.data) {
        setSuccess(true);
        
        // Tokens are already stored by loginEndpoint, just store user data
        const { user } = response.data;
        
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("userData", JSON.stringify(user));
        
        // Call onLoginSuccess callback if provided
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // Redirect to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        setError(response.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      // Handle API errors
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
          {/* <CardDescription>
            Enter your email and password to access your account
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                Login successful! Redirecting...
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LoginIcon size={18} className="mr-2" />
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

