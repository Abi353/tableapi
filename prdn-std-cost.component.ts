import { formatDate } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  ElementRef,
  inject,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { Globals } from "src/app/globals";
import { CommonService } from "src/app/services/common.service";
import { SharedModule } from "src/app/shared/shared.module";
import { SubSink } from "subsink";

@Component({
  selector: "app-prdn-std-cost",
  imports: [SharedModule],
  templateUrl: "./prdn-std-cost.component.html",
  styleUrl: "./prdn-std-cost.component.scss",
})
export class PrdnStdCostComponent {
  router = inject(Router);
  fb = inject(FormBuilder);
  globals = inject(Globals);
  commonService = inject(CommonService);
  subs = new SubSink();
  currenRateForm!: FormGroup;
  private element = inject(ElementRef);
  //Common Variable
  isLoading: boolean = false;
  currentRateTitle: String = "Production Standard Cost";
  dataSearch = "";
  showLocation: boolean = true;
  showItem: boolean = true;
  showData: boolean = true;
  //Common Arrays
  excelArray: any[] = [];
  //View Arrays
  companyList: any[] = [];
  regionList: any[] = [];
  locationList: any[] = [];
  mainCatList: any[] = [];
  subCatList: any[] = [];
  categoryList: any[] = [];
  itemNameList: any[] = [];
  headerList: any[] = [];
  //View Variable
  companyCode: any;
  branchCode: any;
  //Pagination Value
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  // @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChildren("paginator") paginator: QueryList<MatPaginator>;
  @ViewChild(MatSort) sort!: MatSort;
  itemPerPage = 50;

  cstmtdList: string[] = ["ALL", "STD", "WAVG"];

