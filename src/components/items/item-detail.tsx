import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ListItem } from "@/types/list";

interface ItemDetailProps {
  item: ListItem;
  rank: number;
}

export function ItemDetail({ item, rank }: ItemDetailProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">
              {rank}. {item.title}
            </h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {item.comment && (
          <div>
            <h4 className="font-medium mb-1">Comment</h4>
            <p className="text-sm text-muted-foreground">{item.comment}</p>
          </div>
        )}
        {item.link && (
          <div>
            <h4 className="font-medium mb-1">Link</h4>
            <a 
              href={item.link}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-sm text-blue-500 hover:underline break-all"
            >
              {item.link}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 