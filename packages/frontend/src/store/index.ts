import { configureStore, combineSlices } from '@reduxjs/toolkit';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import simulationReducer, {
  transformPersistSimulationState,
} from './simulationSlice';

const rootReducer = combineSlices({
  simulation: simulationReducer,
});

type BaseRootState = ReturnType<typeof rootReducer>;

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  transforms: [transformPersistSimulationState],
};

const persistedReducer = persistReducer<BaseRootState>(
  persistConfig,
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // serializableCheck for big simulation result slows down
      // app in development mode quite a bit
      serializableCheck: false,
      /*
      serializableCheck: {
        ignoredActions: [
          'simulation/addRunningSimulation',
          'simulation/runSimulation/fulfilled',
        ].concat([FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]),
        ignoredPaths: [/simulation.simulations.*.result/],
      },
      */
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
