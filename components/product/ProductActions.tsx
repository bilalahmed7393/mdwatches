"use client";
import { useState } from "react";
import { ShoppingBag, MessageSquareDashed, Bell, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { BuyNowForm } from "@/components/forms/BuyNowForm";
import { MakeOfferForm } from "@/components/forms/MakeOfferForm";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { toast } from "sonner";

interface ProductActionsProps {
  productId: string;
  productName: string;
  available: boolean;
  basePrice: number;
}

export function ProductActions({ productId, productName, available, basePrice }: ProductActionsProps) {
  const [buyOpen, setBuyOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: productName, url: window.location.href }).catch(() => {});
      return;
    }
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    }
  }

  if (!available) {
    return (
      <div className="space-y-3">
        <Button disabled size="lg" className="w-full" variant="outline">
          Sold
        </Button>
        <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
          <DialogTrigger asChild>
            <Button size="lg" variant="outline" className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              Notify me of similar pieces
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join the waitlist</DialogTitle>
              <DialogDescription>
                We'll notify you if a similar watch comes in.
              </DialogDescription>
            </DialogHeader>
            <WaitlistForm productId={productId} onDone={() => setWaitlistOpen(false)} />
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="sm" onClick={share} className="w-full">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogTrigger asChild>
          <Button variant="accent" size="lg" className="col-span-2">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Buy now
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reserve this watch</DialogTitle>
            <DialogDescription>
              Submit your details and you'll receive bank transfer instructions.
            </DialogDescription>
          </DialogHeader>
          <BuyNowForm
            productId={productId}
            basePrice={basePrice}
            onDone={() => setBuyOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg">
            <MessageSquareDashed className="mr-2 h-4 w-4" />
            Make offer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make an offer</DialogTitle>
            <DialogDescription>
              We'll review and respond within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <MakeOfferForm productId={productId} onDone={() => setOfferOpen(false)} />
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="lg" onClick={share}>
        <Share2 className="mr-2 h-4 w-4" /> Share
      </Button>
    </div>
  );
}
