import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { endOfDay, startOfDay, startOfYear } from 'date-fns';

import {
  filterTickData,
  computeStatistics,
  filterChargingEvents,
} from '@reonic/simulator-core/utils';
import { useAppSelector } from '@/hooks';
import type { Simulation } from '@/store/simulationSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PowerChart } from '@/components/charts/PowerChart';
import { ChargingEventsChart } from '@/components/charts/ChargingEventsChart';
import { SimulationResultDateRangeFilter } from '@/components/SimulationResultDateRangeFilter';

const Index = () => {
  const { id } = useParams();

  const [filterDateRange, setFilterDateRange] = useState({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const simulation: Simulation | undefined = useAppSelector(
    (state) => state.simulation.simulations[id!],
  );

  if (!simulation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Simulation {id} not found</p>
        </div>
      </div>
    );
  }

  const result = simulation.result;

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No results available</p>
          <p className="text-sm mt-2">Run this simulation to see results</p>
        </div>
      </div>
    );
  }

  const filteredTickData = useMemo(
    () =>
      filterTickData(simulation.config, result.perTickData, filterDateRange),
    [simulation.config, result.perTickData, filterDateRange],
  );
  const filteredChargeEvents = useMemo(
    () =>
      filterChargingEvents(
        simulation.config,
        result.chargingEvents,
        filterDateRange,
      ),
    [simulation.config, result.chargingEvents, filterDateRange],
  );

  const statistics = computeStatistics(simulation.config, filteredTickData);

  return (
    <>
      <div className="p-4 border-b border-border bg-card shadow-card">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-card-foreground">
            Date Range:
          </span>
          <SimulationResultDateRangeFilter
            value={filterDateRange}
            onChange={setFilterDateRange}
          />
        </div>
      </div>
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text">
            Results for: {simulation.config.name}
          </h2>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Energy Consumed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {statistics.totalEnergy.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  kWh
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Charging Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {filteredChargeEvents.length}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  events
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Peak Power & Concurrency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-card-foreground">
                {statistics.actualMaxPower} kW /{' '}
                {statistics.theoreticalMaxPower} kW
                <div className="text-2xl bg-clip-tex mt-1">
                  {(statistics.concurrencyFactor * 100).toFixed(1)}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <PowerChart
          startDate={filterDateRange.from}
          simulationConfig={simulation.config}
          simulationData={filteredTickData}
        />

        <ChargingEventsChart
          simulationStartDate={startOfYear(filterDateRange.from)}
          chargingEventsFilterStartDate={filterDateRange.from}
          chargingEventsFilterEndDate={filterDateRange.to}
          simulationConfig={simulation.config}
          simulationData={filteredChargeEvents}
        />
      </div>
    </>
  );
};

export default Index;
