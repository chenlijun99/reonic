import { useState } from 'react';
import { Edit2, Copy, Trash2, Play, Eye, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router';

import {
  simulationActions,
  runSimulation,
  type Simulation,
} from '@/store/simulationSlice';
import { useAppDispatch } from '@/hooks';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SimulationConfigurationEditor } from '@/components/SimulationConfigurationEditor';
import { cn } from '@/lib/utils';

interface ConfigurationCardProps {
  simulation: Simulation;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  onDelete?: () => void;
}

export const ConfigurationCard = ({
  simulation,
  isSelected,
  onChange,
  onDelete,
}: ConfigurationCardProps) => {
  const dispatch = useAppDispatch();
  const [showEditor, setShowEditor] = useState(false);

  const navigate = useNavigate();

  const handleDeleteSimulation = () => {
    if (onDelete) {
      onDelete();
    }
    dispatch(simulationActions.deleteSimulation(simulation.id));
    navigate(`/simulation/`);
  };
  const handleViewResults = () => {
    navigate(`/simulation/${simulation.id}`);
  };

  const statusClass = (() => {
    if (!!simulation.result) {
      return 'bg-success';
    } else if (simulation.running) {
      return 'bg-warning animate-pulse';
    } else {
      return 'bg-muted-foreground';
    }
  })();

  const getSummary = () => {
    let summary = '';
    if (simulation.config.chargepoints.length === 1) {
      const [chargepoint, cnt] = simulation.config.chargepoints[0];
      summary += `${cnt}x${chargepoint.power}kW`;
    } else {
      summary += `${simulation.config.chargepoints.length} Mixed`;
    }
    summary += ` • ${simulation.config.arrivalAtHour.multiplier * 100}% Arrival`;
    summary += ` • Seed: ${simulation.config.seed || 'Random'}`;
    return summary;
  };

  return (
    <>
      <div className="shadow-card hover:shadow-hover rounded-lg p-4 transition-smooth border border-border">
        <div className="flex items-start gap-3">
          <Checkbox
            isSelected={isSelected}
            onChange={onChange}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('w-2 h-2 rounded-full', statusClass)} />
              <h3 className="font-semibold text-card-foreground truncate">
                {simulation.config.name}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground">{getSummary()}</p>

            <div className="flex items-center gap-1 mt-3">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-2"
                isDisabled={!simulation.result}
                onClick={handleViewResults}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Results
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                isDisabled={simulation.running}
                onClick={() => dispatch(runSimulation(simulation.id))}
              >
                <Play className="h-3 w-3 mr-1" />
                Run
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onAction={() => setShowEditor(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onAction={() =>
                      dispatch(
                        simulationActions.addSimulation(simulation.config),
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onAction={handleDeleteSimulation}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {showEditor && (
        <SimulationConfigurationEditor
          config={simulation.config}
          onSave={(newConfig) => {
            dispatch(
              simulationActions.updateSimulation({
                id: simulation.id,
                newConfig,
              }),
            );
            setShowEditor(false);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
};
