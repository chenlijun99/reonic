import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfWeek,
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
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return date.getTime() - startOfYear.getTime();
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
      return startOfMonth(date);
  }
}

// Helper function to get the exclusive end of a calendar window using date-fns
function getCalendarWindowEnd(date: Date, type: CalendarUnit): Date {
  const windowStart = getCalendarWindowStart(date, type);

  switch (type) {
    case 'hourly':
      return addHours(windowStart, 1);
    case 'daily':
      return addDays(windowStart, 1);
    case 'weekly':
      return addWeeks(windowStart, 1);
    case 'monthly':
      return addMonths(windowStart, 1);
    case 'yearly':
      return addYears(windowStart, 1);
  }
}

/**
 * Aggregates simulation tick data over specified time windows using a provided callback function.
 * Aggregation can be based on fixed millisecond durations or calendar units ("hourly", "daily", "weekly", "monthly").
 * The `startDate` parameter establishes the real-world date and time corresponding to the first tick in `tickData`.
 *
 * @param config - The simulation configuration, primarily used for `simulationGranularityMs`.
 * @param tickData - An array of SimulationResultPerTickData, where each element corresponds to one simulation tick.
 * @param startDate - The Date object corresponding to the very first tick (tickData[0]).
 * @param aggregationWindow - The duration in milliseconds for each aggregation window OR a string representing a calendar unit.
 * @param aggregateCallback - A function that takes an array of SimulationResultPerTickData (the window)
 *                            and returns a single aggregated result of type `T` for that window.
 * @returns An array of objects, each containing the `date` (start of the aggregation window) and the `data` (aggregated result of type `T`).
 */
export function aggregateTickData<T>(
  config: SimulationConfig,
  tickData: SimulationResult['perTickData'],
  startDate: Date,
  aggregationWindow: number | CalendarUnit,
  aggregateCallback: (window: SimulationResult['perTickData']) => T,
): Array<{ date: Date; data: T }> {
  // Changed return type
  const granularityMs = config.simulationGranularityMs;
  const aggregatedResults: Array<{ date: Date; data: T }> = []; // Changed array type
  const totalTicks = tickData.length;

  if (totalTicks === 0) {
    return [];
  }

  // Calculate the exclusive end date of the entire simulation data
  const simulationEndDate = new Date(
    startDate.getTime() + totalTicks * granularityMs,
  );

  if (typeof aggregationWindow === 'number') {
    // Fixed millisecond window aggregation
    if (aggregationWindow <= 0) {
      return [];
    }

    const ticksPerWindow = Math.ceil(aggregationWindow / granularityMs);
    if (ticksPerWindow <= 0) {
      return [];
    }

    for (let i = 0; i < totalTicks; i += ticksPerWindow) {
      const window = tickData.slice(i, i + ticksPerWindow);
      if (window.length > 0) {
        const windowStartDate = new Date(
          startDate.getTime() + i * granularityMs,
        );
        aggregatedResults.push({
          date: windowStartDate,
          data: aggregateCallback(window),
        });
      }
    }
  } else {
    let currentWindowStart = getCalendarWindowStart(
      startDate,
      aggregationWindow,
    );

    while (currentWindowStart.getTime() < simulationEndDate.getTime()) {
      let currentWindowEnd = getCalendarWindowEnd(
        currentWindowStart,
        aggregationWindow,
      );

      // Ensure the window does not extend beyond the actual simulation data
      currentWindowEnd = new Date(
        Math.min(currentWindowEnd.getTime(), simulationEndDate.getTime()),
      );

      // Calculate the start and end indices in the tickData array for this window
      // The start index corresponds to currentWindowStart relative to startDate
      const sliceStartIndex = Math.max(
        0,
        Math.floor(
          (currentWindowStart.getTime() - startDate.getTime()) / granularityMs,
        ),
      );
      // The end index corresponds to currentWindowEnd relative to startDate (exclusive)
      const sliceEndIndex = Math.min(
        totalTicks,
        Math.ceil(
          (currentWindowEnd.getTime() - startDate.getTime()) / granularityMs,
        ),
      );

      // If there's actual data within this calculated slice range
      if (sliceStartIndex < sliceEndIndex) {
        const window = tickData.slice(sliceStartIndex, sliceEndIndex);
        if (window.length > 0) {
          aggregatedResults.push({
            date: currentWindowStart,
            data: aggregateCallback(window),
          });
        }
      }

      // Move to the start of the next calendar window
      currentWindowStart = getCalendarWindowEnd(
        currentWindowStart,
        aggregationWindow,
      );
    }
  }

  return aggregatedResults;
}

/**
 * Aggregates simulation charging events over specified time windows using a provided callback function.
 * Aggregation can be based on fixed millisecond durations or calendar units ("hourly", "daily", "weekly", "monthly").
 * The `startDate` parameter establishes the real-world date and time corresponding to the first tick in the simulation.
 * The `chargingEvents` array is assumed to be sorted by `endTick` for efficient processing.
 *
 * @param config - The simulation configuration, primarily used for `simulationGranularityMs`.
 * @param chargingEvents - An array of ChargingEvent objects.
 * @param startDate - The Date object corresponding to the very first tick (tick 0) of the simulation.
 * @param aggregationWindow - The duration in milliseconds for each aggregation window OR a string representing a calendar unit.
 * @param aggregateCallback - A function that takes an array of ChargingEvent (the window)
 *                            and returns a single aggregated result of type `T` for that window.
 * @returns An array of objects, each containing the `date` (start of the aggregation window) and the `data` (aggregated result of type `T`).
 */
