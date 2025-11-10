import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import NotFound from '@/views/NotFound';
import Index from '@/views/Index';
import SimulationIndex from '@/views/simulation/Index';
import SimulationByIdIndex from '@/views/simulation/id/Index';
import CompareSimulationsIndex from '@/views/compare-simulations/Index';
import { persistor, store } from '@/store';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <PersistGate loading={null} persistor={persistor}>
                <Index />
              </PersistGate>
            }
          >
            <Route index element={<Navigate to="/simulation" />} />

            <Route path="/simulation/">
              <Route index element={<SimulationIndex />} />
              <Route path=":id" element={<SimulationByIdIndex />} />
            </Route>
            <Route
              path="/compare-simulations"
              element={<CompareSimulationsIndex />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
