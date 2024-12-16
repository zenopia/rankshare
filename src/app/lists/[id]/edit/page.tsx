import { notFound } from "next/navigation";
import { ListFormContent } from "@/components/lists/list-form-content";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import type { MongoListDocument } from "@/types/mongodb";
import type { ItemProperty } from "@/types/list";
import ErrorBoundary from "@/components/error-boundary";
import { ObjectId } from "mongodb";

interface EditListPageProps {
  params: { id: string };
}

interface MongoItem {
  _id?: string | ObjectId;
  title: string;
  comment?: string;
  properties?: ItemProperty[];
}

export default async function EditListPage({ params }: EditListPageProps) {
  try {
    await dbConnect();
    const list = await ListModel.findById(params.id).lean() as MongoListDocument;
    
    if (!list) {
      notFound();
    }

    const serializedList = {
      id: list._id.toString(),
      title: list.title,
      category: list.category,
      description: list.description,
      privacy: list.privacy,
      items: list.items.map((item: MongoItem) => {
        const itemId = item._id instanceof ObjectId 
          ? item._id.toString()
          : typeof item._id === 'string' 
            ? item._id 
            : crypto.randomUUID();

        return {
          id: itemId,
          title: item.title,
          comment: item.comment,
          properties: item.properties?.map((prop: ItemProperty) => ({
            id: prop.id,
            type: prop.type,
            label: prop.label,
            value: prop.value
          })) || []
        };
      })
    };

    return (
      <div className="container max-w-3xl py-8">
        <ErrorBoundary>
          <ListFormContent 
            initialData={serializedList} 
            mode="edit" 
          />
        </ErrorBoundary>
      </div>
    );
  } catch (error) {
    console.error('Error loading list:', error);
    notFound();
  }
} 