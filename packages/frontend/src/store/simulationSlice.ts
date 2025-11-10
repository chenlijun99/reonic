import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import {
  type SimulationConfig,
  type SimulationResult,
} from '@reonic/simulator-core/types';
import createTransform from 'redux-persist/es/createTransform';

interface NamedSimulationConfig extends SimulationConfig {
  name?: string;
}

export interface Simulation {
  id: string;
  config: NamedSimulationConfig;
  running: boolean;
  result?: SimulationResult;
}

interface SimulationState {
  simulations: Record<Simulation['id'], Simulation>;
}

type PersistedSimulationState = Record<Simulation['id'], NamedSimulationConfig>;

export const transformPersistSimulationState = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: SimulationState, _) => {
    const persisted = Object.entries(inboundState.simulations).reduce(
      (acc, [id, simulation]) => {
        acc[id] = simulation.config;
        return acc;
      },
      {} as PersistedSimulationState,
    );
    return persisted;
  },
  (outboundState: PersistedSimulationState, _) => {
    const deserialized = Object.entries(outboundState).reduce(
      (acc, [id, config]) => {
        acc.simulations[id] = {
          id,
          config,
          running: false,
        };
        return acc;
      },
      { simulations: {} } as SimulationState,
    );
    return deserialized;
  },
  { whitelist: ['simulation'] },
);

const initialState: SimulationState = {
  simulations: {},
};

const simulationWorker = () =>
  new Worker(new URL('../workers/simulation.worker.ts', import.meta.url), {
    type: 'module',
  });

export const runSimulation = createAsyncThunk(
  'simulation/runSimulation',
  async (simulationId: Simulation['id'], { getState }) => {
    const state = getState() as { simulation: SimulationState };
    const simulation = state.simulation.simulations[simulationId];

    const worker = simulationWorker();

    return new Promise<SimulationResult>((resolve, reject) => {
      worker.onmessage = (
        event: MessageEvent<
          | { status: 'success'; result: SimulationResult }
          | { status: 'error'; message: string }
        >,
      ) => {
        // Terminate the worker once done
        worker.terminate();
        if (event.data.status === 'success') {
          resolve(event.data.result);
        } else {
          reject(new Error(event.data.message));
        }
      };
      worker.onerror = (error) => {
        worker.terminate();
        reject(error);
      };
      worker.postMessage(simulation.config);
    });
  },
);

export const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    addSimulation: (state, action: PayloadAction<NamedSimulationConfig>) => {
      let id = uuidv4();
      while (!!state.simulations[id]) {
        id = uuidv4();
      }
      const simulation: Simulation = {
        id,
        running: false,
        config: action.payload,
      };

      state.simulations[simulation.id] = simulation;
    },
    updateSimulation: (
      state,
      action: PayloadAction<{
        id: Simulation['id'];
        newConfig: NamedSimulationConfig;
      }>,
    ) => {
      let simulation = state.simulations[action.payload.id];
      simulation.config = action.payload.newConfig;
      simulation.result = undefined;
    },
    deleteSimulation: (state, action: PayloadAction<Simulation['id']>) => {
      delete state.simulations[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runSimulation.pending, (state, action) => {
        const simulationId = action.meta.arg;
        if (state.simulations[simulationId]) {
          state.simulations[simulationId].running = true;
          state.simulations[simulationId].result = undefined;
        }
      })
      .addCase(runSimulation.fulfilled, (state, action) => {
        const simulationId = action.meta.arg;
        if (state.simulations[simulationId]) {
          state.simulations[simulationId].running = false;
          /*
           * Optimization: shallow freeze the simulation result so that
           * immer.js doesn't need to process it
           */
          state.simulations[simulationId].result = Object.freeze(
            action.payload,
          );
        }
      })
      .addCase(runSimulation.rejected, (state, action) => {
        const simulationId = action.meta.arg;
        if (state.simulations[simulationId]) {
          state.simulations[simulationId].running = false;
        }
      });
  },
});

export const { ...simulationActions } = simulationSlice.actions;

export default simulationSlice.reducer;
