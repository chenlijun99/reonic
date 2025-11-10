import { useState } from 'react';
import { Play, CheckSquare, Square, BarChart3, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import {
  DEFAULT_CAR_CONSUMPTION_KWH_PER_100KM,
  DEFAULT_CHARGING_DEMAND_PROBABILITY_DISTRIBUTION,
  DEFAULT_HOURLY_ARRIVAL_PROBABILITY_DISTRIBUTION,
  DEFAULT_SIMULATION_GRANULARITY_MS,
} from '@reonic/simulator-core/constants';
import {
  simulationActions,
  runSimulation,
  type Simulation,
} from '@/store/simulationSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Button } from '@/components/ui/button';
import { ConfigurationCard } from '@/components/ConfigurationCard';
import { SimulationConfigurationEditor } from '@/components/SimulationConfigurationEditor';

const COMPARE_SIMULATIONS_SEARCH_PARAM_KEY = 'compare';

export function useSelectedSimulationIdsSearchParams(): Simulation['id'][] {
  const [searchParams, _] = useSearchParams();
  return searchParams.getAll(COMPARE_SIMULATIONS_SEARCH_PARAM_KEY);
}

const DEFAULT_SIMULATION_CONFIG_PRESET: Simulation['config'] = {
  name: 'Default',
  simulationGranularityMs: DEFAULT_SIMULATION_GRANULARITY_MS,
  chargepoints: [[{ power: 11 }, 20]],
  arrivalAtHour: {
    probabilityDistribution: DEFAULT_HOURLY_ARRIVAL_PROBABILITY_DISTRIBUTION,
    multiplier: 1,
  },
  chargingNeeds: {
    probabilityDistribution: DEFAULT_CHARGING_DEMAND_PROBABILITY_DISTRIBUTION,
  },
  carConsumptionKWhPer100km: DEFAULT_CAR_CONSUMPTION_KWH_PER_100KM,
  considerDST: false,
  arrivalStrategy: 'PerChargepointQueue',
};

export const ConfigurationPanel = () => {
  const dispatch = useAppDispatch();
  const simulations = useAppSelector((state) =>
    Object.values(state.simulation.simulations),
  );

  const [selectedSimulationIds, setSelectedSimulationIds] = useState<
    Set<Simulation['id']>
  >(new Set());

  const selectedCount = selectedSimulationIds.size;
  const allSelected =
    selectedCount === simulations.length && simulations.length > 0;

  const selectAll = () => {
    setSelectedSimulationIds(new Set(simulations.map((s) => s.id)));
  };

  const deselectAll = () => {
    setSelectedSimulationIds(new Set());
  };

  const onSelectionChange = (id: Simulation['id'], isSelected: boolean) => {
    if (isSelected) {
      selectedSimulationIds.add(id);
    } else {
      selectedSimulationIds.delete(id);
    }
    setSelectedSimulationIds(new Set(selectedSimulationIds));
  };

  const onSimulationDelete = (id: Simulation['id']) => {
    selectedSimulationIds.delete(id);
    setSelectedSimulationIds(new Set(selectedSimulationIds));
  };

  const runSelected = () => {
    for (const id of selectedSimulationIds) {
      dispatch(runSimulation(id));
    }
  };

  const deleteSelected = () => {
    for (const id of selectedSimulationIds) {
      dispatch(simulationActions.deleteSimulation(id));
      selectedSimulationIds.delete(id);
    }
    setSelectedSimulationIds(new Set(selectedSimulationIds));
  };

  const generatePresets = () => {
    for (let i = 1; i <= 30; ++i) {
      dispatch(
        simulationActions.addSimulation({
          ...DEFAULT_SIMULATION_CONFIG_PRESET,
          name: `${i}x11kW`,
          chargepoints: [[{ power: 11 }, i]],
        }),
      );
    }
  };

  const navigate = useNavigate();

  const compareSelected = () => {
    const params = new URLSearchParams();
    for (const id of selectedSimulationIds) {
      params.append(COMPARE_SIMULATIONS_SEARCH_PARAM_KEY, id);
    }
    navigate({ pathname: '/compare-simulations', search: params.toString() });
  };

  const [showEditor, setShowEditor] = useState(false);

  return (
    <>
      <div className="w-full border-r border-border bg-card shadow-card flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            Simulation Configurations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {simulations.length} configuration
            {simulations.length !== 1 ? 's' : ''}
          </p>

          <div className="flex flex-col gap-2 mt-4">
            <Button
              onPress={() => setShowEditor(true)}
              variant="default"
              size="sm"
              className="w-full"
            >
              New Simulation
            </Button>

            <Button
              onPress={allSelected ? deselectAll : selectAll}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {allSelected ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select All
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                onPress={runSelected}
                variant="secondary"
                size="sm"
                className="flex-1"
                isDisabled={selectedCount === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Run {selectedCount > 0 && `(${selectedCount})`}
              </Button>

              <Button
                onPress={compareSelected}
                variant="secondary"
                size="sm"
                className="flex-1"
                isDisabled={selectedCount === 0}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare {selectedCount > 0 && `(${selectedCount})`}
              </Button>
            </div>

            <Button
              onPress={deleteSelected}
              variant="secondary"
              size="sm"
              className="w-full text-destructive"
              isDisabled={selectedCount === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Selected {selectedCount > 0 && `(${selectedCount})`}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {simulations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No configurations yet.</p>
                <p className="text-sm mt-1">
                  Click "New Simulation" to create one.
                </p>
                <p className="text-sm mt-1">
                  Click "Generate Presets" to create a set of example simulation
                  configurations.
                </p>
                <Button
                  onPress={generatePresets}
                  variant="secondary"
                  size="sm"
                  className="w-full mt-3"
                >
                  Generate Presets
                </Button>
              </div>
            ) : (
              simulations.map((simulation) => (
                <ConfigurationCard
                  key={simulation.id}
                  simulation={simulation}
                  isSelected={selectedSimulationIds.has(simulation.id)}
                  onChange={(isSelected) =>
                    onSelectionChange(simulation.id, isSelected)
                  }
                  onDelete={() => onSimulationDelete(simulation.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showEditor && (
        <SimulationConfigurationEditor
          onSave={(newConfig) => {
            dispatch(simulationActions.addSimulation(newConfig));
            setShowEditor(false);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
};