export function aggregateChargingEvents<T>(
  config: SimulationConfig,
  chargingEvents: SimulationResult['chargingEvents'],
  startDate: Date,
  aggregationWindow: number | CalendarUnit,
  aggregateCallback: (window: ChargingEvent[]) => T,
): Array<{ date: Date; data: T }> {
  const granularityMs = config.simulationGranularityMs;
  const aggregatedResults: Array<{ date: Date; data: T }> = [];

  if (chargingEvents.length === 0) {
    return [];
  }

  // Determine the maximum tick covered by any charging event
  // Since chargingEvents is sorted by endTick, the last event determines the max.
  const maxEndTick = chargingEvents[chargingEvents.length - 1].endTick;
  const simulationEndDate = new Date(
    startDate.getTime() + (maxEndTick + 1) * granularityMs,
  ); // +1 to make it exclusive end

  // Pointer to efficiently iterate through chargingEvents for each window
  let currentEventPointer = 0;

  if (typeof aggregationWindow === 'number') {
    // Fixed millisecond window aggregation
    if (aggregationWindow <= 0) {
      return [];
    }

    const ticksPerWindow = Math.ceil(aggregationWindow / granularityMs);
    if (ticksPerWindow <= 0) {
      return [];
    }

    // Iterate through simulation ticks from 0 up to maxEndTick in steps of ticksPerWindow
    for (
      let i = 0;
      i <= maxEndTick || (i === 0 && maxEndTick === 0);
      i += ticksPerWindow
    ) {
      const windowTickStart = i;
      const windowTickEnd = i + ticksPerWindow; // Exclusive end

      const windowStartDate = new Date(
        startDate.getTime() + windowTickStart * granularityMs,
      );

      const eventsInWindow: ChargingEvent[] = [];

      // Advance currentEventPointer to the first event that might overlap this window
      while (
        currentEventPointer < chargingEvents.length &&
        chargingEvents[currentEventPointer].endTick < windowTickStart
      ) {
        currentEventPointer++;
      }

      // Collect all events that overlap with the current window
      for (let j = currentEventPointer; j < chargingEvents.length; j++) {
        const event = chargingEvents[j];
        // If event starts after the window ends, then no more events in this window or subsequent ones (due to sorting)
        if (event.startTick >= windowTickEnd) {
          break;
        }
        // Check for overlap: event.startTick < windowTickEnd && event.endTick >= windowTickStart
        // The condition event.endTick >= windowTickStart is implicitly handled by the outer while loop
        // The condition event.startTick < windowTickEnd is handled by the break condition
        eventsInWindow.push(event);
      }

      if (eventsInWindow.length > 0) {
        aggregatedResults.push({
          date: windowStartDate,
          data: aggregateCallback(eventsInWindow),
        });
      } else if (
        windowStartDate.getTime() < simulationEndDate.getTime() ||
        (windowTickStart === 0 && maxEndTick === 0)
      ) {
        // Even if no events, push an entry for the time window if it's before the simulation end,
        // or if it's the very first window of a simulation with no events.
        // This ensures all time windows are represented if desired, even if empty.
        // A consumer might want to see '0' for power for a given hour.
        // This part is debatable based on exact requirements, currently it ensures a placeholder
        // result if a window exists but has no events.
        aggregatedResults.push({
          date: windowStartDate,
          data: aggregateCallback([]),
        });
      }
    }
  } else {
    // Calendar-based aggregation ("hourly", "daily", "weekly", "monthly")
    let currentWindowStart = getCalendarWindowStart(
      startDate,
      aggregationWindow,
    );

    while (currentWindowStart.getTime() < simulationEndDate.getTime()) {
      let currentWindowEnd = getCalendarWindowEnd(
        currentWindowStart,
        aggregationWindow,
      );

      // Ensure the window does not extend beyond the actual simulation data
      currentWindowEnd = new Date(
        Math.min(currentWindowEnd.getTime(), simulationEndDate.getTime()),
      );

      // Calculate the tick range for this calendar window
      const windowTickStart = Math.max(
        0,
        Math.floor(
          (currentWindowStart.getTime() - startDate.getTime()) / granularityMs,
        ),
      );
      const windowTickEnd = Math.max(
        0,
        Math.ceil(
          (currentWindowEnd.getTime() - startDate.getTime()) / granularityMs,
        ),
      );

      const eventsInWindow: ChargingEvent[] = [];

      if (windowTickStart < windowTickEnd) {
        // Only process if the window has a valid tick duration
        // Advance currentEventPointer for this calendar window
        while (
          currentEventPointer < chargingEvents.length &&
          chargingEvents[currentEventPointer].endTick < windowTickStart
        ) {
          currentEventPointer++;
        }

        for (let j = currentEventPointer; j < chargingEvents.length; j++) {
          const event = chargingEvents[j];
          if (event.startTick >= windowTickEnd) {
            break; // Event starts after window ends, and no further events will overlap
          }
          // The event overlaps if event.startTick < windowTickEnd && event.endTick >= windowTickStart
          // The condition event.endTick >= windowTickStart is implicitly handled by the outer while loop
          // The condition event.startTick < windowTickEnd is handled by the break condition
          eventsInWindow.push(event);
        }
      }

      // Add aggregated result, even if no events in window, to ensure all time periods are represented
      aggregatedResults.push({
        date: currentWindowStart,
        data: aggregateCallback(eventsInWindow),
      });

      // Move to the start of the next calendar window
      currentWindowStart = getCalendarWindowEnd(
        currentWindowStart,
        aggregationWindow,
      );
    }
  }

  return aggregatedResults;
}
