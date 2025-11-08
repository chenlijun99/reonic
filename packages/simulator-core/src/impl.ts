import { prng_arc4 } from 'esm-seedrandom';

import {
  type SimulationResultPerTickData,
  type SimulationConfig,
  type SimulationResult,
} from './types.ts';

/**
 * Creates a seeded pseudo-random number generator (PRNG) using a Linear Congruential Generator (LCG).
 * @param seed Optional seed value. If not provided, a seed based on current time is used.
 * @returns A function that generates a pseudo-random number between 0 (inclusive) and 1 (exclusive).
 */
function createSeededRNG(seed?: number): () => number {
  // Default to a random seed if none provided
  let s = seed !== undefined ? seed : Math.random();
  const prng = prng_arc4(s);

  return function () {
    return prng();
  };
}

interface ChargepointState {
  id: number;
  /**
   * Charging power of the chargepoint
   */
  powerKw: number;
  /**
   * State about the current EV being charged.
   * If null, it means the chargepoint is free
   */
  evCharging: {
    // The current remaining kWh to be delivered
    remainingChargeKWh: number;
    startTick: number;
  } | null;
}

class CarChargingDemandSelector {
  private cumulativeProbs: { km: number; cumulativeProbability: number }[];

  constructor(
    probabilityDistribution: SimulationConfig['chargingNeeds']['probabilityDistribution'],
  ) {
    this.cumulativeProbs = this.precomputeCumulativeProbs(
      probabilityDistribution,
    );
  }

  private precomputeCumulativeProbs(
    probabilityDistribution: SimulationConfig['chargingNeeds']['probabilityDistribution'],
  ) {
    const cumulativeProbs: CarChargingDemandSelector['cumulativeProbs'] = [];
    let cumulativeProbability = 0;
    for (const [kmNeed, probability] of probabilityDistribution) {
      cumulativeProbability += probability;
      cumulativeProbs.push({
        km: kmNeed,
        cumulativeProbability: cumulativeProbability,
      });
    }

    return cumulativeProbs;
  }

  /**
   * Get a random charging demand in kilometers
   * @param rng The random number generator function.
   * @returns The selected charging demand in kilometers.
   */
  getRandomChargingNeed(state: SimulationState): number {
    // TODO: use binary search
    const rand = state.prng();
    for (const entry of this.cumulativeProbs) {
      if (rand < entry.cumulativeProbability) {
        return entry.km;
      }
    }

    return this.cumulativeProbs[this.cumulativeProbs.length - 1].km;
  }
}

interface SimulationState {
  config: SimulationConfig;
  current_tick: number;
  chargepoints: ChargepointState[];
  /**
   * Returns a number between 0 and 1.
   */
  prng: () => number;
  carChargingDemandSelector: CarChargingDemandSelector;
  arrivalStrategy: ArrivalStrategy;
}

interface ArrivalStrategy {
  simulateArrivals(
    state: SimulationState,
    arrivalProbabilityAtCurrentTick: number,
  ): void;
}

class ArrivalNoArrivalIfOccupied implements ArrivalStrategy {
  simulateArrivals(
    state: SimulationState,
    arrivalProbabilityAtCurrentTick: number,
  ) {
    if (arrivalProbabilityAtCurrentTick === 0) {
      return;
    }
    for (const cp of state.chargepoints) {
      if (!cp.evCharging && state.prng() < arrivalProbabilityAtCurrentTick) {
        const chargingDemandKm =
          state.carChargingDemandSelector.getRandomChargingNeed(state);
        if (chargingDemandKm > 0) {
          const chargeNeeded =
            (chargingDemandKm / 100) * state.config.carConsumptionKWhPer100km;
          cp.evCharging = {
            remainingChargeKWh: chargeNeeded,
            startTick: state.current_tick,
          };
        }
      }
    }
  }
}

interface EV {
  // The total kWh this EV needs
  chargeNeededKWh: number;
}

class ArrivalPerChargepointQueue implements ArrivalStrategy {
  private chargepointQueues: EV[][];

  constructor(chargepointCnt: number) {
    this.chargepointQueues = Array.from({ length: chargepointCnt }, () => []);
  }

  simulateArrivals(
    state: SimulationState,
    arrivalProbabilityAtCurrentTick: number,
  ) {
    for (const cp of state.chargepoints) {
      if (!cp.evCharging && this.chargepointQueues[cp.id].length > 0) {
        const evInQueue = this.chargepointQueues[cp.id].shift()!;
        cp.evCharging = {
          startTick: state.current_tick,
          remainingChargeKWh: evInQueue.chargeNeededKWh,
        };
      }
    }

    if (arrivalProbabilityAtCurrentTick === 0) {
      return;
    }

    for (const cp of state.chargepoints) {
      // An EV attempts to arrive at *each* chargepoint, regardless of its occupancy.
      if (state.prng() < arrivalProbabilityAtCurrentTick) {
        const selectedChargingDemandKm =
          state.carChargingDemandSelector.getRandomChargingNeed(state);
        if (selectedChargingDemandKm > 0) {
          const newEv: EV = {
            chargeNeededKWh:
              (selectedChargingDemandKm / 100) *
              state.config.carConsumptionKWhPer100km,
          };
          if (cp.evCharging) {
            this.chargepointQueues[cp.id].push(newEv);
          } else {
            cp.evCharging = {
              startTick: state.current_tick,
              remainingChargeKWh: newEv.chargeNeededKWh,
            };
          }
        }
      }
    }
  }
}

