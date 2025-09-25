import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  computed,
  ElementRef,
  inject,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatOptionSelectionChange } from "@angular/material/core";
import { Router } from "@angular/router";
import { Globals } from "src/app/globals";
import { CommonService } from "src/app/services/common.service";
import { SharedModule } from "src/app/shared/shared.module";
import { SubSink } from "subsink";
import { merge } from "rxjs";
import Swal from "sweetalert2";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { lastValueFrom } from "rxjs";

@Component({
  selector: "app-overheadcostapproval",
  imports: [SharedModule],
  templateUrl: "./overheadcostapproval.component.html",
  styleUrl: "./overheadcostapproval.component.css",
})
export class OverheadcostapprovalComponent {
  private router = inject(Router);
  private subs = new SubSink();
  private el = inject(ElementRef);
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  // @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChildren("paginator") paginator: QueryList<MatPaginator>;
  @ViewChild(MatSort) sort!: MatSort;
  itemPerPage = 50;
  isLoading: boolean = false;
  overheadcostApp: FormGroup;

  companyList: any[] = [];
  finbokList: any[] = [];
  warehosueList: any[] = [];
  ovrheadname: any[] = [];
  ovrheadrep: any[] = [];

  monthList: any[] = [];
  responceload: any[] = [];
  excelArray: any[] = [];

  monthnam: [] = [];

  dataSearch = "";
  // viewSearch: string = '';
  dataSourceFilter(keyVal: string, data) {
    data.filter = keyVal;
  }

  constructor(
    private fb: FormBuilder,
    private CommonService: CommonService,
    private globals: Globals
  ) {
    const cmpObj = {
      CmpCode:
        this.globals.gclientServer === "Client"
          ? this.globals.gCmpCode
          : this.globals.gUsrDefultCmpCode,
      company:
        this.globals.gclientServer === "Client"
          ? this.globals.gCmpName
          : this.globals.gUsrDefultCmpName,
      StatusResponse: "Success",
    };
    const fbObj = {
      FbCode:
        this.globals.gclientServer === "Client"
          ? this.globals.gFbCode
          : this.globals.gUsrDefultFbCode,
      FbName:
        this.globals.gclientServer === "Client"
          ? this.globals.gFbName
          : this.globals.gUsrDefultFbName,
    };
    const brAll: any = {
      StatusResponse: "Success",
      brcode: 0,
      brname: "All",
    };

    this.CommonService.apiUrl = this.globals.gApiserver;

    this.overheadcostApp = this.fb.group({
      CmpName: [cmpObj, Validators.required],
      finBook: [fbObj, Validators.required],
      warehouse: [brAll, Validators.required],
      monthlywise: ["", Validators.required],
      overheadName: ["ALL", Validators.required],
      overheadrep: ["Warehousewise_Overheadwise", Validators.required],
    });

    this.getcompany();
    this.getfinBook();
    this.WareHouseLocation();
    this.overheadName();
    this.overheadreport();
    this.getMonthlyValues();

    // setTimeout(() => {
    //   document.getElementById("monthlywise").focus();
    // }, 500);
    this.overheadcostApp.get("warehouse")?.valueChanges.subscribe((warehouse) => {
  const name = warehouse?.brname?.trim()?.toLowerCase();

  if (name === 'all') {
    // ❌ Clear totals when "ALL" is selected
    this.lastValidTotals = {};
    this.lastValidWarehouseName = '';
  }

  // ❗ Don't update totals here when user types — only when selected fully
  // Totals will be updated from computed signal automatically if valid
});

  }

