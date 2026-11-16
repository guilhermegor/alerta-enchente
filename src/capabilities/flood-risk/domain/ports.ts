import type { Address, Coordinates, Location } from './entities';

export interface FloodDataSource {
  addressByCep(cep: string): Promise<Address>;
  locate(address: Address): Promise<Location>;
  hourlyRainMm(point: Coordinates): Promise<number[]>;
  elevationsM(points: readonly Coordinates[]): Promise<number[]>;
}
