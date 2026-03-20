"use client";

import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useTradeHistory, useSubscribeHistory } from "@/hooks/use-history";
import { ArrowRight, History, Loader2 } from "lucide-react";

export default function HistoryPage() {
  const user = useAuthStore((s) => s.user);
  const { data: history, isLoading } = useTradeHistory();
  const liveHistory = useSubscribeHistory();

  const entries = liveHistory.length > 0 ? liveHistory : history;

  if (!user) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge variant="success">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (ts: number) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <History className="h-8 w-8 text-purple-400" />
            Trade History
          </h1>
          <p className="text-muted-foreground mt-1">Complete record of all your trades</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="p-12 text-center">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No trade history yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete a trade to see it recorded here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const isSender = entry.fromUserId === user.uid;
              return (
                <Card key={entry.id} className="bg-card/50 border-border/50 hover:border-border transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium truncate">
                            {isSender ? "You" : entry.fromUserName}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">
                            {!isSender ? "You" : entry.toUserName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{entry.offeredNftIds.length} offered</span>
                        <span>↔</span>
                        <span>{entry.requestedNftIds.length} requested</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {statusBadge(entry.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.completedAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

