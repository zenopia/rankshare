"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IList } from "@/lib/models/list.model";

interface ListCardProps {
  list: IList;
}

export default function ListCard({ list }: ListCardProps) {
  return (
    <Link href={`/lists/${list._id}`}>
      <Card className="h-full hover:bg-accent/50 transition-colors">
        <CardHeader>
          <CardTitle>{list.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2">{list.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {list.items.length} items
          </p>
        </CardContent>
      </Card>
    </Link>
  );
} 