class ArrivalPerChargepointFindFreeOrGlobalQueue implements ArrivalStrategy {
  private globalQueue: EV[] = [];

  simulateArrivals(state: SimulationState, arrivalProbability: number) {
    // Service EVs from the global queue first
    for (const cp of state.chargepoints) {
      if (!cp.evCharging && this.globalQueue.length > 0) {
        const evToCharge = this.globalQueue.shift()!;
        cp.evCharging = {
          startTick: state.current_tick,
          remainingChargeKWh: evToCharge.chargeNeededKWh,
        };
      }
    }

    if (arrivalProbability === 0) {
      return;
    }

    // Simulate new EV arrivals
    let availableChargepoints = state.chargepoints.filter(
      (cp) => !cp.evCharging,
    );
    for (const cp of state.chargepoints) {
      if (state.prng() < arrivalProbability) {
        const selectedChargingDemandKm =
          state.carChargingDemandSelector.getRandomChargingNeed(state);
        if (selectedChargingDemandKm > 0) {
          const newEV: EV = {
            chargeNeededKWh:
              (selectedChargingDemandKm / 100) *
              state.config.carConsumptionKWhPer100km,
          };
          if (!cp.evCharging) {
            cp.evCharging = {
              startTick: state.current_tick,
              remainingChargeKWh: newEV.chargeNeededKWh,
            };
          } else {
            // Select a free charge point
            // Could implement better selection strategy in future
            const availableCp = (() => {
              while (availableChargepoints.length > 0) {
                const cp = availableChargepoints.shift()!;
                if (!cp.evCharging) {
                  return cp;
                }
              }
            })();
            if (availableCp) {
              availableCp.evCharging = {
                startTick: state.current_tick,
                remainingChargeKWh: newEV.chargeNeededKWh,
              };
            } else {
              this.globalQueue.push(newEV);
            }
          }
        }
      }
    }
  }
}

/**
 * Runs a simulation of EV charging behavior for one year.
 */
export function simulate(config: SimulationConfig): SimulationResult {
  const tickDurationMs = config.simulationGranularityMs;

  const TICKS_PER_HOUR = (1000 * 60 * 60) / tickDurationMs;
  const HOURS_PER_DAY = 24;
  const DAYS_PER_YEAR = 365;
  const TOTAL_TICKS_PER_YEAR = DAYS_PER_YEAR * HOURS_PER_DAY * TICKS_PER_HOUR;
  const TICK_DURATION_HOURS = tickDurationMs / 1000 / 60 / 60;

  /*
   * Initialize simulation state
   */
  let cpIdCounter = 0;
  let chargepoints: ChargepointState[] = [];
  for (const [type, count] of config.chargepoints) {
    for (let i = 0; i < count; i++) {
      chargepoints.push({
        id: cpIdCounter++,
        powerKw: type.power,
        evCharging: null,
      });
    }
  }
  let state: SimulationState = {
    config,
    current_tick: 0,
    chargepoints,
    prng: createSeededRNG(config.seed),
    carChargingDemandSelector: new CarChargingDemandSelector(
      config.chargingNeeds.probabilityDistribution,
    ),
    arrivalStrategy: (() => {
      switch (config.arrivalStrategy) {
        case 'PerChargepointNoArrivalIfOccupied':
          return new ArrivalNoArrivalIfOccupied();
        case 'PerChargepointQueue':
          return new ArrivalPerChargepointQueue(chargepoints.length);
        case 'PerChargepointFindFreeOrGlobalQueue':
          return new ArrivalPerChargepointFindFreeOrGlobalQueue();
      }
    })(),
  };

  /*
   * Initialize simulation result
   */
  let result: SimulationResult = {
    perTickData: [],
    chargingEvents: [],
  };

  /*
   * Main simulation loop
   */
  for (; state.current_tick < TOTAL_TICKS_PER_YEAR; state.current_tick++) {
    // Process existing charges and identify completed ones
    for (const cp of state.chargepoints) {
      if (cp.evCharging) {
        const energyDelivered = cp.powerKw * TICK_DURATION_HOURS;
        cp.evCharging.remainingChargeKWh -= energyDelivered;

        if (cp.evCharging.remainingChargeKWh <= 0) {
          // EV finished charging and departs
          result.chargingEvents.push({
            startTick: cp.evCharging.startTick,
            endTick: state.current_tick,
            chargepointId: cp.id,
          });

          cp.evCharging = null;
        }
      }
    }

    // Handle new EV each hour arrivals and queueing based on strategy
    const arrivalProbabilityAtCurrentTick = (() => {
      if (state.current_tick % TICKS_PER_HOUR === 0) {
        const currentHour =
          Math.floor(state.current_tick / TICKS_PER_HOUR) % HOURS_PER_DAY;
        return (
          config.arrivalAtHour.probabilityDistribution[currentHour] *
          config.arrivalAtHour.multiplier
        );
      }
      return 0;
    })();
    state.arrivalStrategy.simulateArrivals(
      state,
      arrivalProbabilityAtCurrentTick,
    );

    // Record power demand for this tick for each chargepoint
    let perTickData: SimulationResultPerTickData = {
      powerDemandsPerChargepointKw: [],
    };
    for (const cp of state.chargepoints) {
      perTickData.powerDemandsPerChargepointKw.push(
        !!cp.evCharging ? cp.powerKw : 0,
      );
    }
    result.perTickData.push(perTickData);
  }

  return result;
}
