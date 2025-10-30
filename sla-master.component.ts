import { CommonModule } from "@angular/common";
import { Component, ElementRef, inject, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { Globals } from "src/app/globals";
import { CommonService } from "src/app/services/common.service";
import { SharedModule } from "src/app/shared/shared.module";
import { SubSink } from "subsink";
import Swal from "sweetalert2";

@Component({
  selector: "app-sla-master",
  imports: [SharedModule, CommonModule],
  templateUrl: "./sla-master.component.html",
  styleUrl: "./sla-master.component.css",
})
export class SlaMasterComponent {
  gMenu: string;
  isLoading: boolean = false;

  SectionTitle = "SLA MASTER";

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly commonService = inject(CommonService);
  private subs = new SubSink();
  globals = inject(Globals);

  slaMastersection: FormGroup;
  entryForm: FormGroup;

  cmpyList: any[] = [];
  finbookListing: any[] = [];
  warehouseListing: any[] = [];
  warehouseListing1: any[] = [];
  deptListing: any[] = [];
  deptListing1: any[] = [];

  excelArray: any[] = [];

  isEntryView: boolean = false;
  Edited: boolean = true;
  issave: string;
  BranchCode: any;
  BranchCodesla: any;
  BranchNamesla: any;
  BranchName: any;
  departmet: any;
  entrydepartmet: any;
  CompanyName: any;
  CompanyCode: any;

  slaentryView: any;

  emailbreach = "ram@aabsweets.com";

  dataSource = new MatTableDataSource<any>();
  @ViewChildren("paginator") paginator: QueryList<MatPaginator>;
  @ViewChild(MatSort) sort!: MatSort;
  searchviewTable: any;

  dataSourceFilter(keyVal: string, data) {
    data.filter = keyVal;
  }

  viewExportExcel() {
    const tempArray = [...this.excelArray];
    tempArray.forEach((e) => {
      delete e["StatusRes"];
      delete e["tdate"];
      delete e["DeptCode"];
      delete e["SLAcode"];
      delete e["brcode"];
      delete e["Cmpcode"];
    });
    this.commonService.exportAsExcelFile(tempArray, "SLA Master");
  }

  keyPressNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); //is used to stop the browser's default behavior
    }
  }

  slaType = [
    { key: "Operational", label: "Operational" },
    { key: "Internal", label: "Internal" },
    { key: "External", label: "External" },
    { key: "Compliance", label: "Compliance" },
  ];
  timeUnit = [
    { key: "Hours", label: "Hours" },
    { key: "Days", label: "Days" },
  ];
  prioritylvl = [
    { key: "High", label: "High" },
    { key: "Medium", label: "Medium" },
    { key: "Low", label: "Low" },
  ];
  escalation = [
    { key: "1st Level", label: "1st Level" },
    { key: "2nd Level", label: "2nd Level" },
    { key: "3rd Level", label: "3rd Level" },
  ];

  constructor() {
    this.slaMastersection = this.fb.group({
      CmpName: [this.globals.gUsrDefultCmpName, Validators.required],
      // finBook: ["", Validators.required],
      wareHouse: ["ALL", Validators.required],
      Deparment: ["", Validators.required],
    });

    this.entryForm = this.fb.group({
      CmpNameSLA: [this.globals.gUsrDefultCmpName, Validators.required],
      whNameSLA: ["", Validators.required],
      deptNameSLA: ["", Validators.required],
      // sectNameSLA: ["", Validators.required],
      reqNameSLA: ["", Validators.required],
      pronaNameSLA: ["", Validators.required],
      timeunitSLA: ["", Validators.required],
      startpointSLA: ["", Validators.required],
      endpointSLA: ["", Validators.required],
      prioritySLA: ["", Validators.required],
      descSLA: ["", Validators.required],
      requSLA: ["", Validators.required],
      approveSLA: ["", Validators.required],
      breachSLA: ["", Validators.required],
      elcalationSLA: ["", Validators.required],
      notcmtSLA: ["", Validators.required],
      breachtwoSLA: ["", Validators.required]
    });
  }

  ngOnInit() {
    (this.CompanyName = this.globals.gUsrDefultCmpName),
      (this.CompanyCode = this.globals.gUsrDefultCmpCode),
      (this.BranchCode = "0");
    this.BranchName = "ALL";
    this.BranchCodesla = "0";
    this.BranchNamesla = "ALL";
    this.gMenu = this.globals.gmainMenuSelected;
    this.commonService.apiUrl = this.globals.gApiserver;
    if (this.gMenu == "slaMaster") {
      this.SectionTitle = "SLA MASTER";
    }

    this.companyList();
    this.warehouseList();
    this.departmentList();

    // this.deptListing.unshift({
    //             DepartMent: "ALL",
    //             StatusRes: "Success",
    //           });
    //           this.warehouseListing.unshift({
    //             brcode: "0",
    //             brname: "ALL",
    //             StatusRes: "Success"
    //           });
  }

  companyList() {
    this.cmpyList = [];
    const data = {
      reqMainreq: "CompanyLoad",
    };
    this.isLoading = true;
    this.commonService.reqSendto = "ApiHarTwo";
    this.subs.add(
      this.commonService.sendReqst(data).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res && res.length > 0) {
            if (res[0].StatusRes == "Success") {
              this.cmpyList = res;
              this.cmpyList.unshift({
                CmpCode: "0",
                StatusRes: "Success",
                compname: "ALL",
              });
            } else {
              this.commonService.showStatusPopup(res[0].StatusResponse);
            }
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.commonService.showStatusPopup(error);
        },
        complete: () => {},
      })
    );
  }

  warehouseList() {
    this.warehouseListing = [];
    let data = {
      reqMainreq: "BranchLoadAll",
      var1: this.CompanyCode,
      var2: "",
    };

    this.isLoading = true;
    this.commonService.reqSendto = "ApiHarTwo";
    this.subs.add(
      this.commonService.sendReqst(data).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res && res.length > 0) {
            if (res[0].StatusRes == "Success") {
              this.warehouseListing = res;
            } else {
              this.commonService.showStatusPopup(res[0].StatusResponse);
            }
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.commonService.showStatusPopup(error);
        },
        complete: () => {},
      })
    );
  }

  departmentList() {
    this.deptListing = [];

    let data = {
      reqMainreq: "GetDepartmentDetailS",
      Usr: this.globals.gUsrid,
      var1: this.CompanyCode,
      var2: "",
    };

    this.isLoading = true;
    this.commonService.reqSendto = "ApiHarTwo";
    this.subs.add(
      this.commonService.sendReqst(data).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res && res.length > 0) {
            if (res[0].StatusRes == "Success") {
              this.deptListing = res;
              this.deptListing.unshift({
                DepartMent: "ALL",
                StatusRes: "Success",
              });
            } else {
              this.commonService.showStatusPopup(res[0].StatusResponse);
            }
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.commonService.showStatusPopup(error);
        },
        complete: () => {},
      })
    );
  }

  viewData() {
    const inputValue1 = this.slaMastersection.get("wareHouse")?.value;
    const inputValuedept1 = this.slaMastersection.get("Deparment")?.value;
    const matching1 = this.warehouseListing.find(item => item.brname === inputValue1);
    const matchdept1 = this.deptListing.find(item => item.DepartMent === inputValuedept1);

    if(!matching1) {
      this.commonService.showStatusPopup("Invalid Warehouse selected. Please choose from the list.");
      return;
    } else if(!matchdept1) {
      this.commonService.showStatusPopup("Invalid Department selected. Please choose from the list.");
      return;
    }

    if (
      !this.slaMastersection.get("Deparment").value ||
      !this.slaMastersection.get("wareHouse").value
    ) {
      this.commonService.showStatusPopup("Please Fill All Fields");
      return;
    }

    // if (this.slaMastersection.get("wareHouse").value === "ALL") {
    //   this.commonService.showStatusPopup("Please Select Warehouse");
    //   return;
    // } else if (this.slaMastersection.get("Deparment").value === "ALL") {
    //   this.commonService.showStatusPopup("Please Select Department");
    //   return;
    // }
    this.Edited = true;
    this.entryForm.get("whNameSLA")?.enable();
    this.entryForm.get("deptNameSLA")?.enable();
    this.entryForm.reset();
    setTimeout(() => {
      this.isEntryView = true;
    }, 100);
    this.entryForm
      .get("CmpNameSLA")
      ?.setValue(this.slaMastersection.get("CmpName").value);
    // this.entryForm
    //   .get("whNameSLA")
    //   ?.setValue(this.slaMastersection.get("wareHouse").value);
    // this.entryForm
    //   .get("deptNameSLA")
    //   ?.setValue(this.slaMastersection.get("Deparment").value);
  }

  vartwnval: any;
  getdeptcode: any;
  getbrcode: any;
  getbrname: any;
  getdeptname: any;
  editslaView(value: any, flag: any) {
    setTimeout(() => {
      this.isEntryView = true;
    }, 100);
    this.Edited = false;
    this.issave = flag;
    this.vartwnval = value.SLAcode;
    this.getdeptcode = value.DeptCode;
    this.getbrcode = value.brcode;
    this.getbrname = value.Brname;
    this.getdeptname = value.DeptName;
    this.entryForm.get("whNameSLA")?.disable();
    this.entryForm.get("deptNameSLA")?.disable();
    this.entryForm.patchValue({
      CmpNameSLA: value.cmpname,
      whNameSLA: value.Brname,
      deptNameSLA: value.DeptName,
      reqNameSLA: value.SLAtype,
      pronaNameSLA: value.PrcessName,
      timeunitSLA: value.TimeUnit,
      startpointSLA: value.startPoint,
      endpointSLA: value.EndPoint,
      prioritySLA: value.Priority,
      descSLA: value.Description,
      requSLA: value.Requestor,
      approveSLA: value.Approver,
      breachSLA: value.BreachCondition,
      elcalationSLA: value.Escalation,
      notcmtSLA: value.Notes,
      breachtwoSLA: value.Breach2
    });
  }

  saveSlaScreen(flag: any) {
    if (this.Edited) {
      this.issave = "Create";
      this.entryForm.controls['breachtwoSLA'].removeValidators(null);
      this.entryForm.controls['breachtwoSLA'].removeValidators(Validators.required);
    } else {
      this.issave = "Edit";
      this.entryForm.controls['breachtwoSLA'].clearValidators();
    }
    this.entryForm.controls['breachtwoSLA'].updateValueAndValidity();

    // this.entryForm.controls['breachtwoSLA'].removeValidators(Validators.required)
    // this.entryForm.controls['breachtwoSLA'].updateValueAndValidity()

    const inputValue = this.entryForm.get("whNameSLA")?.value;
    const inputValuedept = this.entryForm.get("deptNameSLA")?.value;
    const matching = this.warehouseListing.find(item => item.brname === inputValue);
    const matchdept = this.deptListing.find(item => item.DepartMent === inputValuedept);

    if(!matching) {
      this.commonService.showStatusPopup("Invalid Warehouse selected. Please choose from the list.");
      return;
    } else if(!matchdept) {
      this.commonService.showStatusPopup("Invalid Department selected. Please choose from the list.");
      return;
    }

    if (!this.entryForm.valid) {
      this.entryForm.markAllAsTouched();
      this.commonService.showStatusPopup("Please Fill All Fields");
      return;
    }
    const getslacode = this.vartwnval;
    const getdeptcod = this.getdeptcode;
    const getbrcod = this.getbrcode;
    const getbrnam = this.getbrname;
    const getdeptnam = this.getdeptname;
    if(this.entryForm.get('whNameSLA').value === 'ALL' || this.entryForm.get('deptNameSLA').value === 'ALL') {
      this.commonService.showStatusPopup("Not Save or Update for ALL");
      return;
    } 
    this.commonService.saveConfirmation(this.Edited ? "save ?" : "update ?").then((result) => {
      if (result.isConfirmed) {
        // If reqNameSLA is an object like { key: string, label: string }, get label as below:
        const pronaNameSLAValue = this.entryForm.get("pronaNameSLA").value;
        const allValue = this.entryForm.value;

        // const playLoad = {
        //   //1
        //   slacode : this.Edited ? "" : getslacode,
        //   breach2 : this.entryForm.get("breachtwoSLA").value,
        //   //2
        //   slaCod : [{
        //     slacode : this.Edited ? "" : getslacode,
        //     breach2 : this.entryForm.get("breachtwoSLA").value,
        //   }] 
        // }

        const savesection = {
          reqMainreq: "SLAMasterSave",
          brcode: this.globals.gBrcode,
          Usr: this.globals.gUsrid,
          var1: this.CompanyCode,
          var2: this.CompanyName,
          var3: this.Edited ? this.BranchCodesla : getbrcod,
          var4: this.Edited ? this.BranchNamesla : getbrnam,
          var5: this.Edited ? "0" : getdeptcod,
          var6: this.Edited ? this.departmet : getdeptnam,
          var7: allValue.reqNameSLA,
          // var8: pronaNameSLAValue && pronaNameSLAValue.label ? pronaNameSLAValue.label : pronaNameSLAValue,
          var8: allValue.pronaNameSLA,
          var9: allValue.timeunitSLA,
          var10: this.entryForm.get("startpointSLA").value,
          var11: this.entryForm.get("endpointSLA").value,
          var12: allValue.prioritySLA,
          var13: this.entryForm.get("descSLA").value,
          var14: this.entryForm.get("requSLA").value,
          var15: this.entryForm.get("approveSLA").value,
          var16: this.entryForm.get("breachSLA").value,
          var17: allValue.elcalationSLA,
          var18: this.entryForm.get("notcmtSLA").value,
          var19: this.issave,
          // var20: this.Edited ? "" : getslacode,
          var20: JSON.stringify([{
            slacode : this.Edited ? "" : getslacode,
            breach2 : this.entryForm.get("breachtwoSLA").value,
          }])
        };
        console.log(savesection, "Save");
        // return;
        this.isLoading = true;
        this.commonService.reqSendto = "ApiHarTwo";
        this.subs.add(
          this.commonService.sendReqst(savesection).subscribe({
            next: (res) => {
              this.isLoading = false;
              if (res && res.length > 0) {
                if (res[0].StatusRes == "Success") {
                  const savupd = this.Edited
                    ? "Saved Successfully"
                    : "Updated Successfully";
                  this.commonService.showStatusPopup(savupd).then(() => {
                    this.view();
                  })
                  this.isEntryView = false;
                  //for view section
                  if(this.slaMastersection.get("wareHouse").value === 'ALL' && this.slaMastersection.get("Deparment").value === 'ALL') {
                    this.BranchCodesla = "0";
                    this.BranchNamesla = "ALL";
                    this.departmet = "ALL";
                  } else {
                    this.BranchCode = getbrcod
                    this.BranchName = getbrnam
                    this.entrydepartmet = getdeptnam
                  }
                  //for view section
                } else {
                  this.commonService.showStatusPopup(res[0].StatusRes);
                  this.isEntryView = false;
                }
              } else {
                this.commonService.showStatusPopup("No Data Avaiable");
                this.isEntryView = false;
              }
            },
          })
        );
      }
    });
  }
  headers: string[] = [];

  view() {
    const inputValue1 = this.slaMastersection.get("wareHouse")?.value;
    const inputValuedept1 = this.slaMastersection.get("Deparment")?.value;
    const matching1 = this.warehouseListing.find(item => item.brname === inputValue1);
    const matchdept1 = this.deptListing.find(item => item.DepartMent === inputValuedept1);

    if(!matching1) {
      this.commonService.showStatusPopup("Invalid Warehouse selected. Please choose from the list.");
      return;
    } else if(!matchdept1) {
      this.commonService.showStatusPopup("Invalid Department selected. Please choose from the list.");
      return;
    }
    
    this.headers = [
      "SNo",
      "DeptName",
      "SLAtype",
      "PrcessName",
      "edit",
      "TimeUnit",
      "startPoint",
      "EndPoint",
      "Priority",
      "Description",
      "Requestor",
      "Approver",
      "BreachCondition",
      "Escalation",
      "Notes",
      // "status",
      "modifiedOn",
      "modifiedBy",
    ];

    let api = {
      reqMainreq: "SLAMasterView",
      var1: this.CompanyCode,
      var2: this.slaMastersection.get("wareHouse").value !== "ALL" ? this.BranchCodesla : this.BranchNamesla,
      var3: this.departmet,
    };

    this.commonService.reqSendto = "ApiHarTwo";
    this.isLoading = true;
    this.commonService.sendReqst(api).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.length > 0) {
          if (res[0].StatusRes == "Success") {
            this.slaentryView = res;
            this.dataSource = new MatTableDataSource(res);
            const paginatorArray = this.paginator.toArray();
            this.dataSource.paginator = paginatorArray[0];
            this.dataSource.sort = this.sort;
            this.excelArray = res;
            // this.headers = [];
            // let headers = Object.keys(res[0]);
            // const snoColumnName = "SNo";
            // if (!headers.includes(snoColumnName)) {
            //   headers.unshift(snoColumnName);
            //   res.forEach((row, idx) => {
            //     row[snoColumnName] = idx + 1;
            //   });
            // }
          }
        } else {
          this.commonService.showStatusPopup("No Data Avaiable");
          // Swal.fire({timer : 1000, text : "Please Fill All Fields"})
          this.dataSource = new MatTableDataSource([]);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.commonService.showStatusPopup(error);
      },
      complete: () => {},
    });
  }

  clearScreen() {
    this.entryForm.reset();
    this.entryForm.get("CmpNameSLA").setValue(this.globals.gUsrDefultCmpName);
    this.entryForm.get("whNameSLA")?.enable();
    this.entryForm.get("deptNameSLA")?.enable();
    this.Edited = true;
    // this.deptListing = this.deptListing.filter(
    //   (item) => !(item.DepartMent === "ALL")
    // );
    // this.warehouseListing = this.warehouseListing.filter(
    //   (item) => !(item.brcode === "ALL" && item.brname === "ALL")
    // );
    // this.warehouseListing.shift();
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
  private el = inject(ElementRef)
  focusElement(id: string) {
    setTimeout(() => {
      const el = this.el.nativeElement.querySelector(`#${id}`);
      if (el) {
        el.focus();
      }
    }, 0);
  }
  // selectionChange(e: any, data: any, flag: any) {
  //   if (e.isUserInput && e.source.selected) {
  //     if (flag === "companyView") {
  //       setTimeout(() => {
  //         this.departmentList();
  //       }, 100);
  //       this.CompanyName = data.compname;
  //       this.CompanyCode = data.CmpCode;
  //       console.log(data);
  //     } else if (flag === "deptsla") {
  //       this.BranchCodesla = data.brcode;
  //       this.BranchNamesla = data.brname;
  //     } else if (flag === "warehouseView") {
  //       this.BranchCode = data.brcode;
  //       this.BranchName = data.brname;
  //       this.BranchCodesla = data.brcode;
  //       this.BranchNamesla = data.brname;
  //     } else if (flag === "dept") {
  //       this.departmet = data.DepartMent;
  //       this.entrydepartmet = data.DepartMent;
  //       this.view();
  //     } else if (flag === "sladept") {
  //       this.departmet = data.DepartMent;
  //     } else if (flag === "timeunit") {
  //       this.focusElement('startpoint')
  //     } else if (flag === "reqtypsla") {
  //       this.focusElement('pronam')
  //     } else if (flag === "priority") {
  //       this.focusElement('desc')
  //     } else if (flag === "escalunit") {
  //       this.focusElement('notcmt')
  //     }
  //   }
  // }
  selectionChange(e: any, data: any, flag: any) {
  if (e.isUserInput && e.source.selected) {
    switch (flag) {
      case "companyView":
        setTimeout(() => {
          this.departmentList();
        }, 100);
        this.CompanyName = data.compname;
        this.CompanyCode = data.CmpCode;
        console.log(data);
        break;

      case "deptsla":
        this.BranchCodesla = data.brcode;
        this.BranchNamesla = data.brname;
        break;

      case "warehouseView":
        this.BranchCode = data.brcode;
        this.BranchName = data.brname;
        this.BranchCodesla = data.brcode;
        this.BranchNamesla = data.brname;
        break;

      case "dept":
        this.departmet = data.DepartMent;
        this.entrydepartmet = data.DepartMent;
        setTimeout(() => {
          this.view();
        }, 100);
        break;

      case "sladept":
        this.departmet = data.DepartMent;
        break;

      case "timeunit":
        this.focusElement('startpoint');
        break;

      case "reqtypsla":
        this.focusElement('pronam');
        break;

      case "priority":
        this.focusElement('desc');
        break;

      case "escalunit":
        this.focusElement('notcmt');
        break;
    }
  }
}

  backNavigation() {
    this.router.navigate(["/dashboard"]);
  }
}
