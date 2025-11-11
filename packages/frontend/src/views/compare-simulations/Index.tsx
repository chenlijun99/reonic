import { useAppSelector } from '@/hooks';
import type { Simulation } from '@/store/simulationSlice';
import { useSelectedSimulationIdsSearchParams } from '@/components/ConfigurationPanel';
import { ConcurrencyFactorComparisonChart } from '@/components/charts/ConcurrenyFactorComparisionChart';

const Error: React.FC<{ id: string; simulation?: Simulation }> = ({
  id,
  simulation,
}) => {
  if (!simulation) {
    return <li>Simulation {id} does not exist</li>;
  }
  if (!simulation.result) {
    return <li>Simulation {id} has not been run yet</li>;
  }
  return null;
};

const Index = () => {
  const selectedSimulations = useSelectedSimulationIdsSearchParams();
  const simulations: (Simulation | undefined)[] = useAppSelector((state) =>
    selectedSimulations.map((id) => state.simulation.simulations[id]),
  );

  if (simulations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No simulations selected to be compared</p>
          <p className="text-sm mt-2">
            Select some simulations and click on "Compare"
          </p>
        </div>
      </div>
    );
  }

  if (!simulations.every((sim) => sim && sim.result)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Problems with the selected simulations</p>
          <ul className="text-sm mt-2 text-left">
            {simulations.map((sim, i) => (
              <Error
                key={selectedSimulations[i]}
                id={selectedSimulations[i]}
                simulation={sim}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <ConcurrencyFactorComparisonChart
        simulationsData={simulations.map((sim) => [
          sim!,
          sim!.result!.perTickData,
        ])}
      />
    </div>
  );
};

export default Index;
