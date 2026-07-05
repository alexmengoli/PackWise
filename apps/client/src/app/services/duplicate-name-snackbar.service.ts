import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import {
  DuplicateNameSnackbarComponent,
  type DuplicateNameAction,
} from '../components/duplicate-name-snackbar/duplicate-name-snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class DuplicateNameSnackbarService {
  // injections
  private readonly snackBar = inject(MatSnackBar);

  public open(entityLabel: string, name: string): Observable<DuplicateNameAction> {
    const action: Subject<DuplicateNameAction> = new Subject<DuplicateNameAction>();

    this.snackBar
      .openFromComponent(DuplicateNameSnackbarComponent, {
        data: {
          action,
          entityLabel,
          name,
        },
        duration: 10000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      })
      .afterDismissed()
      .subscribe((): void => {
        action.complete();
      });

    return action.asObservable();
  }
}