  constructor() {
    if (this.globals.gclientServer === "Client") {
      this.commonService.apiUrl = this.globals.gServerApiUrl;
    } else {
      this.commonService.apiUrl = this.globals.gServerApiUrl;
    }
  }
  ngOnInit(): void {
    this.currenRateForm = this.fb.group({
      clientOrServer: ["", Validators.required],
      rateType: ["", Validators.required],
      fromDate: formatDate(new Date(), "dd-MMM-yyyy", "en"),
      toDate: formatDate(new Date(), "dd-MMM-yyyy", "en"),
      //month: formatDate(new Date(), "dd-MMM-yyyy", "en"),
      month: (new Date(), "dd-MMM-yyyy", "en"),
      company: ["", Validators.required],
      region: ["", Validators.required],
      finbook: ["", Validators.required],
      costCenter: ["", Validators.required],
      location: ["", Validators.required],
      mainCat: ["", Validators.required],
      subCat: ["", Validators.required],
      category: ["", Validators.required],
      itemCode: ["", Validators.required],
      itemName: ["", Validators.required],
      cstmtd: ["", Validators.required]
    });
    this.getClientServerValue();
    this.getCompany();
    this.getFinbook();
    this.getCostCenter();
    this.getItemCode();
    this.getRegion();
    this.getLocation();
    this.getMainCategory();
  }
  closeDatePicker(eventData: any, dp?: any) {
    // get month and year from eventData and close datepicker, thus not allowing user to select date
    this.currenRateForm.controls["month"].setValue(eventData);
    dp.close();
  }
  FbNameList: any = [];
  getFinbook() {
    let Api = {
      reqMainreq: "SR_FBSearch",
      Usr: this.globals.gUsrid,
      brcode: this.globals.gBrcode,
      var1: this.currenRateForm.get("company").value?.Cmpcode,
      var2: "",
    };

    this.isLoading = true;
    this.commonService.reqSendto = "datareqsarnEleven";

    this.subs.add(
      this.commonService.sendReqst(Api).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.length > 0) {
            if (response[0].StatusResponse == "Success") {
              this.FbNameList = response;
              this.FbNameList.unshift({
                FbName: "ALL",
                FbCode: "ALL",
                StatusResponse: "Success",
              });
            } else {
              this.commonService.showStatusPopup(response[0].StatusResponse);
            }
          } else {
            // Swal.fire('No Record Found');
          }
        },
        error: (error) => {
          this.commonService.showStatusPopup(error.message);
          this.isLoading = false;
        },
        complete: () => {},
      })
    );
  }
  costCenterData: any = [];
  getCostCenter() {
    let Api = {
      reqMainreq: "Productionstandardcostcenterload",
      Usr: this.globals.gUsrid,
      brcode: this.globals.gBrcode,
    };

    this.isLoading = true;
    this.commonService.reqSendto = "ApiHarTwo";

    this.subs.add(
      this.commonService.sendReqst(Api).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.length > 0) {
            if (response[0].StatusRes == "Success") {
              const ALL = {
                costcenter: "ALL",
                StatusRes: "Success",
              };
              this.costCenterData = [ALL, ...response];
            } else {
              this.commonService.showStatusPopup(response[0].StatusRes);
            }
          } else {
            // Swal.fire('No Record Found');
          }
        },
        error: (error) => {
          this.commonService.showStatusPopup(error.message);
          this.isLoading = false;
        },
        complete: () => {},
      })
    );
  }

  getClientServerValue() {
    this.companyCode = this.globals.gUsrDefultCmpCode;
    this.branchCode = "ALL";
    const cmpObj = {
      Cmpcode: this.globals.gUsrDefultCmpCode,
      Cmpname: this.globals.gUsrDefultCmpName,
      StatusResponse: "Success",
    };
    // const brObj = {
    //   RateRegion: this.globals.gRateRegion,
    //   StatusRes: "Success",
    //   brcode: this.globals.gUsrDefultBrcode,
    //   brname: this.globals.gUsrDefultBrname,
    // };
    // const brObj = {
    //   RateRegion: this.globals.gRateRegion,
    //   StatusRes: "Success",
    //   brcode: this.globals.gUsrDefultBrcode,
    //   brname: this.globals.gUsrDefultBrname,
    // };
    const brObj = {
      StatusRes: "Success",
      RateRegion: "ALL",
      brcode: "ALL",
      brname: "ALL",
    };
    const finbookObj = {
      FbCode: "ALL",
      FbName: "ALL",
      //      "FbCode": this.globals.gUsrDefultFbCode,
      // "FbName": this.globals.gUsrDefultFbName,
      FbCodeName: `${this.globals.gUsrDefultFbName}-${this.globals.gUsrDefultFbCode}`,
      StatusResponse: "Success",
    };
    const costCenterObj = {
      costcenter: "ALL",
      StatusResponse: "Success",
    };
    this.currenRateForm.get("company").setValue(cmpObj);
    this.currenRateForm.get("finbook").setValue(finbookObj);
    this.currenRateForm.get("costCenter").setValue(costCenterObj);
    this.currenRateForm.get("location").setValue(brObj);

    this.currenRateForm
      .get("clientOrServer")
      .setValue(this.globals.gclientServer);
    this.currenRateForm.get("region").setValue(this.globals.gRateRegion);
  }

  checkCmp = (e) => (e && e.Cmpname ? e.Cmpname : "");
  checkLoc = (e) => (e && e.brname ? e.brname : "");
  checkIname = (e) => (e && e.iname ? e.iname : "");
  checkCat = (e) => (e && e.cat ? e.cat : "");
  checkSubcat = (e) => (e && e.subcat ? e.subcat : "");

//   clipboarddd() {
//   const selectedItem = this.currenRateForm.get('itemName')?.value;

