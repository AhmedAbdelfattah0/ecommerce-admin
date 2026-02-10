import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'egyptDate',
  standalone: true
})
export class EgyptDatePipe implements PipeTransform {
  transform(value: any, format: string = 'medium'): string | null {
    if (!value) return null;

    // Parse the server time as UTC and convert to Egypt timezone
    // Server returns time like "2025-08-11 14:46:30" which is in UTC
    let dateValue: Date;

    if (typeof value === 'string') {
      // If the string doesn't have timezone info, treat it as UTC
      // Replace space with 'T' and add 'Z' to indicate UTC
      const utcString = value.replace(' ', 'T') + (value.includes('Z') ? '' : 'Z');
      dateValue = new Date(utcString);
    } else {
      dateValue = new Date(value);
    }

    const datePipe = new DatePipe('en-US');
    // Convert the UTC date to Egypt timezone (Africa/Cairo)
    return datePipe.transform(dateValue, format, 'Africa/Cairo');
  }
}
