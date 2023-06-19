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

  validate(control: AbstractControl): ValidationErrors | null {
    const confirmPassword = control.value;

    if (confirmPassword !== this.password) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
