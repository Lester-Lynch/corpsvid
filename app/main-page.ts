import { EventData, Page } from '@nativescript/core';
import { corpsvidModel } from './main-view-model';

// Event handler for Page 'navigatingTo' event attached in main-page.xml
export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new corpsvidModel();
}
