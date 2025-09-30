"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { journalReversalSchema } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { z } from "zod";

type JournalReversalFormData = z.infer<typeof journalReversalSchema>;

interface JournalReversalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: JournalReversalFormData) => Promise<void>;
  journalReference?: string;
}

export function JournalReversalDialog({
  isOpen,
  onClose,
  onConfirm,
  journalReference,
}: JournalReversalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const form = useForm<JournalReversalFormData>({
    resolver: zodResolver(journalReversalSchema),
    defaultValues: {
      reversalReason: "",
      reversalDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: JournalReversalFormData) => {
    try {
      setIsLoading(true);
      await onConfirm(data);
      form.reset();
      onClose();
      toast.success("Journal entry reversed successfully");
    } catch (error) {
      console.error("Error reversing journal:", error);
      toast.error("Failed to reverse journal entry");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Reverse Journal Entry
          </DialogTitle>
          <DialogDescription>
            {journalReference
              ? `You are about to reverse journal entry ${journalReference}. This action cannot be undone and will create a reversal entry.`
              : "You are about to reverse this journal entry. This action cannot be undone and will create a reversal entry."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reversalReason">Reason for Reversal *</Label>
            <Textarea
              id="reversalReason"
              placeholder="Enter the reason for reversing this journal entry..."
              {...form.register("reversalReason")}
              className="min-h-[100px]"
            />
            {form.formState.errors.reversalReason && (
              <p className="text-sm text-red-600">
                {form.formState.errors.reversalReason.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reversalDate">Reversal Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    form.setValue(
                      "reversalDate",
                      selectedDate?.toISOString().split("T")[0] || ""
                    );
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.reversalDate && (
              <p className="text-sm text-red-600">
                {form.formState.errors.reversalDate.message}
              </p>
            )}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">Important:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>
                    • This action will create a reversal entry with opposite
                    amounts
                  </li>
                  <li>• The original entry will be marked as "REVERSED"</li>
                  <li>• This action cannot be undone</li>
                  <li>• The reversal will be posted on the specified date</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Reversing..." : "Reverse Journal Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
