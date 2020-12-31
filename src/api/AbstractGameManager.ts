import {
  EthAddress,
  ExploredChunkData,
  Planet,
  Location,
  LocationId,
  QueuedArrival,
  PlanetLevel,
  Player,
  Upgrade,
  ChunkFootprint,
  SpaceType,
  Artifact,
  ArtifactId,
  LocatablePlanet,
} from '../_types/global/GlobalTypes';
import { EventEmitter } from 'events';
import { WorldCoords } from '../utils/Coordinates';
import {
  UnconfirmedMove,
  UnconfirmedUpgrade,
} from '../_types/darkforest/api/ContractsAPITypes';
import { MiningPattern } from '../utils/MiningPatterns';
import { SerializedPlugin } from '../plugins/SerializedPlugin';

export default interface AbstractGameManager extends EventEmitter {
  destroy(): void;

  getAccount(): EthAddress | null;
  getContractAddress(): EthAddress;
  getTwitter(address: EthAddress | null): string | null;
  getEndTimeSeconds(): number;
  getUpgrade(branch: number, level: number): Upgrade;
  getEnergyCurveAtPercent(planet: Planet, percent: number): number;
  getSilverCurveAtPercent(planet: Planet, percent: number): number | null;

  getAllPlayers(): Player[];
  getExploredChunks(): Iterable<ExploredChunkData>;
  spaceTypeFromPerlin(perlin: number): SpaceType;
  getWorldRadius(): number;
  getWorldSilver(): number;
  getUniverseTotalEnergy(): number;
  getMyArtifacts(): Artifact[]; // gets both deposited artifacts that are on planets i own as well as artifacts i own
  getSilverOfPlayer(player: EthAddress): number;
  getEnergyOfPlayer(player: EthAddress): number;
  getPlanetWithId(planetId: LocationId): Planet | null; // null if planet is neither in contract nor known chunks
  getArtifactWithId(artifactId: ArtifactId): Artifact | null; // null if no artifact with id exists
  getPlanetWithCoords(coords: WorldCoords): Planet | null; // null if not a valid location or if no planet exists at location
  getPlanetHitboxForCoords(
    coords: WorldCoords,
    radiusMap: Record<PlanetLevel, number>
  ): LocatablePlanet | null; // get the planet that these coords are on top of
  getPlanetLevel(planetId: LocationId): PlanetLevel | null; // null if planet is neither in contract nor known chunks. fast; doesn't update planet
  getPlanetDetailLevel(planetId: LocationId): number | null; // null if planet is neither in contract nor known chunks. fast; doesn't update planet
  getLocationOfPlanet(planetId: LocationId): Location | null; // null if we don't know the location of this planet
  getAllOwnedPlanets(): Planet[];
  getMyPlanets(): Planet[];
  getAllPlanets(): Iterable<Planet>;
  getAllVoyages(): QueuedArrival[];
  getUnconfirmedMoves(): UnconfirmedMove[];
  getUnconfirmedUpgrades(): UnconfirmedUpgrade[];
  getHomeCoords(): WorldCoords | null;
  getHomeHash(): LocationId | null;
  hasJoinedGame(): boolean;
  getHashesPerSec(): number;
  getSignedTwitter(twitter: string): Promise<string>;
  getPrivateKey(): string;
  getMyBalance(): number;
  getPerlinThresholds(): [number, number]; // PERLIN_THRESHOLD_1, PERLIN_THRESHOLD_2
  hasMinedChunk(chunkLocation: ChunkFootprint): boolean;

  // miner
  setMiningPattern(pattern: MiningPattern): void;
  getMiningPattern(): MiningPattern | null;
  setMinerCores(nCores: number): void;
  getCurrentlyExploringChunk(): ChunkFootprint | null;
  startExplore(): void;
  stopExplore(): void;
  addNewChunk(chunk: ExploredChunkData): AbstractGameManager;
  bulkAddNewChunks(chunks: ExploredChunkData[]): Promise<void>;

  // account management + chain operations
  findArtifact(planetId: LocationId): AbstractGameManager;
  verifyTwitter(twitter: string): Promise<boolean>;
  // TODO: remove beforeRetry: (e: Error) => Promise<boolean>
  joinGame(beforeRetry: (e: Error) => Promise<boolean>): AbstractGameManager;
  addAccount(coords: WorldCoords): Promise<boolean>;
  move(
    from: LocationId,
    to: LocationId,
    forces: number,
    silver: number
  ): AbstractGameManager;
  upgrade(planetId: LocationId, branch: number): AbstractGameManager;
  buyHat(planetId: LocationId): AbstractGameManager;
  depositArtifact(
    planetId: LocationId,
    artifactId: ArtifactId
  ): AbstractGameManager;
  withdrawArtifact(planetId: LocationId): AbstractGameManager;

  // estimation utils. used for scripting only (not in core client functions)
  getDist(fromId: LocationId, toId: LocationId): number;
  getMaxMoveDist(planetId: LocationId, sendingPercent: number): number;
  getPlanetsInRange(planetId: LocationId, sendingPercent: number): Planet[];
  getEnergyNeededForMove(
    fromId: LocationId,
    toId: LocationId,
    arrivingEnergy: number
  ): number;
  getEnergyArrivingForMove(
    fromId: LocationId,
    toId: LocationId,
    sentEnergy: number
  ): number;
  getTimeForMove(fromId: LocationId, toId: LocationId): number;
  getTemperature(coords: WorldCoords): number;
  loadPlugins(): Promise<SerializedPlugin[]>;
  savePlugins(savedPlugin: SerializedPlugin[]): Promise<void>;
  isPlanetMineable(p: Planet): boolean;
}
