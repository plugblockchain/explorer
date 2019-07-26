import { ApiPromise } from '@plugnet/api';
import { stringCamelCase } from '@plugnet/util';

export function genAllEvents(api: ApiPromise): string[] {
    const events = [];
    const metadataV5 =  api.runtimeMetadata.asV5;
    const metadataEvent = metadataV5.toJSON().modules;
    for (const meta of metadataEvent) {
        const section = stringCamelCase(meta.name);
        const methods = meta.events;
        if(methods) {
            for (const method of methods) {
                events.push(String(section+'.'+method.name));
            }
        }
    }
    return events;
}

export function genAllExtrinsics(api: ApiPromise): string[] {
    const extrinsics = [];
    const extrinsicList = api.tx;
    // tslint:disable-next-line: forin
    for (const section in extrinsicList) {
        // tslint:disable-next-line: forin
        for (const method in extrinsicList[section]) {
            extrinsics.push(String(section + '.' + method));
        }
    }
    return extrinsics;
}

export function genAllQueries(api: ApiPromise): string[] {
    const queries = [];
    const queriesList = api.query;
    // tslint:disable-next-line: forin
    for (const section in queriesList) {
        // tslint:disable-next-line: forin
        for (const method in queriesList[section]) {
            queries.push(String(section + '.' + method));
        }
    }
    return queries;
}
