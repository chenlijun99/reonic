import {
  addMilliseconds,
  addDays,
  min,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfWeek,
  startOfYear,
  differenceInMilliseconds,
} from 'date-fns';

import type {
  ChargingEvent,
  SimulationConfig,
  SimulationResult,
} from './types.ts';

export function getChargepointCount(config: SimulationConfig): number {
  let totalChargepoints = 0;
  for (const [, count] of config.chargepoints) {
    totalChargepoints += count;
  }
  return totalChargepoints;
}

interface Statistics {
  /**
   * Total energy (in kWh)
   */
  totalEnergy: number;
  /**
   * Theoreical maximum power required if all charging points are in charge (in kW)
   */
  theoreticalMaxPower: number;
  /**
   * Actual maximum power measured during the simulation (in kW)
   */
  actualMaxPower: number;
  /**
   * Ratio between actualMaxPower and theoreticalMaxPower
   */
  concurrencyFactor: number;
}

export function computeStatistics(
  config: SimulationConfig,
  perTickData: SimulationResult['perTickData'],
): Statistics {
  const TICK_DURATION_HOURS = config.simulationGranularityMs / 1000 / 60 / 60;

  let statistics: Statistics = {
    totalEnergy: 0,
    theoreticalMaxPower: 0,
    actualMaxPower: 0,
    concurrencyFactor: 0,
  };

  // Compute theoretical maximum power demand
  for (const [{ power }, count] of config.chargepoints) {
    statistics.theoreticalMaxPower += power * count;
  }

  // Compute total energy and maximum power
  for (let tick = 0; tick < perTickData.length; tick++) {
    let totalPowerAtTick = 0;
    for (const cpPower of perTickData[tick].powerDemandsPerChargepointKw) {
      totalPowerAtTick += cpPower;
    }
    if (totalPowerAtTick > statistics.actualMaxPower) {
      statistics.actualMaxPower = totalPowerAtTick;
    }
    statistics.totalEnergy += totalPowerAtTick * TICK_DURATION_HOURS;
  }

  statistics.concurrencyFactor =
    statistics.actualMaxPower / statistics.theoreticalMaxPower;

  return statistics;
}

function getMsFromStartOfYear(date: Date): number {
  return differenceInMilliseconds(date, startOfYear(date));
}

function clampIndex(index: number, max: number): number {
  return Math.max(0, Math.min(index, max));
}

/**
 * Filters simulation tick data based on a given time range.
 * The `from` and `to` dates are interpreted as milliseconds elapsed
 * from the start of the *current year* of the given Date object.
 */
export function filterTickData(
  config: SimulationConfig,
  perTickData: SimulationResult['perTickData'],
  range: { from?: Date; to?: Date },
): SimulationResult['perTickData'] {
  const granularityMs = config.simulationGranularityMs;

  let startIndex = 0;
  let endIndex = perTickData.length;

  // Calculate startIndex based on range.from
  if (range.from !== undefined) {
    const fromMs = getMsFromStartOfYear(range.from);
    const calculatedStartIndex = Math.floor(fromMs / granularityMs);
    startIndex = clampIndex(calculatedStartIndex, perTickData.length);
  }

  // Calculate endIndex based on range.to
  if (range.to !== undefined) {
    const toMs = getMsFromStartOfYear(range.to);
    const calculatedEndIndex = Math.ceil(toMs / granularityMs);
    endIndex = clampIndex(calculatedEndIndex, perTickData.length);
  }

  // If the calculated range is invalid (e.g., from > to, or completely outside data)
  if (startIndex >= endIndex) {
    return [];
  }

  return perTickData.slice(startIndex, endIndex);
}

/**
 * Filters simulation charging events based on a given time range.
 * An event is kept if its charging interval (startTick to endTick, inclusive)
 * at least partially overlaps with the filter range.
 * The `from` and `to` dates are interpreted as milliseconds elapsed
 * from the start of the *current year* of the given Date object.
 * The chargingEvents array is assumed to be sorted by endTick.
 */
