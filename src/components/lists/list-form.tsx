"use client";

import dynamic from 'next/dynamic';
import type { ListFormProps } from './list-form-content';

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

export type { ListFormProps }; 