//   if (selectedItem) {
//     const itemName = selectedItem.iname || selectedItem; // depends on how it's set
//     navigator.clipboard.writeText(itemName).then(() => {
//       console.log('Copied to clipboard:', itemName);
//     }).catch(err => {
//       console.error('Clipboard error:', err);
//     });
//   } else {
//     console.warn('No item selected');
//   }
// }


  Decimal(event: any) {
    const inputValue = event.target.value;
    if (event.charCode == 46) {
      return inputValue.length > 0 && inputValue.indexOf(".") === -1;
    } else if (event.charCode >= 48 && event.charCode <= 57) {
      return true;
    } else {
      return false;
    }
  }

  getCommonCodes(e: any, data, flg, id) {
    if (e.source.selected && e.isUserInput) {
      if (flg == "company") {
        this.currenRateForm.patchValue({
          region: "",
          finbook: "",
          location: "",
        });
        this.headerList = [];
        this.companyCode = data.Cmpcode;
        // this.getRegion();
        this.getFinbook();
        this.clearTableValues();
      } else if (flg == "region") {
        this.currenRateForm.patchValue({ location: "" });
        this.currenRateForm.get("region").setValue(data.RateRegion);
        this.getLocation();
        this.clearTableValues();
      } else if (flg == "finbook") {
        this.currenRateForm.patchValue({ location: "" });
        this.currenRateForm.get("finbook").setValue(data);
        this.getLocation();
        this.clearTableValues();
      } else if (flg == "costCenter") {
        this.currenRateForm.patchValue({ location: "" });
        this.currenRateForm.get("costCenter").setValue(data);
        this.getLocation();
        this.clearTableValues();
      } else if (flg == "location") {
        // this.currenRateForm.patchValue({ mainCat: '', subCat: '', category: '', itemCode: '', itemName: '' });
        this.branchCode = data.brcode;
        this.getMainCategory();
        this.clearTableValues();
      } else if (flg == "mainCat") {
        this.currenRateForm.patchValue({
          subCat: "",
          category: "",
          itemCode: "",
          itemName: "",
        });
        this.currenRateForm.get("mainCat").setValue(data.Maincat);
        this.getSubCategory();
        this.clearTableValues();
      } else if (flg == "subCat") {
        this.currenRateForm.patchValue({
          category: "",
          itemCode: "",
          itemName: "",
        });
        const subCatObj = {
          StatusRes: "Success",
          subcat: data.subcat,
        };
        this.currenRateForm.get("subCat").setValue(subCatObj);
        this.getCategory();
        this.clearTableValues();
      } else if (flg == "itemName") {
        this.currenRateForm.get("itemCode").setValue(data.icode);
        this.clearTableValues();
      } else if (flg == "rateType") {
        this.currenRateForm.get("rateType").setValue(data);
        if (this.currenRateForm.get("rateType").value == "Day Wise Rate") {
          this.clearValues();
          this.currenRateForm.get("fromDate").setValue(new Date());
          this.currenRateForm.get("toDate").setValue(new Date());
        }
      } else if (flg == "category") {
        this.currenRateForm.patchValue({ itemCode: "", itemName: "" });
        const catObj = {
          StatusRes: "Success",
          cat: data.cat,
          maincat: data.maincat,
          subcat: data.subcat,
        };
        this.currenRateForm.get("category").setValue(catObj);
        this.clearTableValues();
      }
      setTimeout(() => {
        document.getElementById(id)?.focus();
      }, 100);
    }
  }

  changeRateType(type) {
    if (type == "Server") {
      this.currenRateForm.get("rateType").setValue(undefined);
    } else {
      setTimeout(() => {
        document.getElementById("rateType")?.focus();
      }, 100);
      this.currenRateForm.get("rateType").setValue("Current Rate");
      const brObj = {
        RateRegion: this.globals.gRateRegion,
        StatusRes: "Success",
        brcode: this.globals.gUsrDefultBrcode,
        brname: this.globals.gUsrDefultBrname,
      };
      this.currenRateForm.get("location").setValue(brObj);
      this.branchCode = this.globals.gUsrDefultBrcode;
    }
    this.clearValues();
  }

  getCompany() {
    this.commonService
      .autoComplete(this.currenRateForm.get("company").valueChanges)
      .subscribe((data: any) => {
        let api = {
          reqMainreq: "GlobalTaxSolutionCmpCodeSearch",
          User: this.globals.gUsrid,
          brcode: this.globals.gBrcode,
          var1: data,
        };
        this.commonService.reqSendto = "datareqrshSeven";
        this.subs.add(
          this.commonService.sendReqst(api).subscribe({
            next: (data) => {
              if (data && data.length > 0) {
                this.companyList = data;
              } else {
                this.companyList = data;
              }
            },
            error: (err) => {
              this.commonService.showStatusPopup(err.message);
            },
          })
        );
      });
  }

  getRegion() {
    let api = {
      reqMainreq: "RegiontemRateChange",
      brcode: this.globals.gBrcode,
      Usr: this.globals.gUsrid,
      var1: this.companyCode,
    };
    this.commonService.reqSendto = "ApiHarOne";
    this.subs.add(
      this.commonService.sendReqst(api).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            if (data[0].StatusRes == "Success") {
              this.regionList = data;
            } else {
              this.regionList = [];
            }
          } else {
            this.regionList = [];
          }
        },
        error: (err: HttpErrorResponse) => {
          this.commonService.showStatusPopup(err.message);
        },
      })
    );
  }

  getLocation() {
    let api = {
      reqMainreq: "ProductionstandardcostBranchLoad",
      brcode: this.globals.gBrcode,
      Usr: this.globals.gUsrid,
      var1: this.companyCode,
      var2: this.currenRateForm.get("finbook").value?.FbCode,
      var3: this.currenRateForm.get("costCenter").value?.costcenter,
      var4: "",
    };
    this.commonService.reqSendto = "ApiHarTwo";
    this.subs.add(
      this.commonService.sendReqst(api).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            if (data[0].StatusRes == "Success") {
              const obj = {
                StatusRes: "Success",
                RateRegion: "ALL",
                brcode: "ALL",
                brname: "ALL",
              };
              if (
                this.currenRateForm.get("clientOrServer").value === "Client"
              ) {
                this.locationList = data;
              } else {
                this.locationList = [obj, ...data];
              }
            } else {
              this.locationList = [];
            }
          } else {
            this.locationList = [];
          }
        },
        error: (err: HttpErrorResponse) => {
          this.commonService.showStatusPopup(err.message);
        },
      })
    );
  }

  getMainCategory() {
    let api = {
      reqMainreq: "MainCatitemRateView",
      brcode: this.globals.gBrcode,
      Usr: this.globals.gUsrid,
      var1: this.currenRateForm.get("clientOrServer").value,
      var2: this.branchCode,
    };
    this.commonService.reqSendto = "ApiHarOne";
    this.subs.add(
      this.commonService.sendReqst(api).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            if (data[0].StatusRes == "Success") {
              this.mainCatList = data;
            } else {
              this.mainCatList = [];
            }
          } else {
            this.mainCatList = [];
          }
        },
        error: (err: HttpErrorResponse) => {
          this.commonService.showStatusPopup(err.message);
        },
      })
    );
  }

  getSubCategory() {
    this.commonService
      .autoComplete(this.currenRateForm.get("subCat").valueChanges)
      .subscribe((data: any) => {
        let api = {
          reqMainreq: "subCatitemRateView",
          brcode: this.globals.gBrcode,
          Usr: this.globals.gUsrid,
          var1: this.currenRateForm.get("clientOrServer").value,
          var2: this.branchCode,
          var3: this.currenRateForm.get("mainCat").value,
          var4: data.subcat ? data.subcat : data,
        };
        this.commonService.reqSendto = "ApiHarOne";
        this.subs.add(
          this.commonService.sendReqst(api).subscribe({
            next: (data) => {
              if (data && data.length > 0) {
                if (data[0].StatusRes == "Success") {
                  this.subCatList = data;
                } else {
                  this.subCatList = [];
                }
              } else {
                this.subCatList = [];
              }
            },
            error: (err: HttpErrorResponse) => {
              this.commonService.showStatusPopup(err.message);
            },
          })
        );
      });
  }

  getCategory() {
    this.commonService
      .autoComplete(this.currenRateForm.get("category").valueChanges)
      .subscribe((data: any) => {
        let api = {
          reqMainreq: "CategoryitemRateView",
          brcode: this.globals.gBrcode,
          Usr: this.globals.gUsrid,
          var1: this.currenRateForm.get("clientOrServer").value,
          var2: this.branchCode,
          var3: this.currenRateForm.get("mainCat").value,
          var4: this.currenRateForm.get("subCat").value.subcat,
          var5: data.cat ? data.cat : data,
        };
        this.commonService.reqSendto = "ApiHarOne";
        this.subs.add(
          this.commonService.sendReqst(api).subscribe({
            next: (data) => {
              if (data && data.length > 0) {
                if (data[0].StatusRes == "Success") {
                  this.categoryList = data;
                } else {
                  this.categoryList = [];
                }
              } else {
                this.categoryList = [];
              }
            },
            error: (err: HttpErrorResponse) => {
              this.commonService.sendReqst(err.message);
            },
          })
        );
      });
  }

  getItemCode() {
    this.commonService
      .autoComplete(this.currenRateForm.get("itemName").valueChanges)
      .subscribe((data: any) => {
        let api = {
          reqMainreq: "ItemSearchItemRateChange1",
          brcode: this.globals.gBrcode,
          Usr: this.globals.gUsrid,
          var1: this.currenRateForm.get("mainCat").value,
          var2: this.currenRateForm.get("subCat").value.subcat,
          var3: this.currenRateForm.get("category").value.cat,
          var4: data.iname ? data.iname : data,
        };
        this.commonService.reqSendto = "ApiHarOne";
        this.subs.add(
          this.commonService.sendReqst(api).subscribe({
            next: (data) => {
              if (data && data.length > 0) {
                if (data[0].StatusRes == "Success") {
                  const obj = {
                    StatusRes: "Success",
                    subcat: "",
                    category: "",
                    icode: "ALL",
                    iname: "ALL",
                  };
                  this.itemNameList = [obj, ...data];
                } else {
                  this.itemNameList = [];
                }
              } else {
                this.itemNameList = [];
              }
            },
            error: (err: HttpErrorResponse) => {
              this.commonService.showStatusPopup(err.message);
            },
          })
        );
      });
  }
  getItemCodeGlobal() {
    let api = {
      reqMainreq: "GetReqItemDetailByCode",
      Usr: this.globals.gUsrid,
      brcode: this.globals.gBrcode,
      var1: this.currenRateForm.get("itemCode").value,
    };
    this.isLoading = true;
    this.commonService.reqSendto = "datareqrachnSix";
    this.subs.add(
      this.commonService.sendReqst(api).subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data.length > 0) {
            if (data[0].StatusRes === "Success") {
              const inameObj = {
                icode: data[0].Icode,
                iname: data[0].ItemName,
              };
              const subCatObj = {
                StatusRes: "Success",
                subcat: "ALL",
              };
              this.currenRateForm.get("subCat").setValue(subCatObj);
              const catObj = {
                StatusRes: "Success",
                maincat: "",
                subcat: "",
                cat: "ALL",
              };
              this.currenRateForm.get("category").setValue(catObj);
              this.currenRateForm
                .get("mainCat")
                .setValue(data[0].NewMainCategory);

              // const inameObj = {
              //     StatusRes: "Success",
              //     category: data[0].category,
              //     icode: data[0].icode,
              //     iname: data[0].iname,
              //     subcat: data[0].subcat,
              //   };
              // this.clearTableValues();
              this.currenRateForm.get("itemName").setValue(inameObj);
              // const catObj = {
              //   cat: data[0].NewMainCategory
              // };
              // this.changeRequestForm.get('reqCategory').setValue(catObj);
              // this.changeRequestForm.get('reqIName').setValue(inameObj);
              // this.changeRequestForm.get('reqICode').setValue(data[0].Icode);
              // this.subCategoryVal = data[0].NewSubCategory;
              // this.mmentValue = data[0].StockUom;
              // // console.log(this.mmentValue);

              // if (this.changeRequestForm.get('reqTrnType').value) {
              //   this.getTranOldValue();
              // }
              setTimeout(() => {
                document.getElementById("reqTrnType").focus();
              }, 100);
            } else {
              // this.changeRequestForm.get('reqCategory').setValue('');
              // this.changeRequestForm.get('reqIName').setValue('');
              // this.changeRequestForm.get('reqICode').setValue('');
              // this.changeRequestForm.get('reqOldValue').setValue('');
              this.commonService.showStatusPopup(data[0].StatusRes);
            }
          } else {
            // this.changeRequestForm.get('reqCategory').setValue('');
            // this.changeRequestForm.get('reqIName').setValue('');
            // this.changeRequestForm.get('reqICode').setValue('');
            // this.changeRequestForm.get('reqOldValue').setValue('');
            // this.commonService.showStatusPopup('No records found');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.commonService.showStatusPopup(err.message);
        },
      })
    );
  }

  getItemName() {
    if (this.currenRateForm.get("itemCode").value != "ALL") {
      let api = {
        reqMainreq: "ItemCodeItemRateChange1",
        brcode: this.globals.gBrcode,
        Usr: this.globals.gUsrid,
        var1: this.currenRateForm.get("mainCat").value,
        var2: this.currenRateForm.get("subCat").value.subcat,
        var3: this.currenRateForm.get("category").value.cat,
        var4: this.currenRateForm.get("itemCode").value,
      };
      this.commonService.reqSendto = "ApiHarOne";
      this.subs.add(
        this.commonService.sendReqst(api).subscribe({
          next: (data) => {
            if (data && data.length > 0) {
              if (data[0].StatusRes == "Success") {
                const inameObj = {
                  StatusRes: "Success",
                  category: data[0].category,
                  icode: data[0].icode,
                  iname: data[0].iname,
                  subcat: data[0].subcat,
                };
                // this.clearTableValues();
                this.currenRateForm.get("itemName").setValue(inameObj);
                // this.getTableHeaders()
              } else {
                this.currenRateForm.get("itemName").setValue("");
                this.clearTableValues();
              }
            } else {
              this.currenRateForm.get("itemName").setValue("");
              this.clearTableValues();
            }
          },
          error: (err: HttpErrorResponse) => {
            this.commonService.showStatusPopup(err.message);
          },
        })
      );
    }
  }
  allChecked: boolean = true;
  getTableHeaders() {
    const formCaptions = {
      clientOrServer: "Select client or server",
      rateType: "Select rate type",
      fromDate: "Enter from date",
      toDate: "Enter to date",
      company: "Select company name",
      region: "Select region name",
      location: "Select location name",
      mainCat: "Select main category",
      subCat: "Select sub category",
      category: "Select category",
      itemCode: "Enter item code or select item name ALL",
      itemName: "Enter item name",
    };
    if (!this.currenRateForm.valid) {
      const invalidElements = this.element.nativeElement.querySelectorAll(
        ".gInnerInput-12.ng-invalid"
      );
      if (invalidElements.length > 0) {
        this.commonService
          .showStatusPopup(
            `${
              formCaptions[
                invalidElements[0].getAttribute("formControlName")
              ] ?? "Enter valid form"
            }`
          )
          .finally(() => {
            setTimeout(() => {
              invalidElements[0].focus();
            }, 300);
          });
        return;
      }
    }
    console.log(this.currenRateForm.valid);

    if (typeof this.currenRateForm.get("company").value != "object") {
      this.commonService.showStatusPopup("Enter valid company name");
      return;
    }
    if (typeof this.currenRateForm.get("location").value != "object") {
      this.commonService.showStatusPopup("Enter valid location name");
      return;
    }
    if (typeof this.currenRateForm.get("subCat").value != "object") {
      this.commonService.showStatusPopup("Enter valid sub category");
      return;
    }
    if (typeof this.currenRateForm.get("category").value != "object") {
      this.commonService.showStatusPopup("Enter valid category name");
      return;
    }
    if (typeof this.currenRateForm.get("itemName").value != "object") {
      this.commonService.showStatusPopup("Enter valid item name");
      return;
    }

    let api = {
      reqMainreq: "FieldsViewitemRateView",
      brcode: this.globals.gBrcode,
      Usr: this.globals.gUsrid,
      var1: this.currenRateForm.get("clientOrServer").value,
      var2:
        this.currenRateForm.get("clientOrServer").value == "Client"
          ? this.currenRateForm.get("rateType").value == "Day Wise Rate"
            ? "YES"
            : "NO"
          : undefined,
    };
    this.commonService.reqSendto = "ApiHarOne";
    this.isLoading = true;
    this.subs.add(
      this.commonService.sendReqst(api).subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data && data.length > 0) {
            if (data[0].StatusRes == "Success") {
              this.headerList = data;
              this.selectedHearder = this.headerList.filter(
                (e) => e != "StatusRes"
              );

              this.allChecked = true;
            } else {
              this.headerList = [];
            }
          } else {
            this.headerList = [];
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.commonService.showStatusPopup(err.message);
        },
      })
    );
  }
  selectedHearder: any[] = [];
  onHeaderSelect(e, obj) {
    if (e.target.checked) {
      this.selectedHearder.push({
        TblCaption: obj.TblCaption,
      });
    } else {
      this.selectedHearder.forEach((e) => {
        if (obj.TblCaption == e.TblCaption) {
          this.selectedHearder.splice(this.selectedHearder.indexOf(e), 1);
        }
      });
    }
  }
