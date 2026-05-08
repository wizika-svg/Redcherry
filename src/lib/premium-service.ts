import { supabase } from "@/lib/supabase";

export type PremiumPlan = "standard" | "pro" | "vip";

export type PremiumUpgradeRequest = {
  id: string;
  user_id: string;
  email: string;
  payment_receipt_url: string | null;
  premium_plan: PremiumPlan;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

export type PremiumSubscription = {
  id: string;
  user_id: string;
  email: string;
  premium_plan: PremiumPlan;
  subscribed_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

const PREMIUM_BUCKET = "premium-receipts";

/**
 * Upload payment receipt file to Supabase storage
 */
export async function uploadReceiptFile(file: File): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(PREMIUM_BUCKET)
    .upload(fileName, file);

  if (error || !data) {
    throw new Error(error?.message || "Failed to upload receipt file.");
  }

  const { data: urlData } = supabase.storage
    .from(PREMIUM_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Submit a premium upgrade request
 */
export async function submitPremiumUpgradeRequest(
  userId: string,
  email: string,
  plan: PremiumPlan,
  receiptUrl: string | null
): Promise<PremiumUpgradeRequest> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("premium_upgrade_requests")
    .upsert(
      {
        user_id: userId,
        email: email,
        premium_plan: plan,
        payment_receipt_url: receiptUrl,
        status: "pending",
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to submit upgrade request.");
  }

  return data as PremiumUpgradeRequest;
}

/**
 * Fetch user's premium upgrade request
 */
export async function fetchUserPremiumRequest(userId: string): Promise<PremiumUpgradeRequest | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("premium_upgrade_requests")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch premium request:", error.message);
    return null;
  }

  return data as PremiumUpgradeRequest | null;
}

/**
 * Fetch all pending premium upgrade requests (admin only)
 */
export async function fetchPendingPremiumRequests(): Promise<PremiumUpgradeRequest[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("premium_upgrade_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch pending premium requests:", error.message);
    return [];
  }

  return (data || []) as PremiumUpgradeRequest[];
}

/**
 * Approve a premium upgrade request and create subscription
 */
export async function approvePremiumRequest(requestId: string): Promise<PremiumSubscription> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  // First, fetch the request details
  const { data: requestData, error: fetchError } = await supabase
    .from("premium_upgrade_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchError || !requestData) {
    throw new Error(fetchError?.message || "Request not found.");
  }

  // Update request status
  await supabase
    .from("premium_upgrade_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  // Create premium subscription (upsert in case user already has one)
  const { data: subscriptionData, error: subError } = await supabase
    .from("premium_subscriptions")
    .upsert(
      {
        user_id: requestData.user_id,
        email: requestData.email,
        premium_plan: requestData.premium_plan,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (subError || !subscriptionData) {
    throw new Error(subError?.message || "Failed to create premium subscription.");
  }

  return subscriptionData as PremiumSubscription;
}

/**
 * Reject/delete a premium upgrade request
 */
export async function rejectPremiumRequest(requestId: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("premium_upgrade_requests")
    .delete()
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message || "Failed to reject premium request.");
  }
}

/**
 * Check if user is premium
 */
export async function isUserPremium(userId: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("premium_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to check premium status:", error.message);
    return false;
  }

  return !!data;
}

/**
 * Get user's premium subscription
 */
export async function getUserPremiumSubscription(userId: string): Promise<PremiumSubscription | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("premium_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch premium subscription:", error.message);
    return null;
  }

  return data as PremiumSubscription | null;
}
