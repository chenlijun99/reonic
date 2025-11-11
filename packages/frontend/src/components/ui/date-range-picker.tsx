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
  type DateSegmentProps,
  type DateValue,
  type DateRange,
} from 'react-aria-components';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CalendarDate } from '@internationalized/date';

interface RangeMonthCalendarProps {
  currentYear: number;
  onChange?: (data: { start: CalendarDate; end: CalendarDate }) => void;
}

const RangeMonthCalendar = ({
  currentYear,
  onChange,
}: RangeMonthCalendarProps) => {
  const [selectedMonthRange, setSelectedMonthRange] = React.useState<{
    start: number | null;
    end: number | null;
  }>({
    start: null,
    end: null,
  });
  const [hoveredMonth, setHoveredMonth] = React.useState<number | null>(null);

  const monthPresets = [
    { name: 'Jan', month: 1 },
    { name: 'Feb', month: 2 },
    { name: 'Mar', month: 3 },
    { name: 'Apr', month: 4 },
    { name: 'May', month: 5 },
    { name: 'Jun', month: 6 },
    { name: 'Jul', month: 7 },
    { name: 'Aug', month: 8 },
    { name: 'Sep', month: 9 },
    { name: 'Oct', month: 10 },
    { name: 'Nov', month: 11 },
    { name: 'Dec', month: 12 },
  ];

  const handleMonthSelect = (month: number) => {
    if (selectedMonthRange.start === null) {
      // First click - set start month
      setSelectedMonthRange({ start: month, end: null });
    } else if (selectedMonthRange.end === null) {
      // Second click - set end month and apply range
      const startMonth = Math.min(selectedMonthRange.start, month);
      const endMonth = Math.max(selectedMonthRange.start, month);

      const start = new CalendarDate(currentYear, startMonth, 1);
      const daysInEndMonth = new Date(currentYear, endMonth, 0).getDate();
      const end = new CalendarDate(currentYear, endMonth, daysInEndMonth);

      onChange?.({ start, end });
      setSelectedMonthRange({ start: null, end: null });
    } else {
      // Reset and start over
      setSelectedMonthRange({ start: month, end: null });
    }
  };

  const isMonthInRange = (month: number) => {
    if (selectedMonthRange.start === null) return false;
    if (selectedMonthRange.end === null) {
      // Show hover preview
      if (hoveredMonth !== null) {
        const min = Math.min(selectedMonthRange.start, hoveredMonth);
        const max = Math.max(selectedMonthRange.start, hoveredMonth);
        return month >= min && month <= max;
      }
      return month === selectedMonthRange.start;
    }

    const min = Math.min(selectedMonthRange.start, selectedMonthRange.end);
    const max = Math.max(selectedMonthRange.start, selectedMonthRange.end);
    return month >= min && month <= max;
  };

  return (
    <div className="p-3 pb-0">
      <div className="text-xs font-medium text-muted-foreground mb-2">
        {selectedMonthRange.start === null
          ? 'Select start month:'
          : selectedMonthRange.end === null
            ? 'Select end month:'
            : 'Quick select month range:'}
      </div>
      <div className="grid grid-cols-6 gap-1 mb-3">
        {monthPresets.map((preset) => (
          <Button
            key={preset.month}
            variant="outline"
            size="sm"
            className={cn(
              'h-7 px-2 text-xs transition-colors',
              selectedMonthRange.start !== null &&
                selectedMonthRange.end === null &&
                hoveredMonth !== null &&
                isMonthInRange(preset.month) &&
                'bg-primary text-primary-foreground',
            )}
            onClick={() => handleMonthSelect(preset.month)}
            onMouseEnter={() =>
              selectedMonthRange.start !== null &&
              selectedMonthRange.end === null &&
              setHoveredMonth(preset.month)
            }
            onMouseLeave={() => setHoveredMonth(null)}
          >
            {preset.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export interface DateRangePickerProps
  extends AriaDateRangePickerProps<DateValue> {
  /**
   * Whether to fix a year in the date range picker and to allow selection
   * of only dates within that year.
   */
  fixedYear?: number;
  className?: string;
  includeMonthSelection?: boolean;
}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    { className, fixedYear, includeMonthSelection, onChange, ...props },
    ref,
  ) => {
    const conditionalSegment = (segment: DateSegmentProps['segment']) =>
      fixedYear!! && segment.type === 'year' ? (
        <></>
      ) : (
        <DateSegment
          segment={segment}
          className={cn(
            'rounded p-0.5 tabular-nums outline-none focus:bg-accent focus:text-accent-foreground',
            segment.isPlaceholder && 'text-muted-foreground',
          )}
        />
      );
    const [minDate, maxDate] = (() => {
      if (fixedYear!!) {
        return [
          new CalendarDate(fixedYear, 1, 1),
          new CalendarDate(fixedYear, 12, 31),
        ];
      }
      return [null, null];
    })();

    if (includeMonthSelection === true && fixedYear === undefined) {
      throw new Error(
        '`fixedYear` must be provided if `includeMonthSelection` is set',
      );
    }

    const handleMonthSelected = (range: DateRange) => {
      onChange?.(range);
    };

    return (
      <AriaDateRangePicker
        ref={ref}
        className={cn('group flex flex-col gap-2', className)}
        onChange={onChange}
        minValue={minDate}
        maxValue={maxDate}
        {...props}
      >
        <Group className="flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <DateInput slot="start" className="flex flex-1 items-center gap-1">
            {conditionalSegment}
          </DateInput>
          <span aria-hidden="true" className="px-2 text-muted-foreground">
            –
          </span>
          <DateInput slot="end" className="flex flex-1 items-center gap-1">
            {conditionalSegment}
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
            {({ close }) => {
              return (
                <div className="flex flex-col justify-center">
                  {includeMonthSelection && (
                    <RangeMonthCalendar
                      currentYear={fixedYear!}
                      onChange={(range) => {
                        handleMonthSelected(range);
                        close();
                      }}
                    />
                  )}
                  <RangeCalendar>
                    {({ state }) => (
                      <div className="flex flex-col">
                        <header className="flex items-center justify-between pb-2">
                          <AriaButton
                            slot="previous"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground outline-none"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </AriaButton>
                          <Heading className="text-sm font-medium">
                            {fixedYear!! ? (
                              state.visibleRange.start
                                .toDate(state.timeZone)
                                .toLocaleDateString('en-US', { month: 'long' })
                            ) : (
                              <></>
                            )}
                          </Heading>
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
                                'relative flex items-center justify-center text-sm focus-within:relative focus-within:z-20',
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
                      </div>
                    )}
                  </RangeCalendar>
                </div>
              );
            }}
          </AriaDialog>
        </Popover>
      </AriaDateRangePicker>
    );
  },
);
DateRangePicker.displayName = 'DateRangePicker';

export { DateRangePicker };
