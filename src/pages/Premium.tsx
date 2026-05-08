import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Check, ChevronLeft, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/use-toast";
import {
  submitPremiumUpgradeRequest,
  uploadReceiptFile,
  fetchUserPremiumRequest,
  PremiumPlan,
} from "@/lib/premium-service";
import { useMutation, useQuery } from "@tanstack/react-query";

const PREMIUM_PLANS: { id: PremiumPlan; name: string; price: string; features: string[] }[] = [
  {
    id: "standard",
    name: "Standard",
    price: "$4.99",
    features: ["4K Streaming", "Ad-free Experience", "Download Videos", "Multi-device Access"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    features: ["4K Streaming", "Ad-free Experience", "Download Videos", "Multi-device Access", "Early Access to New Content"],
  },
  {
    id: "vip",
    name: "VIP",
    price: "$14.99",
    features: [
      "4K Streaming",
      "Ad-free Experience",
      "Download Videos",
      "Multi-device Access",
      "Early Access to New Content",
      "Exclusive VIP Content",
      "Priority Support",
    ],
  },
];

type Step = "plans" | "payment" | "receipt";

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user, isPremium, loading } = useAuth();
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>("standard");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetch existing request if any
  const { data: existingRequest } = useQuery({
    queryKey: ["premium-request", user?.id],
    queryFn: () => (user ? fetchUserPremiumRequest(user.id) : null),
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!receiptFile) throw new Error("Please upload a payment receipt");

      const receiptUrl = await uploadReceiptFile(receiptFile);
      return submitPremiumUpgradeRequest(user.id, user.email || "", selectedPlan, receiptUrl);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted! ✅",
        description: "Your premium upgrade request has been submitted. Admin will review your receipt shortly.",
      });
      setTimeout(() => navigate("/"), 2000);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Unable to submit your request.",
        variant: "destructive",
      });
    },
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-transparent border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center space-y-6"
          >
            <div className="p-4 bg-muted rounded-lg border border-border">
              <AlertCircle className="w-12 h-12 text-warning mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground mb-2">Sign in Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to your account to join premium.
              </p>
              <Button onClick={() => navigate("/login")} className="w-full">
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (isPremium) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center space-y-6"
          >
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <Check className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground mb-2">Already Premium</h2>
              <p className="text-muted-foreground mb-6">
                Your account is already upgraded to premium. Enjoy exclusive content!
              </p>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <button
          onClick={() => {
            if (step !== "plans") setStep("plans");
            else navigate("/");
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === "plans" ? "Back to Home" : "Back"}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          {/* Application Status Banner */}
          {existingRequest && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border mb-8 flex items-start gap-3 ${
                existingRequest.status === "pending"
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : existingRequest.status === "approved"
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                  existingRequest.status === "pending"
                    ? "bg-yellow-500"
                    : existingRequest.status === "approved"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              />
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  {existingRequest.status === "pending"
                    ? "⏳ Pending Review"
                    : existingRequest.status === "approved"
                      ? "✅ Approved"
                      : "❌ Rejected"}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {existingRequest.status === "pending"
                    ? "Your payment receipt is under review. Please wait for admin confirmation."
                    : existingRequest.status === "approved"
                      ? "Your premium subscription is now active!"
                      : "Your application was rejected. Please resubmit or contact support."}
                </p>
              </div>
            </motion.div>
          )}

          {step === "plans" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Join Premium</h1>
                <p className="text-lg text-muted-foreground">
                  Get access to the rarest and craziest videos on the platform.
                </p>
              </div>

              {/* Premium Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PREMIUM_PLANS.map((plan, idx) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {plan.id === "vip" && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-foreground mb-2 pt-2">{plan.name}</h3>
                    <p className="text-3xl font-bold text-primary mb-4">{plan.price}</p>
                    <p className="text-xs text-muted-foreground mb-6">/month</p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Action Button */}
              <Button
                onClick={() => setStep("payment")}
                variant="premium"
                className="w-full h-12 text-base font-semibold"
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="max-w-2xl space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Payment</h1>
                <p className="text-muted-foreground">
                  {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan - {PREMIUM_PLANS.find(p => p.id === selectedPlan)?.price}/month
                </p>
              </div>

              <div className="p-6 rounded-lg bg-card border border-border space-y-4">
                <h2 className="font-semibold text-foreground">Payment Information</h2>
                <p className="text-sm text-muted-foreground">
                  Complete your payment through your preferred payment method. You can use credit card, debit card, or other payment platforms.
                </p>

                <div className="pt-4 space-y-3 border-t border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{PREMIUM_PLANS.find(p => p.id === selectedPlan)?.price}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-border/50">
                    <span className="text-muted-foreground">Tax (estimated)</span>
                    <span className="font-medium text-foreground">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary">{PREMIUM_PLANS.find(p => p.id === selectedPlan)?.price}</span>
                  </div>
                </div>

                <div className="pt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-muted-foreground">
                  💡 <span className="font-semibold">Note:</span> After payment, you'll be asked to upload your receipt for verification.
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep("plans")}
                  variant="outline"
                  className="flex-1"
                >
                  Edit Plan
                </Button>
                <Button
                  onClick={() => setStep("receipt")}
                  variant="premium"
                  className="flex-1"
                >
                  I've Paid - Continue
                </Button>
              </div>
            </div>
          )}

          {step === "receipt" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Upload Payment Receipt</h1>
                <p className="text-muted-foreground">
                  Upload a screenshot or image of your payment receipt for verification.
                </p>
              </div>

              <div
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file?.type.startsWith("image/")) {
                    setReceiptFile(file);
                  } else {
                    toast({
                      title: "Invalid file",
                      description: "Please upload an image file.",
                      variant: "destructive",
                    });
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setReceiptFile(file);
                  }}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground">
                    {receiptFile ? receiptFile.name : "Drag and drop your receipt"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </label>
              </div>

              {receiptFile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <p className="text-sm font-semibold text-foreground">Preview:</p>
                  <img
                    src={URL.createObjectURL(receiptFile)}
                    alt="Receipt preview"
                    className="max-w-full max-h-64 rounded-lg border border-border"
                  />
                </motion.div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep("payment")}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={!receiptFile || submitMutation.isPending}
                  variant="premium"
                  className="flex-1"
                >
                  {submitMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-transparent border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" /> Submit for Approval
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
