import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivityRepositoryService } from '../../services/activity.repository.service';
import { DataPortabilityService } from '../../services/data-portability.service';
import { ItemRepositoryService } from '../../services/item.repository.service';

@Component({
  selector: 'app-settings-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.css',
})
export class SettingsPage {
  // injections
  private readonly activityRepository = inject(ActivityRepositoryService);
  private readonly dataPortability = inject(DataPortabilityService);
  private readonly itemRepository = inject(ItemRepositoryService);

  // state
  protected readonly exporting = signal<boolean>(false);
  protected readonly importing = signal<boolean>(false);
  protected readonly statusMessage = signal<string | undefined>(undefined);
  protected readonly errorMessage = signal<string | undefined>(undefined);

  // data
  protected readonly busy = computed((): boolean => this.exporting() || this.importing());

  protected exportData(): void {
    this.exporting.set(true);
    this.statusMessage.set(undefined);
    this.errorMessage.set(undefined);

    void this.dataPortability
      .createExportJson()
      .then((json: string): void => {
        this.downloadJson(json);
        this.statusMessage.set('Your local Packwise data was exported.');
      })
      .catch((error: unknown): void => this.handleError(error, 'Could not export your data.'))
      .finally((): void => this.exporting.set(false));
  }

  protected importData(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const file: File | undefined = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!window.confirm('Import this file and replace your current local Packwise data?')) {
      return;
    }

    this.importing.set(true);
    this.statusMessage.set(undefined);
    this.errorMessage.set(undefined);

    void file
      .text()
      .then((json: string): Promise<void> => this.dataPortability.importJson(json))
      .then((): Promise<void[]> =>
        Promise.all([this.activityRepository.refresh(), this.itemRepository.refresh()]),
      )
      .then((): void => this.statusMessage.set('Your local Packwise data was imported.'))
      .catch((error: unknown): void => this.handleError(error, 'Could not import that JSON file.'))
      .finally((): void => this.importing.set(false));
  }

  private downloadJson(json: string): void {
    const blob: Blob = new Blob([json], { type: 'application/json' });
    const url: string = URL.createObjectURL(blob);
    const link: HTMLAnchorElement = document.createElement('a');

    link.href = url;
    link.download = `packwise-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private handleError(error: unknown, fallbackMessage: string): void {
    console.error(error);
    this.errorMessage.set(error instanceof Error ? error.message : fallbackMessage);
  }
}
