"use client";

import dynamic from 'next/dynamic';
import type { ListCategory } from '@/types/list';

export interface ListFormProps {
  mode?: 'create' | 'edit';
  defaultValues?: {
    id: string;
    title: string;
    description?: string;
    category: ListCategory;
    privacy: 'public' | 'private';
    items: Array<{
      id: string;
      title: string;
      comment?: string;
      rank: number;
      properties?: Array<{
        type?: 'text' | 'link';
        label: string;
        value: string;
      }>;
    }>;
  };
}

const LoadingForm = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const ListForm = dynamic<ListFormProps>(
  () => import('./list-form-content').then((mod) => mod.ListFormContent),
  {
    ssr: false,
    loading: () => <LoadingForm />
  }
); 