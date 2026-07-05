import { Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import type { CreateItemInput } from '../../types/data.types';
import type { ItemDetailsDialogData } from './item-details-dialog.types';

@Component({
  selector: 'app-item-details-dialog',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './item-details-dialog.component.html',
  styleUrl: './item-details-dialog.component.css',
})
export class ItemDetailsDialogComponent {
  // injections
  private readonly data = inject<ItemDetailsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<ItemDetailsDialogComponent, CreateItemInput | undefined>>(
    MatDialogRef,
  );
  private readonly formBuilder = inject(NonNullableFormBuilder);

  // data
  protected readonly activities = computed(() => this.data.activities);
  protected readonly isEditing: boolean = Boolean(this.data.item);
  protected readonly form = this.formBuilder.group({
    name: [this.data.item?.name ?? '', [Validators.required]],
    description: [this.data.item?.description ?? ''],
    categoryId: [this.data.item?.categoryId ?? ''],
    mandatory: [this.data.item?.mandatory ?? false],
    activityIds: [this.data.item?.activityIds ?? this.data.activityIds ?? []],
    notes: [this.data.item?.notes ?? ''],
    size: [this.data.item?.size ?? ''],
    weight: [this.data.item?.weight ?? ''],
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
    const input: CreateItemInput = {
      name: value.name.trim(),
      description: optionalTrim(value.description),
      categoryId: optionalTrim(value.categoryId),
      mandatory: value.mandatory,
      activityIds: value.mandatory ? [] : value.activityIds,
      notes: optionalTrim(value.notes),
      size: optionalTrim(value.size),
      weight: optionalTrim(value.weight),
    };

    this.dialogRef.close(input);
  }
}

function optionalTrim(value: string): string | undefined {
  const trimmedValue: string = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}
