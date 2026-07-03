import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPen',
  standalone: true
})
export class CurrencyPenPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') {
      return 'S/ 0.00';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return 'S/ 0.00';
    }

    return `S/ ${numericValue.toFixed(2)}`;
  }
}
