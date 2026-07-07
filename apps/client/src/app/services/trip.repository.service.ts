import { Injectable, type Signal, type WritableSignal, inject, signal } from '@angular/core';
import type { Trip } from '@packwise/shared';

import type { CreateTripInput, PackwiseDataSnapshot, UpdateTripInput } from '../types/data.types';
import { createLocalId } from '../utils/local-id';
import { IndexedDbPackwiseStorageAdapterService } from './indexed-db-packwise-storage.adapter.service';

@Injectable({ providedIn: 'root' })
export class TripRepositoryService {
  // injections
  private readonly storage = inject(IndexedDbPackwiseStorageAdapterService);

  // state
  private readonly tripsSignal: WritableSignal<Trip[]> = signal<Trip[]>([]);
  private readonly loadingSignal: WritableSignal<boolean> = signal<boolean>(true);
  private readonly errorSignal: WritableSignal<unknown> = signal<unknown>(null);
  private readonly initialLoad: Promise<void>;

  // data
  public readonly trips: Signal<Trip[]> = this.tripsSignal.asReadonly();
  public readonly loading: Signal<boolean> = this.loadingSignal.asReadonly();
  public readonly error: Signal<unknown> = this.errorSignal.asReadonly();

  constructor() {
    this.initialLoad = this.refresh();
  }

  public async refresh(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
      this.tripsSignal.set(sortTrips(snapshot.trips ?? []));
    } catch (error: unknown) {
      this.errorSignal.set(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  public async createTrip(input: CreateTripInput): Promise<Trip> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const now: string = new Date().toISOString();
    const trip: Trip = {
      ...input,
      id: createLocalId(),
      activityIds: [...input.activityIds],
      packedItemIds: [...input.packedItemIds],
      createdAt: now,
      updatedAt: now,
    };
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      trips: sortTrips([...(snapshot.trips ?? []), trip]),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.tripsSignal.set(updatedSnapshot.trips);

    return trip;
  }

  public async updateTrip(id: string, input: UpdateTripInput): Promise<Trip> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const currentTrip: Trip = findTrip(snapshot.trips ?? [], id);
    const updatedTrip: Trip = {
      ...currentTrip,
      ...input,
      activityIds: input.activityIds ? [...input.activityIds] : currentTrip.activityIds,
      packedItemIds: input.packedItemIds ? [...input.packedItemIds] : currentTrip.packedItemIds,
      updatedAt: new Date().toISOString(),
    };
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      trips: sortTrips(
        (snapshot.trips ?? []).map((trip: Trip): Trip => (trip.id === updatedTrip.id ? updatedTrip : trip)),
      ),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.tripsSignal.set(updatedSnapshot.trips);

    return updatedTrip;
  }

  public async deleteTrip(id: string): Promise<void> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      trips: (snapshot.trips ?? []).filter((trip: Trip): boolean => trip.id !== id),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.tripsSignal.set(sortTrips(updatedSnapshot.trips));
  }

  public async removeActivityReference(activityId: string): Promise<void> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const trips: Trip[] = snapshot.trips ?? [];

    if (!trips.some((trip: Trip): boolean => trip.activityIds.includes(activityId))) {
      return;
    }

    const now: string = new Date().toISOString();
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      trips: sortTrips(
        trips.map((trip: Trip): Trip =>
          trip.activityIds.includes(activityId)
            ? {
                ...trip,
                activityIds: trip.activityIds.filter((id: string): boolean => id !== activityId),
                updatedAt: now,
              }
            : trip,
        ),
      ),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.tripsSignal.set(updatedSnapshot.trips);
  }

  public async removePackedItemReference(itemId: string): Promise<void> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const trips: Trip[] = snapshot.trips ?? [];

    if (!trips.some((trip: Trip): boolean => trip.packedItemIds.includes(itemId))) {
      return;
    }

    const now: string = new Date().toISOString();
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      trips: sortTrips(
        trips.map((trip: Trip): Trip =>
          trip.packedItemIds.includes(itemId)
            ? {
                ...trip,
                packedItemIds: trip.packedItemIds.filter((id: string): boolean => id !== itemId),
                updatedAt: now,
              }
            : trip,
        ),
      ),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.tripsSignal.set(updatedSnapshot.trips);
  }
}

function findTrip(trips: Trip[], id: string): Trip {
  const trip: Trip | undefined = trips.find((currentTrip: Trip): boolean => currentTrip.id === id);

  if (!trip) {
    throw new Error(`Trip not found: ${id}`);
  }

  return trip;
}

function sortTrips(trips: Trip[]): Trip[] {
  return [...trips].sort((first: Trip, second: Trip): number => second.updatedAt.localeCompare(first.updatedAt));
}
