import { Lock, Globe, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ListPrivacy } from "@/types/list";

interface PrivacyBadgeProps {
  privacy: ListPrivacy;
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function PrivacyBadge({
  privacy,
  className,
  showIcon = true,
  showText = true,
}: PrivacyBadgeProps) {
  const Icon = {
    public: Globe,
    private: Lock,
    unlisted: Link,
  }[privacy];

  const label = {
    public: "Public",
    private: "Private",
    unlisted: "Unlisted",
  }[privacy];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 border-0 font-normal",
        privacy === "private" && "bg-red-100 text-red-700",
        privacy === "unlisted" && "bg-yellow-100 text-yellow-700",
        privacy === "public" && "bg-green-100 text-green-700",
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {showText && label}
    </Badge>
  );
} 