export function filterChargingEvents(
  config: SimulationConfig,
  chargingEvents: SimulationResult['chargingEvents'],
  range: { from?: Date; to?: Date },
): SimulationResult['chargingEvents'] {
  const granularityMs = config.simulationGranularityMs;

  let filterTickStart = 0;
  // Use Number.MAX_SAFE_INTEGER to represent an open-ended filter range for 'to'
  let filterTickEnd = Number.MAX_SAFE_INTEGER;

  if (range.from !== undefined) {
    const fromMs = getMsFromStartOfYear(range.from);
    filterTickStart = Math.max(0, Math.floor(fromMs / granularityMs));
  }

  if (range.to !== undefined) {
    const toMs = getMsFromStartOfYear(range.to);
    // Use Math.ceil to make filterTickEnd an exclusive upper bound for the tick range
    filterTickEnd = Math.max(0, Math.ceil(toMs / granularityMs));
  }

  // If the filter range is invalid or empty (e.g., from > to)
  if (filterTickStart >= filterTickEnd) {
    return [];
  }

  const filteredEvents: SimulationResult['chargingEvents'] = [];

  for (const event of chargingEvents) {
    // Check for overlap: [event.startTick, event.endTick] overlaps with [filterTickStart, filterTickEnd)
    // An overlap occurs if the event starts before the filter ends AND the event ends after the filter starts.
    const overlaps =
      event.startTick < filterTickEnd && event.endTick >= filterTickStart;

    if (overlaps) {
      filteredEvents.push(event);
    }
  }

  return filteredEvents;
}

type CalendarUnit = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// Helper function to get the start of a calendar window using date-fns
function getCalendarWindowStart(date: Date, type: CalendarUnit): Date {
  switch (type) {
    case 'hourly':
      return startOfHour(date);
    case 'daily':
      return startOfDay(date);
    case 'weekly':
      // For week, weekStartsOn: 1 means Monday.
      return startOfWeek(date, { weekStartsOn: 1 });
    case 'monthly':
      return startOfMonth(date);
    case 'yearly':
      return startOfYear(date);
  }
}

function addCalendarUnit(date: Date, type: CalendarUnit): Date {
  switch (type) {
    case 'hourly':
      return addHours(date, 1);
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addWeeks(date, 1);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
  }
}

/**
 * Aggregates simulation tick data over specified time windows using a provided callback function.
 * Window definitions are provided by a generator, allowing for arbitrary and variable window sizes.
 *
 * @param config - The simulation configuration, primarily used for `simulationGranularityMs`.
 * @param tickData - An array of SimulationResultPerTickData, where each element corresponds to one simulation tick.
 * @param simulationStartDate - The Date object corresponding to the very first tick (tickData[0]) of the entire simulation.
 * @param aggregationWindowGenerator - A generator that yields `WindowDescriptor` objects defining each aggregation window.
 * @param aggregateCallback - A function that takes an array of SimulationResultPerTickData (the window)
 *                            and returns a single aggregated result of type `T` for that window.
 * @returns An array of objects, each containing the `date` (start of the aggregation window) and the `data` (aggregated result of type `T`).
 */
export function aggregateTickData<T>(
  config: SimulationConfig,
  tickData: SimulationResult['perTickData'],
  aggregationWindowGenerator: AggregationWindowGenerator,
  aggregateCallback: (window: SimulationResult['perTickData']) => T,
): Array<{ date: Date; data: T }> {
  const { simulationGranularityMs } = config;
  const results: Array<{ date: Date; data: T }> = [];
  let currentOverallTickOffset = 0; // Tracks the current position in the overall `tickData` array

  for (const { windowStartDate, durationMs } of aggregationWindowGenerator) {
    if (currentOverallTickOffset >= tickData.length) {
      break; // No more simulation data to process
    }

    // Calculate the number of ticks this window's duration spans
    const ticksForThisWindow = Math.ceil(durationMs / simulationGranularityMs);

    // If the window has a valid duration in terms of ticks
    if (ticksForThisWindow > 0) {
      // Determine the actual slice of tickData for this window
      const windowSlice = tickData.slice(
        currentOverallTickOffset,
        currentOverallTickOffset + ticksForThisWindow,
      );

      // Only aggregate if there's actual data in the slice
      if (windowSlice.length > 0) {
        results.push({
          date: windowStartDate,
          data: aggregateCallback(windowSlice),
        });
      }

      // Advance the overall tick offset by the number of ticks consumed by this window
      currentOverallTickOffset += ticksForThisWindow;
    }
  }

  return results;
}