  getcompany() {
    this.companyList = [];
    const data = {
      reqMainreq: "CompanyName",
      Usr: this.globals.gUsrid,
      brcode: this.globals.gBrcode,
    };

    this.isLoading = true;
    this.CommonService.reqSendto = "datareqsarnEight";
    this.subs.add(
      this.CommonService.sendReqst(data).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.length === 0) {
            this.CommonService.showStatusPopup("No data available");
          } else if (res[0].StatusResponse === "Success") {
            this.companyList = res;
            this.companyList = res.map((l: { CmpCode: any; company: any }) => ({
              value: l.CmpCode,
              label: l.company,
            }));
            // console.log("get", this.companyList.label);

            //console.log("get",this.companyList[0].company);
            // this.overheadcostApp.controls['CmpName'].setValue(res[0].company);
          } else {
            this.CommonService.showStatusPopup(res[0].StatusResponse);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.CommonService.showStatusPopup(error);
        },
        complete: () => {},
      })
    );
  }

  getfinBook() {
    const data = {
      reqMainreq: "SR_FBSearch",
      Usr: this.globals.gUsrid,
      brcode: this.globals.gBrcode,
      var1: this.overheadcostApp.get("CmpName").value?.CmpCode,
      var2: "",
    };

    this.isLoading = true;
    this.CommonService.reqSendto = "datareqsarnEleven";
    this.subs.add(
      this.CommonService.sendReqst(data).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.length === 0) {
            this.CommonService.showStatusPopup("No data available");
          } else if (res[0].StatusResponse === "Success") {
            this.finbokList = res;
          } else {
            this.CommonService.showStatusPopup(res[0].StatusResponse);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.CommonService.showStatusPopup(error);
        },
        complete: () => {},
      })
    );
  }
  allWareHourse = [
    {
      brcode: "0",
      brname: "ALL",
      BrCodeName: "ALL-0",
      StatusRes: "Success",
    },
  ];

  WareHouseLocation() {
    //console.log("hello");
    this.CommonService.autoComplete(
      this.overheadcostApp.get("warehouse").valueChanges
    ).subscribe((data: any) => {
      if (typeof data === "object") {
        return;
      }
      let Api = {
        reqMainreq: "VA_brSearch",
        Usr: this.globals.gUsrid,
        brcode: this.globals.gBrcode,
        var2: this.overheadcostApp.get("CmpName").value.CmpCode,
        var3: this.overheadcostApp.get("finBook").value.FbCode,
        var1: data,
      };

      this.isLoading = true;
      this.CommonService.reqSendto = "datareqsarnSeventeen";
      this.subs.add(
        this.CommonService.sendReqst(Api).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response && response.length > 0) {
              const brAll: any = [
                {
                  StatusResponse: "Success",
                  brcode: 0,
                  brname: "All",
                },
              ];

              this.warehosueList = [...brAll, ...response];

              // this.warehosueList.unshift({
              //   StatusResponse: "Success",
              //   brcode: 0,
              //   brname: "All",
              // });
            } else {
              this.warehosueList = [];
            }
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            this.CommonService.showStatusPopup(error.message);
          },
          complete: () => {},
        })
      );
    });
  }

  overheadName() {
    const data = {
      reqMainreq: "OverHeadCodeMasterView",
      var1: this.overheadcostApp.get("CmpName").value.CmpCode,
    };

    this.isLoading = true;
    this.CommonService.reqSendto = "datareqrshFourteen";
    this.subs.add(
      this.CommonService.sendReqst(data).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.length === 0) {
            this.CommonService.showStatusPopup("No data available");
          } else if (res[0].StatusResponse === "Success") {
            this.ovrheadname = res;
          } else {
            this.CommonService.showStatusPopup(res[0].StatusResponse);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.CommonService.showStatusPopup(error);
        },
        complete: () => {},
      })
    );
  }

  getMonthlyValues() {
    // this.commonService
    //   .autoComplete(this.monthForm.get("monthlywise").valueChanges)
    //   .subscribe((data: any) => {
    let api = {
      reqMainreq: "Ratelogicload",
      var1: this.overheadcostApp.get("CmpName").value.CmpCode,
      var2: this.overheadcostApp.get("finBook").value.FbCode,
      // var3:data
    };

    this.isLoading = true;
    this.CommonService.reqSendto = "datareqrshFourteen";
    this.subs.add(
      this.CommonService.sendReqst(api).subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data && data.length > 0) {
            if (data[0].StatusResponse == "Success") {
              this.monthList = data;
            } else {
              this.monthList = [];
            }
          } else {
            this.monthList = [];
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.CommonService.showStatusPopup(err.message);
        },
      })
    );
    // });
  }

  // overheadreport() {
  //   const data = {
  //     reqMainreq: "OverheadReporttypeload",
  //   };

  //   this.isLoading = true;
  //   this.CommonService.reqSendto = "datareqrshFourteen";
  //   this.subs.add(
  //     this.CommonService.sendReqst(data).subscribe({
  //       next: (res) => {
  //         this.isLoading = false;
  //         if (res.length === 0) {
  //           this.CommonService.showStatusPopup("No data available");
  //         } else if (res[0].StatusResponse === "Success") {
  //           this.ovrheadrep = res;
  //         } else {
  //           this.CommonService.showStatusPopup(res[0].StatusResponse);
  //         }
  //       },
  //       error: (error) => {
  //         this.isLoading = false;
  //         this.CommonService.showStatusPopup(error);
  //       },
  //       complete: () => {},
  //     })
  //   );
  // }

  async overheadreport() {
    const data = {
      reqMainreq: "OverheadReporttypeload",
    };

    this.isLoading = true;
    this.CommonService.reqSendto = "datareqrshFourteen";

    try {
      const res = await lastValueFrom(this.CommonService.sendReqst(data));
      this.isLoading = false;

      if (res.length === 0) {
        this.CommonService.showStatusPopup("No data available");
      } else if (res[0].StatusResponse === "Success") {
        this.ovrheadrep = res;
        // console.log("Rep", this.ovrheadrep);
      } else {
        this.CommonService.showStatusPopup(res[0].StatusResponse);
      }
    } catch (error) {
      this.isLoading = false;
      this.CommonService.showStatusPopup(error);
    }
  }

  closeDatePicker(eventData: any, dp?: any) {
    // get month and year from eventData and close datepicker, thus not allowing user to select date
    this.overheadcostApp.controls["month"].setValue(eventData);
    dp.close();
  }

  selectionChange(e: MatOptionSelectionChange, data: any, flag: string) {
    if (e.isUserInput && e.source.selected) {
      if (flag === "company") {
        this.getfinBook();
      } else if (flag === "finbook") {
        //console.log("hi");
        this.warehosueList = [];
        this.focusElement("warehouse");
        // this.overheadcostApp.get("warehouse").setValue(""); //clear the object
        setTimeout(() => {
          this.viewoverhead();
        }, 200);
      } else if (flag === "warehouse") {
        //this.focusElement("monthlywise");
        // const control = this.overheadcostApp.get("monthlywise");
        // if (control) {
        //   control.setValue(""); // Clears the input value
        // }
        setTimeout(() => {
          this.viewoverhead();
        }, 200);
      } else if (flag === "monthlywise") {
        this.focusElement("overheadName");
        const values = data.RateLogic;
        setTimeout(() => {
          this.viewoverhead();
        }, 200);
        this.monthnam = values;
      } else if (flag === "overhead") {
        this.focusElement("reptyp");
        setTimeout(() => {
          this.viewoverhead();
        }, 200);
      } else if (flag === "overheadtyp") {
        const get = data.Trnname;
        //console.log("new", get);
        this.focusElement("ViewDialogbutton");
        setTimeout(() => {
          this.viewoverhead();
        }, 200);
      }
    }
  }
  new: any[] = [];
  TrnStatus = "";
  Processby = "";
  Processon = "";
  restrictedColumns: string[] = [
    "StatusResponse",
    "TrnStatus",
    "Approvedby",
    "Approvedon",
  ];
  viewoverhead(isNeedValidation: boolean = true) {
    if (isNeedValidation) {
      const formCaptions = {
        overheadrep: "Please select a valid Report Type",
        overheadName: "Please select a valid OverheadName",
        finBook: "Please select a valid FinBook",
        monthlywise: "Please select a valid Month Name",
        warehouse: "Please select a valid Warehouse",
      };
      if (
        !this.CommonService.validateForm(this.el.nativeElement, formCaptions, {
          querySelector: ".gInnerInput-11.ng-invalid",
        })
      ) {
        this.TrnStatus = "";
        this.Processby = "";
        this.Processon = "";
        return;
      }
    }
    let api = {
      reqMainreq: "OverheadReporttypeView",
      var1: this.overheadcostApp.get("CmpName").value.CmpCode,
      var2: this.overheadcostApp.get("finBook").value.FbCode,
      var4: this.overheadcostApp.get("warehouse").value.brcode,
      var3: this.overheadcostApp.get("monthlywise").value,
      var5: this.overheadcostApp.get("overheadName").value,
      var6: this.overheadcostApp.get("overheadrep").value,
    };
    //console.log("api", api);
    this.isLoading = true;
    this.CommonService.reqSendto = "datareqrshFourteen";
    this.subs.add(
      this.CommonService.sendReqst(api).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.dataSource = new MatTableDataSource([]); //MatTableDataSource support filter, sort, pagination
          this.displayedColumns = [];
          if (res.length === 0) {
            this.CommonService.showStatusPopup("No data available");
            this.TrnStatus = "";
            this.Processby = "";
            this.Processon = "";
            this.dataSource = new MatTableDataSource([]);
            this.displayedColumns = [];
            const paginatorArray = this.paginator.toArray();
            this.dataSource.paginator = paginatorArray[0];
            this.dataSource.sort = this.sort;
            this.dataSourceSignal.set([]);
            // document.getElementById("sts").style.display = "none";
          } else if (res[0].StatusResponse === "Success") {
            // document.getElementById("sts").style.display = "block";
            this.responceload = res;
            //  this.displayedColumns.push("SNo")
            //Filter out the "StatusRes" column because it's used only for status, not to be shown as a table column.
            const dynamicColumns = Object.keys(res[0]).filter(
              (col) => !this.restrictedColumns.includes(col)
            );
            this.TrnStatus = this.responceload[0].TrnStatus;
            this.Processby = this.responceload[0].Approvedby;
            this.Processon = this.responceload[0].Approvedon;
            this.dataSourceSignal.set(res);
            // this.new = this.responceload.filter((wrd) => wrd.Acdate == '05-Aug-2025');
            // console.log(this.new);

            this.displayedColumns = ["SNo", ...dynamicColumns];
            this.dataSource = new MatTableDataSource(res);
            this.excelArray = res;
            const paginatorArray = this.paginator.toArray();
            this.dataSource.paginator = paginatorArray[0];
            this.dataSource.sort = this.sort;
            //console.log("Load", this.responceload);
          } else {
            this.CommonService.showStatusPopup(res[0].StatusRes);
            this.dataSource = new MatTableDataSource([]);
            this.displayedColumns = [];
            const paginatorArray = this.paginator.toArray();
            this.dataSource.paginator = paginatorArray[0];
            this.dataSource.sort = this.sort;
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.CommonService.showStatusPopup(err.message);
        },
      })
    );
  }

  async getatest() {
    if (this.overheadcostApp.get("monthlywise").value === "") {
      this.CommonService.showStatusPopup("Please select a valid Month Name");
      document.getElementById("monthlywise")?.focus();
      return false;
    }
    return true;
  }

  async getprocessApi(isNeedVali: boolean = true) {
    if (isNeedVali && (await this.getatest()) === false) {
      return;
    }
    this.CommonService.saveConfirmation("Process").then(async (result) => {
      if (result.isConfirmed) {
        let api = {
          reqMainreq: "OverHeadCostProcess",
          var1: this.overheadcostApp.get("CmpName").value?.CmpCode,
          var3: this.overheadcostApp.get("monthlywise").value,
        };
        // console.log("get12",api);
        this.isLoading = true;
        this.CommonService.reqSendto = "datareqrshFourteen";
        this.subs.add(
          this.CommonService.sendReqst(api).subscribe({
            next: (data) => {
              this.isLoading = false;
              if (data.length > 0 && data[0].StatusResponse === "Success") {
                //console.log("process");
                this.CommonService.showStatusPopup(data[0].StatusResponse);
                this.viewoverhead();
              } else if (data[0].StatusResponse !== "Success") {
                this.CommonService.showStatusPopup(data[0].StatusResponse);
              }
            },
          })
        );
      }
    });
  }

  async getapproveApi() {
    this.CommonService.saveConfirmation("Approve").then(async (result) => {
      if (result.isConfirmed) {
        let Api = {
          reqMainreq: "OverHeadCostApproval",
          Usr: this.globals.gUsrid,
          var1: this.overheadcostApp.get("CmpName").value?.CmpCode,
          var3: this.overheadcostApp.get("monthlywise").value,
        };

        this.isLoading = true;
        this.CommonService.reqSendto = "datareqrshFourteen";
        this.subs.add(
          this.CommonService.sendReqst(Api).subscribe({
            next: (data) => {
              this.isLoading = false;
              if (data.length > 0 && data[0].StatusResponse === "Success") {
                //console.log("process");
                this.CommonService.showStatusPopup(data[0].StatusResponse);
                this.viewoverhead();
              } else if (data[0].StatusResponse !== "Success") {
                this.CommonService.showStatusPopup(data[0].StatusResponse);
              }
            },
          })
        );
      }
    });
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

  keytab(event: any, id: string) {
    if (event.key === "Enter") {
      if (event.target.value !== "") {
        setTimeout(() => {
          document.getElementById(id)?.focus();
        }, 100);
      }
    }
  }

  downloadXlFun() {
    const tempArray = this.excelArray.map((e) => {
      const { StatusResponse,TrnStatus,Approvedby,Approvedon, ...rest } = e; // destructuring removes properties
      return rest;
    });
    this.CommonService.exportAsExcelFile(tempArray, "Overhead Cost Approval");
  }

  lastValidTotals: Record<string, string> = {};
  lastValidWarehouseName: string = "";
  dataSourceSignal = signal([]);

  
  columnTotals1 = computed(() => {
    const totals: Record<string, string> = {};

    const rows = this.dataSourceSignal();
    if (!rows?.length) {
      return totals;
    }
    const firstRow = rows[0];
    Object.keys(firstRow).forEach((col) => {
      // Skip columns that are clearly string identifiers
      if (["WhCode", "OrgUnitCode", "VoucherNo"].includes(col)) {
        totals[col] = "";
        return;
      }

      const total = rows
        .map((item) => Number(item[col]) || 0)
        .reduce((acc, value) => acc + value, 0);

      totals[col] = total === 0 ? "" : total.toFixed(2);
    });

    const warehouse = this.overheadcostApp.get("warehouse")?.value;
    const name = warehouse?.brname?.trim()?.toLowerCase();
    const isSpecific = name && name !== "all" && name.split(" ").length > 1;

    if (isSpecific && rows.length > 0) {
      this.lastValidTotals = { ...totals };
      this.lastValidWarehouseName = warehouse.brname;
    }

    return totals;
  });
  
  get shouldShowTotals(): boolean {
    const warehouse = this.overheadcostApp.get("warehouse")?.value;

    const name = warehouse?.brname?.trim()?.toLowerCase();
    const isSpecific = name && name !== "all" && name.split(" ").length > 1; //if need remove for warehouse all
    const hasData = this.dataSourceSignal()?.length > 0;
    
    // Show new totals if selection is valid and data exists
  if (isSpecific && hasData) return true;

  // Fallback: Show last valid totals if they exist and user is typing (e.g., "ve")
  return !!this.lastValidTotals && Object.keys(this.lastValidTotals).length > 0;
  }

  focusElement(id: string) {
    setTimeout(() => {
      document.getElementById(id).focus();
    }, 10);
  }

  backNavigation() {
    this.router.navigate(["/dashboard"]);
  }
}
