 import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, signal, effect, computed } from '@angular/core';
import { ToasterService } from '../../services/toatser.service';
import { toasterCases } from '../../common/constants/app.constants';
import '@ingka/toast-webc';

@Component({
    selector: 'app-toaster',
    templateUrl: './toaster.component.html',
    styleUrls: ['./toaster.component.scss'],
    imports: [CommonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
 })
export class ToasterComponent implements OnInit, OnDestroy {
  direction: any;
  selectedLang: any;
  toasterData= signal<any>({})

  constructor(public toasterService:ToasterService) {

  }


  ngOnInit(): void {
   }
  afterDismiss() {
    this.toasterService.toasterObject.set(toasterCases.DEFAULT)
  }

  ngOnDestroy(){
    this.toasterService.toasterObject.set(toasterCases.DEFAULT)

  }
}
