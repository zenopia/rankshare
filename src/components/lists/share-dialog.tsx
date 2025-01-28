"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Share, Copy, Check, Lock, Twitter, Facebook, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { ListPrivacy } from "@/types/list";

interface ShareDialogProps {
  listId: string;
  title: string;
  privacy: ListPrivacy;
  onPrivacyChange?: (privacy: ListPrivacy) => void;
}

export function ShareDialog({ listId, title, privacy, onPrivacyChange }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const shareUrl = `${window.location.origin}/lists/${listId}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const socialUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  };

  const handleSocialShare = (platform: keyof typeof socialUrls) => {
    window.open(socialUrls[platform], '_blank', 'width=550,height=450');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const makeUnlisted = async () => {
    if (privacy === "unlisted") return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          privacy: "unlisted",
        }),
      });

      if (!response.ok) throw new Error();

      const updatedList = await response.json();
      onPrivacyChange?.(updatedList.privacy);
      toast.success("List is now unlisted and can be shared via link");
    } catch (error) {
      toast.error("Failed to update privacy settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share List</DialogTitle>
          <DialogDescription>
            {privacy === "private" ? (
              "Make this list unlisted to share it with others. Anyone with the link will be able to view it."
            ) : privacy === "unlisted" ? (
              "Share this link with others. Only people with the link can view this list."
            ) : (
              "Anyone can view this list since it's public. Share the link with others."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {privacy === "private" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>This list is currently private</span>
              </div>
              <Button
                onClick={makeUnlisted}
                disabled={isLoading}
                className="w-full"
              >
                Make List Unlisted
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {privacy === "unlisted" && (
                <p className="text-sm text-muted-foreground">
                  Note: This list can only be accessed by people who have this link.
                </p>
              )}
            </div>
          )}
        </div>

        {privacy !== "private" && (
          <DialogFooter className="sm:justify-start">
            <div className="flex flex-col w-full space-y-4">
              <div className="text-sm font-medium">Share on social media</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare('twitter')}
                  title="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare('facebook')}
                  title="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare('linkedin')}
                  title="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
} 