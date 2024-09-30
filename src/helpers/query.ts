import { Row, FiltersObject } from '../types';
import { detectDataType, typeCast } from './data';

export function where(data: Row[], filters: FiltersObject): Row[] {
    if (!filters || Object.keys(filters).length === 0) {
        return data;
    }

    let filtered = data.filter((row) =>  satisfiesCondition(row, filters))

    return filtered;
}

function satisfiesCondition(row: Row, filters: FiltersObject): boolean {
    const operators: Record<string, (a: any, b: any) => boolean> = {
        eq: (a, b) => a === b,
        gt: (a, b) => a > b,
        lt: (a, b) => a < b,
        ne: (a, b) => a !== b,
    };

    return Object.entries(filters).every(([key, filter]) => {
        return Object.entries(filter).every(([op, val]) => {
            return operators[op]?.(row[key], typeCast(val, detectDataType(val))) ?? false
        }
        )
    }
    );
}


export function orderBy(data: Row[], key: string) {
    // FROM https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
    return data.sort((a, b) => (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0))
}