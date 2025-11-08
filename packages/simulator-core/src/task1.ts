import { type SimulationConfig } from './types.ts';
import {
  DEFAULT_CHARGING_DEMAND_PROBABILITY_DISTRIBUTION,
  DEFAULT_HOURLY_ARRIVAL_PROBABILITY_DISTRIBUTION,
  DEFAULT_SIMULATION_GRANULARITY_MS,
} from './constants.ts';
import { simulate } from './impl.ts';
import { computeStatistics } from './utils.ts';

const defaultConfig: SimulationConfig = {
  simulationGranularityMs: DEFAULT_SIMULATION_GRANULARITY_MS,
  chargepoints: [[{ power: 11 }, 20]],
  arrivalAtHour: {
    probabilityDistribution: DEFAULT_HOURLY_ARRIVAL_PROBABILITY_DISTRIBUTION,
    multiplier: 1,
  },
  chargingNeeds: {
    probabilityDistribution: DEFAULT_CHARGING_DEMAND_PROBABILITY_DISTRIBUTION,
  },
  carConsumptionKWhPer100km: 18,
  considerDST: false,
  arrivalStrategy: 'PerChargepointNoArrivalIfOccupied',
};

function evaluateSimulation(config: SimulationConfig) {
  const result = simulate(config);
  return computeStatistics(config, result.perTickData);
}

function task1() {
  const statistics = evaluateSimulation(defaultConfig);

  console.log(`Total energy consumed (kWh): ${statistics.totalEnergy}`);
  console.log(
    `Theoretical maximum power demand (kW): ${statistics.theoreticalMaxPower}`,
  );
  console.log(`Actual maximum power demand (kW): ${statistics.actualMaxPower}`);
  console.log(`Concurrency factor (%): ${statistics.concurrencyFactor * 100}`);
}

function task1Bonus1to30Chargepoints() {
  for (let i = 1; i <= 30; ++i) {
    console.log(`With ${i} chargepoints`);
    const statistics = evaluateSimulation({
      ...defaultConfig,
      chargepoints: [[{ power: 11 }, i]],
    });
    console.log(
      `Concurrency factor (%): ${statistics.concurrencyFactor * 100}`,
    );
  }
  console.log('\nAnswer:');
  console.log(
    `Overall, as the number of chargepoints increase, the concurrency factor gets lower.
This is because the more chargepoints we have the less likely that all of them all used at the same time.
`,
  );
}

function task1BonusUseSeededPRNG() {
  console.log('Run the same simulation without seed for 5 times');
  for (let i = 0; i <= 5; ++i) {
    const statistics = evaluateSimulation(defaultConfig);
    console.log(`Total energy consumed (kWh): ${statistics.totalEnergy}`);
    console.log(
      `Actual maximum power demand (kW): ${statistics.actualMaxPower}`,
    );
  }

  console.log('\nRun the same simulation with same seed for 5 times');
  for (let i = 0; i <= 5; ++i) {
    const statistics = evaluateSimulation({ ...defaultConfig, seed: 42 });
    console.log(`Total energy consumed (kWh): ${statistics.totalEnergy}`);
    console.log(
      `Actual maximum power demand (kW): ${statistics.actualMaxPower}`,
    );
  }
  console.log('\nAnswer:');
  console.log(
    'Of course, by seeding the simulation, the result is deterministic when using the same seed.',
  );
}

console.log('\n--------------------------------------');
console.log('**Task 1**');
task1();

console.log('\n--------------------------------------');
console.log('**Task 1 Bonus 1 to 30 chargepoints**');
task1Bonus1to30Chargepoints();

console.log('\n--------------------------------------');
console.log('**Task 1 Bonus Use seeded probabilities**');
task1BonusUseSeededPRNG();
