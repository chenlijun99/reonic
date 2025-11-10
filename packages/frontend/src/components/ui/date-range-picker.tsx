import * as React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DateRangePicker as AriaDateRangePicker,
  DateInput,
  DateSegment,
  Dialog as AriaDialog,
  RangeCalendar,
  CalendarGrid,
  CalendarCell,
  Heading,
  Button as AriaButton,
  Group,
  Popover,
  type DateRangePickerProps as AriaDateRangePickerProps,
} from 'react-aria-components';

import { cn } from '@/lib/utils';

export interface DateRangePickerProps extends AriaDateRangePickerProps<any> {
  className?: string;
}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <AriaDateRangePicker
        ref={ref}
        className={cn('group flex flex-col gap-2', className)}
        {...props}
      >
        <Group className="flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <DateInput slot="start" className="flex flex-1 items-center gap-1">
            {(segment) => (
              <DateSegment
                segment={segment}
                className={cn(
                  'rounded p-0.5 tabular-nums outline-none focus:bg-accent focus:text-accent-foreground',
                  segment.isPlaceholder && 'text-muted-foreground',
                )}
              />
            )}
          </DateInput>
          <span aria-hidden="true" className="px-2 text-muted-foreground">
            –
          </span>
          <DateInput slot="end" className="flex flex-1 items-center gap-1">
            {(segment) => (
              <DateSegment
                segment={segment}
                className={cn(
                  'rounded p-0.5 tabular-nums outline-none focus:bg-accent focus:text-accent-foreground',
                  segment.isPlaceholder && 'text-muted-foreground',
                )}
              />
            )}
          </DateInput>
          <AriaButton className="ml-2 outline-none">
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </AriaButton>
        </Group>
        <Popover
          className={cn(
            'z-50 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none',
            'data-[entering]:animate-in data-[exiting]:animate-out',
            'data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
            'data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95',
          )}
        >
          <AriaDialog className="outline-none">
            <RangeCalendar>
              <header className="flex items-center justify-between pb-2">
                <AriaButton
                  slot="previous"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground outline-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </AriaButton>
                <Heading className="text-sm font-medium" />
                <AriaButton
                  slot="next"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground outline-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </AriaButton>
              </header>
              <CalendarGrid className="mt-4 border-collapse space-y-1">
                {(date) => (
                  <CalendarCell
                    date={date}
                    className={cn(
                      'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                      'h-9 w-9 rounded-md outline-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground',
                      'data-[selection-start]:rounded-l-md data-[selection-end]:rounded-r-md',
                      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
                      'data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50',
                      'data-[focused]:bg-accent data-[focused]:text-accent-foreground',
                    )}
                  />
                )}
              </CalendarGrid>
            </RangeCalendar>
          </AriaDialog>
        </Popover>
      </AriaDateRangePicker>
    );
  },
);
DateRangePicker.displayName = 'DateRangePicker';

export { DateRangePicker };
