import { parseDate } from '@internationalized/date';
import { format, startOfDay, endOfDay } from 'date-fns';

import { DateRangePicker } from '@/components/ui/date-range-picker';

export interface DateRange {
  from: Date;
  to: Date;
}

const ISO8601_DATE_FORMAT = 'yyyy-MM-dd';

interface SimulationResultDateRangeFilterProps {
  value: DateRange;
  onChange?: (range: DateRange) => void;
}

export const SimulationResultDateRangeFilter = ({
  value,
  onChange,
}: SimulationResultDateRangeFilterProps) => {
  const handleDateRangeChange = (value: any) => {
    if (value?.start && value?.end) {
      const fromDate = startOfDay(
        new Date(value.start.year, value.start.month - 1, value.start.day),
      );
      const toDate = endOfDay(
        new Date(value.end.year, value.end.month - 1, value.end.day),
      );
      onChange?.({ from: fromDate, to: toDate });
    }
  };
  const dateRangeValue = {
    start: parseDate(format(value.from, ISO8601_DATE_FORMAT)),
    end: parseDate(format(value.to, ISO8601_DATE_FORMAT)),
  };

  if (value.from.getFullYear() !== value.to.getFullYear()) {
    throw new Error('Only date selection within a single year is supported');
  }

  return (
    <DateRangePicker
      fixedYear={value.from.getFullYear()}
      includeMonthSelection
      value={dateRangeValue}
      onChange={handleDateRangeChange}
    />
  );
};
