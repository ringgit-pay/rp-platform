import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'rp-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control --
         The form control is content-projected via <ng-content>; this wrapping
         <label> implicitly associates it (valid HTML label nesting). -->
    <label class="rp-field">
      @if (label()) {
        <span class="rp-field__label">
          {{ label() }}
          @if (required()) {
            <span class="rp-field__req" aria-hidden="true">*</span>
          }
        </span>
      }
      <ng-content />
      @if (error()) {
        <span class="rp-field__msg rp-field__msg--error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="rp-field__msg">{{ hint() }}</span>
      }
    </label>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .rp-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-family: var(--rp-font-family-sans);
      }
      .rp-field__label {
        font-size: var(--rp-font-size-sm);
        font-weight: var(--rp-font-weight-medium);
        color: var(--rp-text);
      }
      .rp-field__req {
        color: var(--rp-danger);
        margin-left: 2px;
      }
      .rp-field__msg {
        font-size: var(--rp-font-size-xs);
        color: var(--rp-text-muted);
      }
      .rp-field__msg--error {
        color: var(--rp-danger-text);
      }
    `,
  ],
})
export class RpFormField {
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input<boolean>(false);
}
