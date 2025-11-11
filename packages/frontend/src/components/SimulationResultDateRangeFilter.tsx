import { useSearchParams } from 'react-router';
import { parseDate } from '@internationalized/date';
import { format, parse, isValid, startOfDay, endOfDay } from 'date-fns';

import { DateRangePicker } from '@/components/ui/date-range-picker';

export interface DateRange {
  from: Date;
  to: Date;
}

const ISO8601_DATE_FORMAT = 'yyyy-MM-dd';
const URL_SEARCH_PARAM_DATE_FROM = 'simResFrom';
const URL_SEARCH_PARAM_DATE_TO = 'simResTo';

function parseDateRange(searchParams: URLSearchParams): DateRange | undefined {
  const from = searchParams.get(URL_SEARCH_PARAM_DATE_FROM);
  if (!from) {
    return;
  }
  const to = searchParams.get(URL_SEARCH_PARAM_DATE_TO);
  if (!to) {
    return;
  }
  const referenceDate = new Date();
  const fromDate = parse(from, ISO8601_DATE_FORMAT, referenceDate);
  if (!isValid(fromDate)) {
    return;
  }
  const toDate = parse(to, ISO8601_DATE_FORMAT, referenceDate);
  if (!isValid(toDate)) {
    return;
  }
  if (fromDate > toDate) {
    return;
  }
  return {
    from: startOfDay(fromDate),
    to: endOfDay(toDate),
  };
}

const DEFAULT_RANGE = {
  from: startOfDay(new Date()),
  to: endOfDay(new Date()),
};

function useSimulationResultDateRangeFilterInternal(): [
  DateRange,
  (dateRange: DateRange) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const range = parseDateRange(searchParams);
  const setRange = (dateRange: DateRange) => {
    setSearchParams((searchParams) => {
      searchParams.set(
        URL_SEARCH_PARAM_DATE_FROM,
        format(dateRange.from, ISO8601_DATE_FORMAT),
      );
      searchParams.set(
        URL_SEARCH_PARAM_DATE_TO,
        format(dateRange.to, ISO8601_DATE_FORMAT),
      );
      return searchParams;
    });
  };

  return [range ?? DEFAULT_RANGE, setRange];
}

export function useSimulationResultDateRangeFilter(): DateRange {
  const [range, _] = useSimulationResultDateRangeFilterInternal();
  return range;
}

export const SimulationResultDateRangeFilter = () => {
  const [dateRange, setDateRange] =
    useSimulationResultDateRangeFilterInternal();

  const handleDateRangeChange = (value: any) => {
    if (value?.start && value?.end) {
      const fromDate = new Date(
        value.start.year,
        value.start.month - 1,
        value.start.day,
      );
      const toDate = new Date(
        value.end.year,
        value.end.month - 1,
        value.end.day,
      );
      setDateRange({ from: fromDate, to: toDate });
    }
  };
  const dateRangeValue = {
    start: parseDate(format(dateRange.from, ISO8601_DATE_FORMAT)),
    end: parseDate(format(dateRange.to, ISO8601_DATE_FORMAT)),
  };

  return (
    <DateRangePicker
      fixedYear={new Date().getFullYear()}
      includeMonthSelection
      value={dateRangeValue}
      onChange={handleDateRangeChange}
    />
  );
};
