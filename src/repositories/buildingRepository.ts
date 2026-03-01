import type { Building, Incident, VacancySnapshot } from "../domain/types.js";
import type {
  CreateBuildingInput,
  CreateIncidentInput,
  CreateVacancySnapshotInput,
  ResolveIncidentInput
} from "../validation/schemas.js";

export interface BuildingRepository {
  listBuildings(): Promise<Building[]>;
  getBuilding(id: string): Promise<Building | undefined>;
  createBuilding(input: CreateBuildingInput): Promise<Building>;
  addIncident(
    buildingId: string,
    input: CreateIncidentInput
  ): Promise<Incident | undefined>;
  resolveIncident(
    buildingId: string,
    incidentId: string,
    input: ResolveIncidentInput
  ): Promise<Incident | undefined>;
  addVacancySnapshot(
    buildingId: string,
    input: CreateVacancySnapshotInput
  ): Promise<VacancySnapshot | undefined>;
}
