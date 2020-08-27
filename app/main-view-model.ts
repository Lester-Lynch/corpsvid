/*
    COVID-19 Symptom Reporting

    25 Aug 2020
    - Added useCleartextTraffic handling to manifest
    - Added xml/network_security_config file
    - Added getRecord after 1st submit to ensure future changes are handled as document updates
    31 July 2020
    - SGW now running SSL due to Android not allowing cleartext
    15 July 2020
    - Now pull db into record for last report info and write report to db.
    - Make 'as of' date an event to stay current
    - On submit revise 'Previous report'
    - This should account for app being left running
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

    version = "25Aug20 1345";


    
    corpsvidDatabase: Couchbase;

    record: any;

    @ObservableProperty()     report = {
        'uuid': device.uuid,
        'date': Date(),
        'fever': false,
        'cough': false,
        'breath': false,
        'chills': false,
        'shaking': false,
        'musclePain': false,
        'headache': false,
        'soreThroat': false,
        'tasteSmell': false
    };

    @ObservableProperty()  message = null;
    @ObservableProperty()  lastReportDate = "na";
    @ObservableProperty() currentDate = Date();
    @ObservableProperty() uuid = device.uuid;
  

    constructor() {
        super();

        this.corpsvidDatabase = new Couchbase("corpsvid-database");
        var pushCorpsvidDatabase = this.corpsvidDatabase.createPushReplication("ws://eert-dev.ddns.net:4984/corpsvid");
        pushCorpsvidDatabase.setContinuous(true);
        pushCorpsvidDatabase.start();

        /* Trying to get the current date time to stream on screen
        setInterval(() => {
            this.report.date = Date();
            console.log(this.currentDate);
        }, 1000);
        */

        console.log("UUID: " + this.uuid);
        console.dir(this.report);
        this.getRecord();
    }

    getRecord() {
        console.log("Get record...")
        var queryResult = this.corpsvidDatabase.query({
            select: []
        });
        console.log("Database length: " + queryResult.length);

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

        console.log("--- Get Document ---")
        this.record = this.corpsvidDatabase.getDocument(this.uuid);
        console.log(this.record);
        if (this.record) {
            console.log("Database record found:");
            this.report = this.record;
            console.dir(this.report);
            this.lastReportDate = this.report.date;
            this.message = "Previous report: " + this.lastReportDate;
        } else {
            console.log("No database record found!");
            this.message = "No previous report found."
        }
    }

    onSubmit() {
        // Update the record if it exists in the db.
        // Create the record if it does not exist.

        console.log("Submit...");
        console.log(this.report);
        this.report.date = Date();

        if (this.record) {
            this.corpsvidDatabase.updateDocument( this.uuid, this.report )
            console.log("Record updated");
        } else {
            this.corpsvidDatabase.createDocument( this.report, this.uuid )
            console.log("Record created");
            this.getRecord();               // Get the record so future submits are seen as updates
        }
        this.lastReportDate = this.report.date;
        this.message = "Previous report: " + this.lastReportDate;
    };

}
