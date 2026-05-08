import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Check, AlertCircle, ChevronLeft } from "lucide-react";
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

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user, isPremium, loading } = useAuth();
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
        title: "Application Submitted",
        description: "Your premium upgrade request has been submitted. The admin will review it shortly.",
      });
      setReceiptFile(null);
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
                Please sign in to your account to apply for premium.
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
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Upgrade to Premium</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Unlock exclusive content and enjoy an ad-free experience.
          </p>

          {/* Application Status */}
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
                    ? "Pending Review"
                    : existingRequest.status === "approved"
                      ? "Approved ✓"
                      : "Rejected"}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {existingRequest.status === "pending"
                    ? "Your application is under review. Please wait for admin confirmation."
                    : existingRequest.status === "approved"
                      ? "Your premium subscription is active!"
                      : "Your application was rejected. Please try again."}
                </p>
              </div>
            </motion.div>
          )}

          {/* Premium Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {PREMIUM_PLANS.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <h3 className="text-lg font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary mb-4">{plan.price}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Upload Receipt */}
          <div className="max-w-2xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Payment Proof</h2>
              <p className="text-muted-foreground">
                Upload a screenshot or image of your payment receipt to verify your purchase.
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
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={URL.createObjectURL(receiptFile)}
                alt="Receipt preview"
                className="max-w-full max-h-64 rounded-lg border border-border"
              />
            )}

            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!receiptFile || submitMutation.isPending}
              className="w-full h-12 text-base font-semibold"
            >
              {submitMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-transparent border-t-white rounded-full animate-spin" />
              ) : (
                "Submit Premium Application"
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              After submitting, an admin will review your payment receipt and upgrade your account.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
