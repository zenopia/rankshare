"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const feedbackFormSchema = z.object({
  type: z.enum(["bug", "feature", "general", "other"], {
    required_error: "Please select a feedback type",
  }),
  sourcePage: z.string().optional(),
  comment: z.string().min(10, {
    message: "Comment must be at least 10 characters",
  }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  userId?: string | null;
  username?: string;
}

export function FeedbackForm({ userId, username }: FeedbackFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      sourcePage: '',
    },
  });

  // Update source page when URL parameters change
  useEffect(() => {
    const fromParam = searchParams.get('from');
    if (fromParam) {
      const pathParts = fromParam.match(/([^?]+)(\?.*)?/);
      if (pathParts) {
        const path = pathParts[1].replace(/^\//, '');
        const query = pathParts[2] || '';
        form.setValue('sourcePage', path + query);
      }
    }
  }, [searchParams, form]);

  async function onSubmit(data: FeedbackFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId,
          username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success("Feedback submitted successfully");
      form.reset();
      
      // Get the original 'from' parameter from the URL
      const fromPage = searchParams.get('from');
      router.push(fromPage ? fromPage : '/');
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a feedback type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Suggestion</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourcePage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Page Reference (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please describe your feedback in detail..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </Form>
  );
} 