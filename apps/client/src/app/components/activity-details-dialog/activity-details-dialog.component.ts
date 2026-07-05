import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import type { CreateActivityInput } from '../../types/data.types';
import type { ActivityDetailsDialogData } from './activity-details-dialog.types';

@Component({
  selector: 'app-activity-details-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './activity-details-dialog.component.html',
  styleUrl: './activity-details-dialog.component.css',
})
export class ActivityDetailsDialogComponent {
  // injections
  private readonly data = inject<ActivityDetailsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<
    MatDialogRef<ActivityDetailsDialogComponent, CreateActivityInput | undefined>
  >(MatDialogRef);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  // data
  protected readonly isEditing: boolean = Boolean(this.data.activity);
  protected readonly form = this.formBuilder.group({
    name: [this.data.activity?.name ?? '', [Validators.required]],
    description: [this.data.activity?.description ?? ''],
    icon: [this.data.activity?.icon ?? 'hiking'],
    color: [this.data.activity?.color ?? '#005f73'],
  });

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();
    const input: CreateActivityInput = {
      name: value.name.trim(),
      description: optionalTrim(value.description),
      icon: optionalTrim(value.icon),
      color: optionalTrim(value.color),
    };

    this.dialogRef.close(input);
  }
}

function optionalTrim(value: string): string | undefined {
  const trimmedValue: string = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}
