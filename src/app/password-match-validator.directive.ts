/*
 * File: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2\src\app\password-match-validator.directive.ts
 * Project: c:\Users\tonyw\Desktop\WoRTool NG\ng-paapp2
 * Created Date: Sunday July 2nd 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Tue August 1st 2023 12:19:57 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Directive, Input } from "@angular/core";
import {
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";

@Directive({
  selector: "[appPasswordMatchValidator]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordMatchValidatorDirective,
      multi: true,
    },
  ],
})
export class PasswordMatchValidatorDirective implements Validator {
  @Input("appPasswordMatchValidator") password!: string;

  /**
   * Validate the password match
   * @param control - form control
   * @returns - validation errors
   */
  validate(control: AbstractControl): ValidationErrors | null {
    const confirmPassword = control.value;

    if (confirmPassword !== this.password) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
