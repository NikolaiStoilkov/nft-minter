"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NFTCard } from "@/components/nft-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/auth-store";
import { useNFTStore } from "@/stores/nft-store";
import { useTradeStore } from "@/stores/trade-store";
import { useSubscribeInventory, useUserNFTs } from "@/hooks/use-nft";
import {
  useIncomingOffers,
  useOutgoingOffers,
  useCreateTrade,
  useAcceptTrade,
  useRejectTrade,
  useCancelTrade,
} from "@/hooks/use-trade";
import { useAllUsers } from "@/hooks/use-user";
import {
  ArrowLeftRight,
  ArrowRight,
  Search,
  Loader2,
  Check,
  X,
  Users,
} from "lucide-react";

export default function TradePage() {
  const user = useAuthStore((s) => s.user);
  const inventory = useNFTStore((s) => s.inventory);
  const tradeModalOpen = useTradeStore((s) => s.tradeModalOpen);
  const selectedTradeUserId = useTradeStore((s) => s.selectedTradeUserId);
  const openTradeModal = useTradeStore((s) => s.openTradeModal);
  const closeTradeModal = useTradeStore((s) => s.closeTradeModal);

  const [searchQuery, setSearchQuery] = useState("");
  const [myOffered, setMyOffered] = useState<string[]>([]);
  const [theirRequested, setTheirRequested] = useState<string[]>([]);

  useSubscribeInventory();
  const { data: incoming, isLoading: loadingIn } = useIncomingOffers();
  const { data: outgoing, isLoading: loadingOut } = useOutgoingOffers();
  const { data: users } = useAllUsers();
  const { data: theirNfts } = useUserNFTs(selectedTradeUserId ?? undefined);
  const createTrade = useCreateTrade();
  const acceptTrade = useAcceptTrade();
  const rejectTrade = useRejectTrade();
  const cancelTrade = useCancelTrade();

  const filteredUsers = users?.filter((u) =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = users?.find((u) => u.uid === selectedTradeUserId);

  const toggleMyOffer = (id: string) => {
    setMyOffered((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleTheirRequest = (id: string) => {
    setTheirRequested((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCreateTrade = async () => {
    if (!user || !selectedTradeUserId || !selectedUser) return;
    if (myOffered.length === 0 && theirRequested.length === 0) return;

    await createTrade.mutateAsync({
      fromUserId: user.uid,
      fromUserName: user.displayName,
      toUserId: selectedTradeUserId,
      toUserName: selectedUser.displayName,
      offeredNftIds: myOffered,
      requestedNftIds: theirRequested,
    });

    setMyOffered([]);
    setTheirRequested([]);
    closeTradeModal();
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Trade Center</h1>
          <p className="text-muted-foreground mt-1">Trade NFTs with other collectors</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> Find Traders
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2">
              Incoming
              {incoming && incoming.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
                  {incoming.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-2">
              Outgoing
              {outgoing && outgoing.length > 0 && (
                <Badge variant="info" className="ml-1 h-5 px-1.5 text-[10px]">
                  {outgoing.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers?.map((u) => (
                <Card key={u.uid} className="bg-card/50 border-border/50 hover:border-purple-500/30 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.photoURL} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-xs">
                          {u.displayName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{u.displayName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setMyOffered([]);
                        setTheirRequested([]);
                        openTradeModal(u.uid);
                      }}
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" /> Trade
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {filteredUsers?.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">No users found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="incoming">
            {loadingIn ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : !incoming || incoming.length === 0 ? (
              <Card className="bg-card/50"><CardContent className="p-12 text-center text-muted-foreground">No incoming trade offers</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {incoming.map((offer) => (
                  <Card key={offer.id} className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">{offer.fromUserName}</p>
                          <p className="text-xs text-muted-foreground">wants to trade with you</p>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">They offer ({offer.offeredNftIds.length} NFTs)</p>
                          <div className="flex gap-1 flex-wrap">
                            {offer.offeredNftIds.map((id) => (
                              <Badge key={id} variant="secondary" className="text-[10px]">{id.slice(0, 8)}...</Badge>
                            ))}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">They want ({offer.requestedNftIds.length} NFTs)</p>
                          <div className="flex gap-1 flex-wrap">
                            {offer.requestedNftIds.map((id) => (
                              <Badge key={id} variant="secondary" className="text-[10px]">{id.slice(0, 8)}...</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-red-400 hover:text-red-400"
                          onClick={() => rejectTrade.mutate(offer.id)}
                          disabled={rejectTrade.isPending}
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button
                          variant="gradient"
                          size="sm"
                          className="gap-1"
                          onClick={() => acceptTrade.mutate(offer.id)}
                          disabled={acceptTrade.isPending}
                        >
                          <Check className="h-3.5 w-3.5" /> Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing">
            {loadingOut ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : !outgoing || outgoing.length === 0 ? (
              <Card className="bg-card/50"><CardContent className="p-12 text-center text-muted-foreground">No outgoing trade offers</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {outgoing.map((offer) => (
                  <Card key={offer.id} className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">To: {offer.toUserName}</p>
                          <p className="text-xs text-muted-foreground">Waiting for response</p>
                        </div>
                        <Badge variant="info">Pending</Badge>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">You offer ({offer.offeredNftIds.length})</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">You want ({offer.requestedNftIds.length})</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-red-400 hover:text-red-400"
                          onClick={() => cancelTrade.mutate(offer.id)}
                          disabled={cancelTrade.isPending}
                        >
                          <X className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={tradeModalOpen} onOpenChange={(open) => !open && closeTradeModal()}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-purple-400" />
              Trade with {selectedUser?.displayName}
            </DialogTitle>
            <DialogDescription>
              Select NFTs to offer and request, then send the trade proposal.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col min-h-0">
              <p className="text-sm font-semibold mb-2">Your NFTs (select to offer)</p>
              <ScrollArea className="flex-1 rounded-lg border border-border p-2" style={{ maxHeight: "350px" }}>
                {inventory.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No NFTs to offer</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {inventory.map((nft) => (
                      <NFTCard
                        key={nft.id}
                        nft={nft}
                        compact
                        selectable
                        selected={myOffered.includes(nft.id)}
                        onSelect={toggleMyOffer}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
              {myOffered.length > 0 && (
                <p className="text-xs text-purple-400 mt-1">{myOffered.length} selected</p>
              )}
            </div>

            <div className="flex flex-col min-h-0">
              <p className="text-sm font-semibold mb-2">Their NFTs (select to request)</p>
              <ScrollArea className="flex-1 rounded-lg border border-border p-2" style={{ maxHeight: "350px" }}>
                {!theirNfts || theirNfts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">They have no NFTs</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {theirNfts.map((nft) => (
                      <NFTCard
                        key={nft.id}
                        nft={nft}
                        compact
                        selectable
                        selected={theirRequested.includes(nft.id)}
                        onSelect={toggleTheirRequest}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
              {theirRequested.length > 0 && (
                <p className="text-xs text-blue-400 mt-1">{theirRequested.length} selected</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeTradeModal}>Cancel</Button>
            <Button
              variant="gradient"
              onClick={handleCreateTrade}
              disabled={createTrade.isPending || (myOffered.length === 0 && theirRequested.length === 0)}
              className="gap-2"
            >
              {createTrade.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                <><ArrowLeftRight className="h-4 w-4" /> Send Trade Offer</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

