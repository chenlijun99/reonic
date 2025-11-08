type ChargepointType = {
  power: number;
};

/**
 * Defines how arriving cars behave when chargepoints are occupied.
 */
export type CarArrivalStrategy =
  /**
   * An EV only successfully arrives at a chargepoint if it's free.
   * If occupied, the arrival attempt is "missed" for that tick.
   */
  | 'PerChargepointNoArrivalIfOccupied'
  /**
   * An EV arrives at a specific chargepoint.
   * If that chargepoint is occupied, the EV waits in a queue specifically
   * for that chargepoint.
   */
  | 'PerChargepointQueue'
  /**
   * An EV arrives at the facility. It tries to find any free chargepoint.
   * If all are occupied, it waits in a single global queue.
   */
  | 'PerChargepointFindFreeOrGlobalQueue';

export interface SimulationConfig {
  simulationGranularityMs: number;
  /**
   * Chargepoints configurations
   */
  chargepoints: [ChargepointType, number][];
  /**
   * Car arrival configuration
   */
  arrivalAtHour: {
    /**
     * Array of 24 probabilities. One for each hour.
     */
    probabilityDistribution: number[];
    /**
     * Multiplier to increase/decrease chances of cars' arrival.
     * Should be between 0.2 and 2.
     */
    multiplier: number;
  };
  /**
   * Car demand configuration
   */
  chargingNeeds: {
    /**
     * Map charging need in km to probability ([0, 1])
     */
    probabilityDistribution: [number, number][];
  };
  /**
   * KWh consumed by cars per 100kms
   */
  carConsumptionKWhPer100km: number;
  /**
   * Whether to take into account daylight saving time.
   */
  considerDST: boolean;
  /**
   * Defines how arriving cars behave when chargepoints are occupied.
   */
  arrivalStrategy: CarArrivalStrategy;
  /**
   * Optional seed for the simulation. If not provided, a random one is taken.
   */
  seed?: number;
}

export interface ChargingEvent {
  // ID of the chargepoint where the event occurred
  chargepointId: number;
  // Simulation tick when charging started
  startTick: number;
  // Simulation tick when charging ended
  endTick: number;
}

export interface SimulationResultPerTickData {
  /**
   * Raw power demands for each chargepoint in Kw.
   */
  powerDemandsPerChargepointKw: number[];
}

/**
 * Raw results from a single simulation run.
 */
export interface SimulationResult {
  /**
   * Data produced each tick
   */
  perTickData: SimulationResultPerTickData[];
  /**
   * Detailed records of each charging session from start to finish.
   */
  chargingEvents: ChargingEvent[];
}
