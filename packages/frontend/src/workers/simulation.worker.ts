import { simulate } from '@reonic/simulator-core/impl';
import {
  type SimulationConfig,
  type SimulationResult,
} from '@reonic/simulator-core/types';

self.onmessage = (event: MessageEvent<SimulationConfig>) => {
  const config = event.data;
  const result: SimulationResult = simulate(config);
  self.postMessage({ status: 'success', result });
};
