import type { Address, Coordinates } from './entities';

/** Public open-data services behind one seam, so the pipeline is testable offline. */
export interface FloodDataSource {
  addressByCep(cep: string): Promise<Address>;
  locate(address: Address): Promise<Coordinates>;
  /** Hourly precipitation (mm) from now on, at least 72 entries. */
  hourlyRainMm(point: Coordinates): Promise<number[]>;
  /** Altitude (m) of each point, same order as the input. */
  elevationsM(points: readonly Coordinates[]): Promise<number[]>;
}
