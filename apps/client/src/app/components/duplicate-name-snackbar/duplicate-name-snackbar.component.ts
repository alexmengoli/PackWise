import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import type { Subject } from 'rxjs';

export type DuplicateNameAction = 'overwrite' | 'open';

export interface DuplicateNameSnackbarData {
  readonly action: Subject<DuplicateNameAction>;
  readonly entityLabel: string;
  readonly name: string;
}

@Component({
  selector: 'app-duplicate-name-snackbar',
  imports: [MatButtonModule],
  templateUrl: './duplicate-name-snackbar.component.html',
  styleUrl: './duplicate-name-snackbar.component.css',
})
export class DuplicateNameSnackbarComponent {
  // injections
  private readonly data = inject<DuplicateNameSnackbarData>(MAT_SNACK_BAR_DATA);
  private readonly snackBarRef = inject<MatSnackBarRef<DuplicateNameSnackbarComponent>>(MatSnackBarRef);

  // data
  protected readonly entityLabel: string = this.data.entityLabel;
  protected readonly name: string = this.data.name;

  protected close(): void {
    this.snackBarRef.dismiss();
  }

  protected openExisting(): void {
    this.data.action.next('open');
    this.data.action.complete();
    this.snackBarRef.dismiss();
  }

  protected overwrite(): void {
    this.data.action.next('overwrite');
    this.data.action.complete();
    this.snackBarRef.dismiss();
  }
}
