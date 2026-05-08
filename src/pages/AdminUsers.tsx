import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Crown, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { fetchAllUsers, fetchAllPremiumSubscriptions, revokePremiumSubscription, createPremiumSubscription } from "@/lib/premium-service";
import { toast } from "@/components/ui/use-toast";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: fetchAllUsers });
  const { data: subscriptions = [] } = useQuery({ queryKey: ["admin-premium-subs"], queryFn: fetchAllPremiumSubscriptions });
  const [granting, setGranting] = useState<string | null>(null);

  const revokeMutation = useMutation({
    mutationFn: revokePremiumSubscription,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-premium-subs"] });
      toast({ title: "Revoked", description: "User premium access revoked." });
    },
    onError: (err) => toast({ title: "Failed", description: err instanceof Error ? err.message : "Unable to revoke.", variant: "destructive" }),
  });

  const grantMutation = useMutation({
    mutationFn: ({ userId, email }: { userId: string; email: string }) => createPremiumSubscription(userId, email),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-premium-subs"] });
      toast({ title: "Granted", description: "User granted premium access." });
      setGranting(null);
    },
    onError: (err) => toast({ title: "Failed", description: err instanceof Error ? err.message : "Unable to grant.", variant: "destructive" }),
  });

  const isUserPremium = (userId: string) => subscriptions.some((s: any) => s.user_id === userId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Users</h2>
          <div className="text-sm text-muted-foreground">Manage all users and premium subscriptions</div>
        </div>

        <div className="overflow-x-auto bg-card border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Premium</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-border hover:bg-secondary/5">
                  <td className="p-3">{u.full_name || "—"}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    {isUserPremium(u.id) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md gradient-primary text-xs font-semibold text-primary-foreground">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="p-3">
                    {isUserPremium(u.id) ? (
                      <Button size="sm" variant="destructive" onClick={() => revokeMutation.mutate(u.id)} className="gap-2">
                        <Trash2 className="w-4 h-4" /> Revoke
                      </Button>
                    ) : (
                      <Button size="sm" variant="premium" onClick={() => grantMutation.mutate({ userId: u.id, email: u.email })} className="gap-2">
                        <Check className="w-4 h-4" /> Grant Premium
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