export enum ChargingEventAggregationStrategy {
  StartPoint = 'START_POINT', // Assigns event to the window its start time falls into
  EndPoint = 'END_POINT', // Assigns event to the window its end time falls into
  Overlap = 'OVERLAP', // Assigns event to all windows it overlaps with
}

/**
 * Aggregates simulation charging events over specified time windows using a provided callback function.
 * Window definitions are provided by a generator, allowing for arbitrary and variable window sizes.
 *
 * @param config - The simulation configuration, primarily used for `simulationGranularityMs`.
 * @param chargingEvents - An array of ChargingEvent objects.
 * @param simulationStartDate - The Date object corresponding to the very first tick (tick 0) of the simulation.
 *                              This is crucial for mapping the date-based windows from the generator
 *                              to the tick-based charging events.
 * @param aggregationWindowGenerator - A generator that yields `WindowDescriptor` objects defining each aggregation window.
 * @param aggregateCallback - A function that takes an array of ChargingEvent (the window)
 *                            and returns a single aggregated result of type `T` for that window,
 *                            along with a boolean indicating if aggregation should continue.
 * @param aggregationStrategy - The strategy to use for attributing events to aggregation windows.
 * @returns An array of objects, each containing the `date` (start of the aggregation window) and the `data` (aggregated result of type `T`).
 */
export function aggregateChargingEvents<T>(
  config: SimulationConfig,
  chargingEvents: SimulationResult['chargingEvents'],
  simulationStartDate: Date,
  aggregationWindowGenerator: AggregationWindowGenerator,
  aggregateCallback: (window: ChargingEvent[]) => [T, boolean],
  aggregationStrategy: ChargingEventAggregationStrategy = ChargingEventAggregationStrategy.Overlap,
): Array<{ date: Date; data: T }> {
  const granularityMs = config.simulationGranularityMs;
  const aggregatedResults: Array<{ date: Date; data: T }> = [];

  let currentEventPointer = 0;

  for (const { windowStartDate, durationMs } of aggregationWindowGenerator) {
    // Offset could be negative
    const windowStartOffsetMs = differenceInMilliseconds(
      windowStartDate,
      simulationStartDate,
    );
    const windowTickStart = Math.floor(windowStartOffsetMs / granularityMs);

    // The exclusive end of the current window in milliseconds from simulationStartDate.
    const windowEndOffsetMs = windowStartOffsetMs + durationMs;
    // The exclusive end tick of the current window.
    const windowTickEnd = Math.ceil(windowEndOffsetMs / granularityMs);

    const eventsInWindow: ChargingEvent[] = [];

    // Advance currentEventPointer past events that have completely ended before the current window starts.
    // Since `chargingEvents` is assumed to be sorted by `endTick` (as per previous documentation),
    // this efficiently skips irrelevant events for this window and future windows.
    while (
      currentEventPointer < chargingEvents.length &&
      chargingEvents[currentEventPointer].endTick < windowTickStart
    ) {
      currentEventPointer++;
    }

    // Iterate through remaining events from `currentEventPointer` to find those that belong to the current window.
    for (let j = currentEventPointer; j < chargingEvents.length; j++) {
      const event = chargingEvents[j];
      let shouldInclude = false;
      switch (aggregationStrategy) {
        case ChargingEventAggregationStrategy.StartPoint:
          // Include event if its `startTick` falls within the current window [windowTickStart, windowTickEnd)
          if (
            event.startTick >= windowTickStart &&
            event.startTick < windowTickEnd
          ) {
            shouldInclude = true;
          }
          break;
        case ChargingEventAggregationStrategy.EndPoint:
          // Include event if its `endTick` falls within the current window [windowTickStart, windowTickEnd)
          // Note: `event.endTick` is inclusive, `windowTickEnd` is exclusive.
          if (
            event.endTick >= windowTickStart &&
            event.endTick < windowTickEnd
          ) {
            shouldInclude = true;
          }
          break;
        case ChargingEventAggregationStrategy.Overlap:
        default:
          // Include event if it overlaps with the current window [windowTickStart, windowTickEnd)
          if (
            event.startTick < windowTickEnd &&
            event.endTick >= windowTickStart
          ) {
            shouldInclude = true;
          }
          break;
      }

      if (shouldInclude) {
        eventsInWindow.push(event);
      }
    }

    const [data, toContinue] = aggregateCallback(eventsInWindow);
    aggregatedResults.push({
      date: windowStartDate,
      data,
    });
    if (!toContinue) {
      return aggregatedResults;
    }
    if (currentEventPointer === chargingEvents.length) {
      break;
    }
  }

  return aggregatedResults;
}

