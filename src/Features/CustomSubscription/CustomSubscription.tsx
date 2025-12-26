import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SubscriptionPlan } from "@/lib/api/endpoints";
import { getSubscriptionPlanEndpoint, createSubscriptionCheckoutEndpoint, ApiError } from "@/lib/api/endpoints";

// Razorpay types
interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayPaymentError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, unknown>;
  };
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  image?: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: Record<string, unknown>;
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: RazorpayPaymentError) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function CustomSubscription() {
  const navigate = useNavigate();
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string>("");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handleUpgradeClick = async () => {
    setIsLoadingPlan(true);
    setPlanError(null);
    setBillingCycle(null);
    setCheckoutError(null);
    try {
      const response = await getSubscriptionPlanEndpoint();
      if (response.success && response.data) {
        setSubscriptionPlan(response.data);
        // Set default billing cycle based on available pricing
        if (response.data.pricing && response.data.pricing.length > 0) {
          const firstPricing = response.data.pricing[0];
          if (firstPricing.monthly !== null && firstPricing.monthly !== undefined) {
            setBillingCycle("monthly");
          } else if (firstPricing.yearly !== null && firstPricing.yearly !== undefined) {
            setBillingCycle("yearly");
          }
        }
        setIsSubscriptionDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      let errorMessage = "Failed to fetch subscription plan";
      if (error instanceof ApiError) {
        errorMessage = error.message;
        // Handle specific error cases
        const status = error.status;
        if (status !== undefined) {
          if (status === 401) {
            errorMessage = "Session expired. Please refresh the page.";
          } else if (status === 0) {
            errorMessage = "Network error: Unable to connect to the server. Please check your internet connection.";
          } else if (status === 404) {
            errorMessage = "Subscription plan not found.";
          } else if (status >= 500) {
            errorMessage = "Server error. Please try again later.";
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setPlanError(errorMessage);
      setIsSubscriptionDialogOpen(true);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const handlePayClick = async () => {
    if (!subscriptionPlan) return;
    
    setIsProcessingCheckout(true);
    setCheckoutError(null);
    
    try {
      // Get currency from pricing, default to INR
      const currency = subscriptionPlan.pricing && subscriptionPlan.pricing.length > 0 
        ? subscriptionPlan.pricing[0].currency 
        : "INR";
      
      const response = await createSubscriptionCheckoutEndpoint(
        subscriptionPlan._id,
        billingCycle,
        currency
      );
      
      if (response.success && response.data) {
        const checkoutData = response.data;
        
        // Wait for Razorpay script to load
        if (!window.Razorpay) {
          // Wait a bit for script to load
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        
        if (!window.Razorpay) {
          throw new Error("Razorpay SDK failed to load. Please refresh the page and try again.");
        }
        
        // Initialize Razorpay checkout
        const options = {
          key: checkoutData.razorpay_key_id,
          subscription_id: checkoutData.subscription_id,
          name: "Zcoded",
          description: `Subscription Plan: ${subscriptionPlan.name}`,
          image: "/hea.png",
          amount: checkoutData.amount,
          currency: checkoutData.currency,
          handler: function (response: RazorpayPaymentResponse) {
            // Payment successful
            console.log("Payment successful:", response);
            setIsSubscriptionDialogOpen(false);
            setIsProcessingCheckout(false);
            setPaymentSuccessMessage("Payment successful! Your subscription has been activated.");
            setIsPaymentSuccess(true);
            // Redirect to dashboard after showing success message
            setTimeout(() => {
              navigate("/dashboard");
            }, 2000);
          },
          prefill: {
            // You can prefill customer details if available
          },
          theme: {
            color: "#00c950",
          },
          modal: {
            ondismiss: function () {
              // User closed the payment modal
              setIsProcessingCheckout(false);
              setIsSubscriptionDialogOpen(true);
            },
          },
        };
        
        const razorpay = new window.Razorpay(options);
        
        razorpay.on("payment.failed", function (response: RazorpayPaymentError) {
          // Payment failed
          console.error("Payment failed:", response);
          setCheckoutError(response.error?.description || "Payment failed. Please try again.");
          setIsProcessingCheckout(false);
          setIsSubscriptionDialogOpen(true);
        });
        
        // Open Razorpay checkout
        razorpay.open();
        // Close subscription dialog while Razorpay modal is open
        setIsSubscriptionDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      let errorMessage = "Failed to create checkout";
      if (error instanceof ApiError) {
        errorMessage = error.message;
        // Handle specific error cases
        const status = error.status;
        if (status !== undefined) {
          if (status === 401) {
            errorMessage = "Session expired. Please refresh the page.";
          } else if (status === 0) {
            errorMessage = "Network error: Unable to connect to the server. Please check your internet connection.";
          } else if (status === 400) {
            errorMessage = "Invalid request. Please check your subscription plan selection.";
          } else if (status === 404) {
            errorMessage = "Subscription plan not found.";
          } else if (status >= 500) {
            errorMessage = "Server error. Please try again later.";
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setCheckoutError(errorMessage);
      setIsProcessingCheckout(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-[#c8e6c9] dark:border-[#2d5a33] text-black dark:text-white hover:bg-[#c8e6c9] dark:hover:bg-[#2d5a33] rounded-lg h-7 text-xs font-medium"
        onClick={handleUpgradeClick}
        disabled={isLoadingPlan}
      >
        {isLoadingPlan ? "Loading..." : "Upgrade"}
      </Button>

      {/* Subscription Plan Dialog */}
      <AlertDialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
      <AlertDialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsSubscriptionDialogOpen(false)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600 dark:text-gray-400"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
          <div className="px-6 pt-6 pb-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold">
                {subscriptionPlan ? "Your Subscription Plan" : "Error"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {planError ? planError : "Details of your current subscription plan"}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          
          {subscriptionPlan && (
            <div className="space-y-4 py-4 px-6 w-full overflow-y-auto flex-1 min-h-0">
              {/* Plan Name and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan Name</p>
                  <p className="text-base font-semibold text-black dark:text-white">{subscriptionPlan.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan Type</p>
                  <p className="text-base font-semibold text-black dark:text-white capitalize">{subscriptionPlan.plan_type}</p>
                </div>
              </div>

              {/* Pricing */}
              {subscriptionPlan.pricing && subscriptionPlan.pricing.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Pricing</p>
                  <div className="space-y-2">
                    {subscriptionPlan.pricing.map((price, index) => {
                      const monthlyPrice = price.monthly;
                      const yearlyPrice = price.yearly;
                      const hasMonthly = monthlyPrice !== null && monthlyPrice !== undefined;
                      const hasYearly = yearlyPrice !== null && yearlyPrice !== undefined;
                      
                      // Only render if at least one pricing option exists
                      if (!hasMonthly && !hasYearly) return null;
                      
                      return (
                        <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          {hasMonthly && monthlyPrice !== null && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly:</span>
                              <span className="text-base font-semibold text-black dark:text-white">
                                {price.currency} {monthlyPrice.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {hasYearly && yearlyPrice !== null && (
                            <div className={`flex justify-between items-center ${hasMonthly ? 'mt-1' : ''}`}>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Yearly:</span>
                              <span className="text-base font-semibold text-black dark:text-white">
                                {price.currency} {yearlyPrice.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Credits and Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Credits</p>
                  <p className="text-base font-semibold text-black dark:text-white">{subscriptionPlan.credits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Users</p>
                  <p className="text-base font-semibold text-black dark:text-white">{subscriptionPlan.max_users}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Parallel Simulations</p>
                  <p className="text-base font-semibold text-black dark:text-white">{subscriptionPlan.no_of_parallel_simulations}</p>
                </div>
              </div>

              {/* Access & Support */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Access</p>
                  <p className="text-base font-semibold text-black dark:text-white">
                    {subscriptionPlan.api_access ? "✓ Enabled" : "✗ Disabled"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority Support</p>
                  <p className="text-base font-semibold text-black dark:text-white">
                    {subscriptionPlan.priority_support ? "✓ Enabled" : "✗ Disabled"}
                  </p>
                </div>
              </div>

              {/* Restrictions */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Restrictions</p>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Has Restrictions:</span>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {subscriptionPlan.has_restrictions ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Persona Generation Limited:</span>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {subscriptionPlan.is_persona_generation_limited ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Media Simulation Limited:</span>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {subscriptionPlan.is_media_simulation_limited ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Concept Simulation Limited:</span>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {subscriptionPlan.is_concept_simulation_limited ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Chat Simulation Limited:</span>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {subscriptionPlan.is_chat_simulation_limited ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billing Cycle Selection */}
              {subscriptionPlan.pricing && subscriptionPlan.pricing.length > 0 && (() => {
                const firstPricing = subscriptionPlan.pricing[0];
                const hasMonthly = firstPricing.monthly !== null && firstPricing.monthly !== undefined;
                const hasYearly = firstPricing.yearly !== null && firstPricing.yearly !== undefined;
                
                if (!hasMonthly && !hasYearly) return null;
                
                return (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Select Billing Cycle</p>
                    <div className="flex gap-4">
                      {hasMonthly && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="billingCycle"
                            value="monthly"
                            checked={billingCycle === "monthly"}
                            onChange={(e) => setBillingCycle(e.target.value)}
                            className="w-4 h-4 text-[#00c950] focus:ring-[#00c950]"
                          />
                          <span className="text-sm text-black dark:text-white">Monthly</span>
                        </label>
                      )}
                      {hasYearly && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="billingCycle"
                            value="yearly"
                            checked={billingCycle === "yearly"}
                            onChange={(e) => setBillingCycle(e.target.value)}
                            className="w-4 h-4 text-[#00c950] focus:ring-[#00c950]"
                          />
                          <span className="text-sm text-black dark:text-white">Yearly</span>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Checkout Error */}
              {checkoutError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{checkoutError}</p>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter className="justify-center sm:justify-center px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <Button
              className="bg-[#00c950] hover:bg-[#00b045] text-white px-8 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePayClick}
              disabled={isProcessingCheckout || !subscriptionPlan}
            >
              {isProcessingCheckout ? "Processing..." : "Pay"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Success Dialog */}
      <AlertDialog open={isPaymentSuccess} onOpenChange={setIsPaymentSuccess}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-[#00c950]/10 dark:bg-[#00c950]/20 rounded-full p-4">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#00c950]"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path
                    d="M8 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-black dark:text-white text-center">
              Payment Successful!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#666666] dark:text-[#999999] text-center">
              {paymentSuccessMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <Button
              className="bg-[#00c950] hover:bg-[#00b045] text-white"
              onClick={() => {
                setIsPaymentSuccess(false);
                navigate("/dashboard");
              }}
            >
              Continue to Dashboard
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

