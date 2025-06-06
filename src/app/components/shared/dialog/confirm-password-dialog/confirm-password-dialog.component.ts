import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './confirm-password-dialog.component.html',
  styleUrls: ['./confirm-password-dialog.component.css'],
})
export class ConfirmPasswordDialogComponent {
  formGroup: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ConfirmPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title?: string;
      message?: string;
      confirmText?: string;
      cancelText?: string;
    }
  ) {
    this.formGroup = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onConfirm(): void {
    if (this.formGroup.valid) {
      this.dialogRef.close({
        confirmed: true,
        password: this.formGroup.value.password,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  get passwordControl() {
    return this.formGroup.get('password');
  }
}