const MAX_DATE = new Date(8640000000000000);

type WindowDescriptor = {
  /** The start date of this aggregation window. This is used for the 'date' property in the result. */
  windowStartDate: Date;
  /** The duration of this aggregation window in milliseconds. */
  durationMs: number;
};

type AggregationWindowGenerator = Generator<WindowDescriptor, void, undefined>;

/**
 * Generates window descriptors for fixed millisecond-duration windows.
 *
 * @param simulationStartDate The global start date of the simulation data.
 * @param windowDurationMs The fixed duration of each window in milliseconds.
 * @param simulationEndDate The global exclusive end date of the simulation data (optional).
 * @returns A generator that yields { windowStartDate: Date, durationMs: number } for each fixed window.
 */
export function* fixedDurationWindowGenerator(
  simulationStartDate: Date,
  windowDurationMs: number,
  simulationEndDate?: Date,
): AggregationWindowGenerator {
  if (windowDurationMs <= 0) {
    throw new Error('Window duration must be positive.');
  }

  let currentWindowStart = simulationStartDate;
  const effectiveEndDate = simulationEndDate ?? MAX_DATE;

  while (currentWindowStart.getTime() < effectiveEndDate.getTime()) {
    const actualWindowEnd = min([
      addMilliseconds(currentWindowStart, windowDurationMs),
      effectiveEndDate,
    ]);

    const durationMs = differenceInMilliseconds(
      actualWindowEnd,
      currentWindowStart,
    );

    yield {
      windowStartDate: currentWindowStart,
      durationMs: durationMs,
    };

    currentWindowStart = actualWindowEnd;
  }
}

/**
 * Abstract calendar window generator for common logic.
 *
 * @param simulationStartDate The global start date of the simulation data.
 * @param unitType The calendar unit (e.g., 'monthly', 'hourly').
 * @param simulationEndDate The global exclusive end date of the simulation data (optional).
 * @returns A generator that yields { windowStartDate: Date, durationMs: number } for each calendar window.
 */
export function* calendarWindowGenerator(
  simulationStartDate: Date,
  unitType: CalendarUnit,
  simulationEndDate?: Date,
): AggregationWindowGenerator {
  const effectiveEndDate = simulationEndDate ?? MAX_DATE;

  let currentIterationPoint = getCalendarWindowStart(
    simulationStartDate,
    unitType,
  );

  while (currentIterationPoint.getTime() < effectiveEndDate.getTime()) {
    const windowSliceEndDate = min([
      addCalendarUnit(currentIterationPoint, unitType),
      effectiveEndDate,
    ]);

    const durationMs = differenceInMilliseconds(
      windowSliceEndDate,
      currentIterationPoint,
    );

    yield {
      windowStartDate: currentIterationPoint,
      durationMs: durationMs,
    };

    currentIterationPoint = windowSliceEndDate;
  }
}
