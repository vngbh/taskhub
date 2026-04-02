"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  name: string;
  defaultValue?: string; // ISO date string "YYYY-MM-DD"
}

export function DatePicker({ name, defaultValue }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    defaultValue ? new Date(defaultValue + "T00:00:00") : undefined,
  );
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Hidden input carries the value for form submission */}
      <input
        type="hidden"
        name={name}
        value={date ? format(date, "yyyy-MM-dd") : ""}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            data-empty={!date}
            className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground h-9 px-3"
          >
            {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
            defaultMonth={date}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
