import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addSpaceAfterCurrency',
  standalone: true
})
export class AddSpaceAfterCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Convert to string and ensure it's a valid number
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Check if the conversion resulted in a valid number
    if (isNaN(numValue)) {
      return '';
    }

    // Format with SAR currency and add space after the currency symbol
    return `SAR ${numValue.toFixed(2)}`;
  }
}