// restrictedColumns: string[] = ['FinalRate', 'Overheads', 'StatusRes'];
  viewCurrwntRate() {
    const result = JSON.stringify(
      this.selectedHearder.map((e) => e.TblCaption)
    );
    let api = {
      reqMainreq: "Productionstandardcost",
      Usr: this.globals.gUsrid,
      brcode: this.globals.gBrcode,
      var1: this.companyCode,
      var2: this.currenRateForm.get("finbook").value?.FbCode,
      var3: this.branchCode,
      var4: this.commonService.dateFormatChange(
        this.currenRateForm.get("month").value,
        "MMM-yyyy"
      ),
      var5: this.currenRateForm.get("itemCode").value,
      var6: this.currenRateForm.get("costCenter").value?.costcenter,
      var7: this.currenRateForm.get("mainCat").value,
      var8: this.currenRateForm.get("subCat").value.subcat,
      var9: this.currenRateForm.get("category").value.cat,
      var10 : this.currenRateForm.get("cstmtd").value
    };
    this.commonService.reqSendto = "ApiHarTwo";
    //this.isLoading = true;
    this.commonService.startLoading();
    this.subs.add(
      this.commonService.sendReqst(api).subscribe({
        next: (data) => {
          //this.isLoading = false;
          this.commonService.stopLoading();
          this.dataSource = new MatTableDataSource([]); //MatTableDataSource support filter, sort, pagination
          this.displayedColumns = [];
          this.displayedColumns = [];
          if (data && data.length > 0) {
            if (data[0].StatusRes == "Success") {
              this.dataSource = new MatTableDataSource(data);
              this.excelArray = data;
              this.displayedColumns = Object.keys(data[0]).filter(
                (column) => column !== "StatusRes"
              ); //Filter out the "StatusRes" column because it's used only for status, not to be shown as a table column.
              // this.displayedColumns = Object.keys(data[0]).filter(col => !this.restrictedColumns.includes(col));
              const paginatorArray = this.paginator.toArray();
              this.dataSource.paginator = paginatorArray[0];
              this.dataSource.sort = this.sort;
            } else {
              this.commonService.showStatusPopup(data[0].StatusRes);
              this.dataSource = new MatTableDataSource([]);
              this.displayedColumns = [];
              const paginatorArray = this.paginator.toArray();
              this.dataSource.paginator = paginatorArray[0];
              this.dataSource.sort = this.sort;
            }
          } else {
            this.dataSource = new MatTableDataSource([]);
            this.displayedColumns = [];
            const paginatorArray = this.paginator.toArray();
            this.dataSource.paginator = paginatorArray[0];
            this.dataSource.sort = this.sort;
          }
        },
        error: (err: HttpErrorResponse) => {
          this.dataSource = new MatTableDataSource([]);
          this.displayedColumns = [];
          const paginatorArray = this.paginator.toArray();
          this.dataSource.paginator = paginatorArray[0];
          this.dataSource.sort = this.sort;
          this.isLoading = false;
          this.commonService.showStatusPopup(err.message);
        },
      })
    );
  }

  currentPageIndex: number;
  pageEvent(event: PageEvent) {
    this.currentPageIndex = event.pageIndex;
  }

  applyFilter(filterValue: string) {
    if (filterValue.length > 0) {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
      this.dataSource.filter = filterValue;
    } else {
    }
  }

  clearValues() {
    // this.currenRateForm.get('rateType').setValue('');
    // this.currenRateForm.get('company').setValue('');
    // this.currenRateForm.get('region').setValue('');
    // this.currenRateForm.get('location').setValue('');
    // this.currenRateForm.get('mainCat').setValue('');
    // this.currenRateForm.get('subCat').setValue('');
    // this.currenRateForm.get('category').setValue('');
    // this.currenRateForm.get('itemCode').setValue('');
    // this.currenRateForm.get('itemName').setValue('');
    // this.branchCode = '';
    // this.companyCode = '';
    this.clearTableValues();
  }
  clearTableValues() {
    this.selectedHearder = [];
    this.dataSource = new MatTableDataSource([]);
    this.displayedColumns = [];
    this.headerList = [];
    this.dataSource.data.length = 0;
  }

  downloadXlFun() {
    const tempArray = [...this.excelArray];
    tempArray.forEach((e) => {
      delete e["StatusRes"];
      // delete e ["brcode"];
    });
    this.commonService.exportAsExcelFile(tempArray, "Production Standard Cost");
    //this one is good for multiple delete on excel
  // const tempArray = this.excelArray.map(e => {
  // const { StatusRes, brcode, ...rest } = e; // destructuring removes properties
  // return rest;
  //   });
  }
  ngAfterViewInit(): void {
    const d = new SubSink();
    d.add(
      this.paginator.changes.subscribe((e) => {
        this.assignPaginators();
      })
    );
  }
  assignPaginators(): void {
    const paginatorArray = this.paginator.toArray();
    this.dataSource.paginator = paginatorArray[0];
  }

  backNavigation() {
    this.router.navigate(["/dashboard4"]);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
