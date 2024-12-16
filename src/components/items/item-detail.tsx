import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link2 } from "lucide-react";
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

        {item.properties && item.properties.length > 0 && (
          <div className="space-y-4">
            {item.properties.map(prop => (
              <div key={prop.id}>
                <h4 className="font-medium mb-1">{prop.label}</h4>
                {prop.type === 'link' ? (
                  <a 
                    href={prop.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline break-all inline-flex items-center gap-1"
                  >
                    {prop.value}
                    <Link2 className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{prop.value}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 