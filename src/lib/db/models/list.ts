import type { Document, UpdateQuery, SchemaOptions } from 'mongoose';
import { Schema, model, models } from 'mongoose';
import type { ToObjectOptions } from 'mongoose';
import { LIST_CATEGORIES } from '@/types/list';

// Define the document interface
interface ListDoc extends Document {
  title: string;
  category: string;
  description?: string;
  privacy: 'public' | 'private';
  ownerId: string;
  ownerName: string;
  ownerImageUrl?: string;
  items: Array<{
    title: string;
    comment?: string;
    properties: Array<{
      id: string;
      type: 'text' | 'link';
      label: string;
      value: string;
    }>;
    rank: number;
  }>;
  viewCount: number;
  totalPins: number;
  totalCopies: number;
  lastEditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schemaOptions: SchemaOptions<ListDoc> = {
  timestamps: true,
  toJSON: { 
    getters: true,
    virtuals: true,
    transform: function(
      doc: Document<unknown, object, ListDoc> & ListDoc & Required<{ _id: unknown }> & { __v: number },
      ret: Record<string, unknown>,
      _options: ToObjectOptions<typeof doc>
    ) {
      ret.createdAt = doc.createdAt;
      if (doc.lastEditedAt) {
        ret.lastEditedAt = doc.lastEditedAt;
      }
      return ret;
    }
  }
};

const itemSchema = new Schema({
  title: { type: String, required: true },
  comment: String,
  properties: [{
    id: String,
    type: { type: String, enum: ['text', 'link'] },
    label: String,
    value: String
  }],
  rank: { type: Number, required: true }
});

const listSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  category: {
    type: String,
    required: true,
    enum: LIST_CATEGORIES.map(cat => cat.value),
  },
  description: {
    type: String,
    required: false,
  },
  privacy: {
    type: String,
    required: true,
    enum: ['public', 'private'],
  },
  ownerId: {
    type: String,
    required: true,
    index: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  ownerImageUrl: {
    type: String,
  },
  items: [itemSchema],
  viewCount: {
    type: Number,
    default: 0,
  },
  totalPins: {
    type: Number,
    default: 0,
  },
  totalCopies: {
    type: Number,
    default: 0,
  },
  lastEditedAt: {
    type: Date,
    required: false,
    default: undefined
  },
}, schemaOptions);

// Update middleware to ensure lastEditedAt is set only on content updates
listSchema.pre(['findOneAndUpdate'], function(next) {
  const update = this.getUpdate() as UpdateQuery<unknown>;
  
  // Skip lastEditedAt update if this is just a stat update ($inc operation)
  if (update.$inc) {
    return next();
  }

  // Skip lastEditedAt update if timestamps are explicitly disabled
  if (this.getOptions().timestamps === false) {
    return next();
  }

  const now = new Date();
  
  if (!update.$set) {
    update.$set = {};
  }
  
  update.$set.lastEditedAt = now;
  
  next();
});

// Export as ListModel to match imports across the application
export const ListModel = models.List || model('List', listSchema);