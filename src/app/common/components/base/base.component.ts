import { Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { LayoutModule } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import '@ingka/icon-webc';
import { NgOptimizedImage } from "@angular/common";


@Injectable()

export class BaseComponent implements OnDestroy {
  ngUnSubscribe = new Subject<void>();
  static materialModules = [
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatListModule,
    MatSelectModule,
    LayoutModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    NgOptimizedImage
  ];
  ngOnDestroy(): void {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }

}
