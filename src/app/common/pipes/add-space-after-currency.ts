import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addSpaceAfterCurrency'
})
export class AddSpaceAfterCurrencyPipe implements PipeTransform {
  transform(value: string | null): string {
    if (!value) return '';

    // This regex splits the string into two parts:
    // 1. The currency symbol(s) (any non-digit characters at the beginning)
    // 2. The number (starting with the first digit and everything after)
    return value.replace(/^([^0-9]+)([0-9].*)$/, (_, symbol, number) => {
      // Trim any extra spaces from the symbol and add exactly one space between the symbol and number.
      return symbol.trim() + ' ' + number;
    });
  }
}
