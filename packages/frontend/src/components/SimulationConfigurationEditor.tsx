import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

import {
  DEFAULT_CAR_CONSUMPTION_KWH_PER_100KM,
  DEFAULT_CHARGING_DEMAND_PROBABILITY_DISTRIBUTION,
  DEFAULT_HOURLY_ARRIVAL_PROBABILITY_DISTRIBUTION,
  DEFAULT_SIMULATION_GRANULARITY_MS,
} from '@reonic/simulator-core/constants';
import { type Simulation } from '@/store/simulationSlice';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type SimulationConfig = Simulation['config'];
interface SimulationConfigurationEditorProps {
  config?: SimulationConfig;
  onClose: () => void;
  onSave: (config: SimulationConfig) => void;
}

export const SimulationConfigurationEditor = ({
  config,
  onClose,
  onSave,
}: SimulationConfigurationEditorProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState<Partial<SimulationConfig>>(
    config || {
      name: 'New Configuration',
      simulationGranularityMs: DEFAULT_SIMULATION_GRANULARITY_MS,
      chargepoints: [[{ power: 11 }, 20]],
      arrivalAtHour: {
        probabilityDistribution:
          DEFAULT_HOURLY_ARRIVAL_PROBABILITY_DISTRIBUTION,
        multiplier: 1,
      },
      chargingNeeds: {
        probabilityDistribution:
          DEFAULT_CHARGING_DEMAND_PROBABILITY_DISTRIBUTION,
      },
      carConsumptionKWhPer100km: DEFAULT_CAR_CONSUMPTION_KWH_PER_100KM,
      considerDST: false,
      arrivalStrategy: 'PerChargepointQueue',
    },
  );

  const handleSave = () => {
    onSave(formData as SimulationConfig);
  };

  const addChargepointType = () => {
    setFormData((prev) => ({
      ...prev,
      chargepoints: [...(prev.chargepoints || []), [{ power: 11 }, 1]],
    }));
  };

  const removeChargepointType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      chargepoints: prev.chargepoints?.filter((_, i) => i !== index),
    }));
  };

  const updateChargepointType = (index: number, value: number) => {
    setFormData((prev) => ({
      ...prev,
      chargepoints: prev.chargepoints?.map((cp, i) =>
        i === index ? [{ power: value }, cp[1]] : cp,
      ),
    }));
  };

  const updateChargepointTypeCount = (index: number, value: number) => {
    setFormData((prev) => ({
      ...prev,
      chargepoints: prev.chargepoints?.map((cp, i) =>
        i === index ? [cp[0], value] : cp,
      ),
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {config ? `Edit: ${config.name}` : 'New Simulation Configuration'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Configuration Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Configuration Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          {/* Arrival Probability Multiplier */}
          <div className="space-y-2">
            <Label htmlFor="arrivalProp">
              Arrival Probability Multiplier (%)
            </Label>
            <Input
              id="arrivalProp"
              type="number"
              required
              value={(formData.arrivalAtHour?.multiplier || 1) * 100}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  arrivalAtHour: {
                    ...prev?.arrivalAtHour!,
                    multiplier: parseFloat(e.target.value) / 100,
                  },
                }))
              }
              min={20}
              max={200}
            />
          </div>

          {/* Car Consumption */}
          <div className="space-y-2">
            <Label htmlFor="consumption">Car Consumption (kWh/100km)</Label>
            <Input
              id="consumption"
              type="number"
              required
              value={formData.carConsumptionKWhPer100km}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  carConsumptionKWhPer100km: parseFloat(e.target.value),
                }))
              }
            />
          </div>

          {/* Chargepoint Type Selection */}
          <div className="space-y-3">
            <Label>Chargepoint Configuration</Label>
            <div className="space-y-2 pl-6">
              {formData.chargepoints?.map((cp, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="number"
                    required
                    placeholder="Quantity"
                    value={cp[1]}
                    onChange={(e) =>
                      updateChargepointTypeCount(
                        index,
                        parseInt(e.target.value),
                      )
                    }
                    className="w-24"
                  />
                  <span className="text-muted-foreground">×</span>
                  <Input
                    type="number"
                    required
                    placeholder="Power (kW)"
                    value={cp[0].power}
                    onChange={(e) =>
                      updateChargepointType(index, parseFloat(e.target.value))
                    }
                    className="w-32"
                  />
                  <span className="text-muted-foreground">kW</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChargepointType(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addChargepointType}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Chargepoint Type
              </Button>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-border pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="gap-2 w-full justify-start"
            >
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Advanced Simulation Settings
            </Button>

            {showAdvanced && (
              <div className="space-y-4 mt-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="seed">Random Seed</Label>
                  <Input
                    id="seed"
                    type="number"
                    value={formData.seed}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        randomSeed: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dst"
                    isSelected={formData.considerDST}
                    onChange={(isSelected) =>
                      setFormData((prev) => ({
                        ...prev,
                        considerDST: isSelected,
                      }))
                    }
                  />
                  <Label htmlFor="dst" className="font-normal">
                    Consider Daylight Saving Time (DST)
                  </Label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
