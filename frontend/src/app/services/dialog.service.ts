import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../components/auth/login-dialog/login-dialog';
import { RegisterDialogComponent } from '../components/auth/register-dialog/register-dialog';
import { ApartmentDetailsDialog, ApartmentDetailsDialogData } from '../components/shared/apartment-details-dialog/apartment-details-dialog';
import { ApartmentCreateDialogComponent } from '../components/shared/apartment-create-dialog/apartment-create-dialog';
import { Apartment } from '../models/apartment';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  openLoginDialog() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.openRegister) {
        // If user clicked "Register" in login dialog, open register dialog
        this.openRegisterDialog();
      }
    });

    return dialogRef;
  }

  openRegisterDialog() {
    const dialogRef = this.dialog.open(RegisterDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.openLogin) {
        // If user clicked "Login" in register dialog, open login dialog
        this.openLoginDialog();
      }
    });

    return dialogRef;
  }

  openApartmentDetailsDialog(apartment: Apartment, isAdminView: boolean = false) {
    const dialogRef = this.dialog.open(ApartmentDetailsDialog, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false,
      restoreFocus: true,
      data: {
        apartment,
        isAdminView
      } as ApartmentDetailsDialogData
    });

    return dialogRef;
  }

  openApartmentCreateDialog(ownerId: number) {
    const dialogRef = this.dialog.open(ApartmentCreateDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true,
      data: { ownerId }
    });

    return dialogRef;
  }
}
