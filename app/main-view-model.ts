/*
    COVID-19 Symptom Reporting

    13 July 2020
    - Corrected data format to work with Couchbase.
    - Pull up previous record.  Optional layout allows for clean slate.
    12 July 2020
    - Initial build.  Single screen, simple checkboxes.  UUID only to maybe avoid
    PII/HIIPA issues.  Works offline and reports to a Couchbase Sync Gateway.
    - No backend reporting at this time.

*/

import { Observable, ObservableArray } from '@nativescript/core';
import { fromObject } from '@nativescript/core/data/observable'
import { ObservableProperty } from "./observable-property-decorator";
import { CheckBox } from '@nstudio/nativescript-checkbox';
import { device } from "@nativescript/core/platform"
import { Couchbase, Replicator } from "nativescript-couchbase-plugin";
import { dateProperty } from '@nativescript/core/ui/date-picker';


export class corpsvidModel extends Observable {

    version = "14Jul20 1122";
    
    corpsvidDatabase: Couchbase;

    record: any;

    // @ObservableProperty() 
    report = {
        'uuid': device.uuid,
        'date': Date(),
        'fever': false,
        'cough': false,
        'breath': false,
        'chills': true,
        'shaking': false,
        'musclePain': false,
        'headache': false,
        'soreThroat': false,
        'tasteSmell': false
    };

    @ObservableProperty()  message = null;
    @ObservableProperty()  lastReportDate = "na";
    // @ObservableProperty()  todaysReportDate = new Date();
    // @ObservableProperty()  
    uuid = device.uuid;
  

    constructor() {
        super();

        this.corpsvidDatabase = new Couchbase("corpsvid-database");
        var pushCorpsvidDatabase = this.corpsvidDatabase.createPushReplication("ws://eert-dev.ddns.net:4984/corpsvid");
        pushCorpsvidDatabase.setContinuous(true);
        pushCorpsvidDatabase.start();

        console.log("UUID: " + this.uuid);
        console.log(this.record);
        this.getRecord();
    }

    getRecord() {
        console.log("Get record...")
        var result = this.corpsvidDatabase.query({
            select: []
        });
        console.log("Database length: " + result.length);

/*  Use this to always start with a clean report
        this.record = this.corpsvidDatabase.getDocument(this.uuid);
        console.log(this.record);
        if (this.record) {
            console.log("Database record found:");
            this.lastReportDate = this.record.date
            this.message = "Last report: " + this.lastReportDate;
        } else {
            console.log("No database record found!");
        }
*/

        this.report = this.corpsvidDatabase.getDocument(this.uuid);
        console.log(this.report);
        if (this.report) {
            console.log("Database record found:");
            this.lastReportDate = this.report.date
            this.message = "Last report: " + this.lastReportDate;
        } else {
            console.log("No database record found!");
        }
    }

    onSubmit() {
        // Update the record if it exists in the db.
        // Create the record if it does not exist.

        console.log("Submit...");
        console.log(this.report);

        if (this.report) {
            this.corpsvidDatabase.updateDocument( this.uuid, this.report )
            console.log("Record updated");
        } else {
            this.corpsvidDatabase.createDocument( this.report, this.uuid )
            console.log("Record created");
        }
    };

}
