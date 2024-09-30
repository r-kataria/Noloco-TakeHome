import axios, { AxiosResponse } from 'axios';
import { DataType, Field, Row, Schema } from '../types';

// Global variables to store data and schema
export let globalData: Row[] = [];
export let globalSchema: Schema = [];

// From https://www.geeksforgeeks.org/how-to-convert-string-to-camel-case-in-javascript/#using-the-strreplace-method
const camelCase = (str: string) =>  {
    // Using replace method with regEx
    return str.replace("(", "").replace(")", "").replace("-", "").replace("_", "")
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index == 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
}

const isDate = (value: string): boolean => !isNaN(Date.parse(value));

export const detectDataType = (value: any): DataType | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return DataType.BOOLEAN;
    if (typeof value === 'number') return Number.isInteger(value) ? DataType.INTEGER : DataType.FLOAT;
    if (typeof value === 'string') {
        const lower = value.trim().toLowerCase();
        if (lower === 'true' || lower === 'false') return DataType.BOOLEAN;
        if (isDate(value)) return DataType.DATE;
        const num = Number(value);
        if (!isNaN(num)) return Number.isInteger(num) ? DataType.INTEGER : DataType.FLOAT;
        return DataType.TEXT;
    }
    return DataType.TEXT;
};


export function typeCast(value: any, type: DataType | null): any {
    if (value === null || value === undefined || type == null) {
        return null;
    }

    switch (type) {
        case DataType.TEXT:
        case DataType.OPTION:
            return String(value).trim();

        case DataType.INTEGER:
            const intVal = Number(value);
            return Number.isInteger(intVal) ? intVal : null;

        case DataType.FLOAT:
            const floatVal = Number(value);
            return !isNaN(floatVal) ? floatVal : null;

        case DataType.BOOLEAN:
            if (typeof value === 'boolean') {
                return value;
            }
            if (typeof value === 'string') {
                const lower = value.trim().toLowerCase();
                if (lower === 'true') return true;
                if (lower === 'false') return false;
            }
            if (typeof value === 'number') {
                return value !== 0;
            }
            return null;

        case DataType.DATE:
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date;

        default:
            return null;
    }
}

async function fetchData(url: string): Promise<Row[]> {
    const response: AxiosResponse<Row[]> = await axios.get<Row[]>(url);
    const data: Row[] = response.data;

    if (!Array.isArray(data)) {
        throw new Error('Fetched data is not an array.');
    }

    return data;
}

function processData(rows: Row[]): { schema: Schema; cleanedData: Row[] } {
    const fieldsMap: { [key: string]: { field: Field; uniqueValues: Set<string> } } = {};
    const cleanedData: Row[] = [];

    // Collect schema information and prepare for cleaning
    rows.forEach((row) => {
        const tempCleanRow: Partial<Row> = {};

        Object.entries(row).forEach(([key, value]) => {
            const camelKey = camelCase(key);

            if (!fieldsMap[camelKey]) {
                const dataType = detectDataType(value);
                if (!dataType) return; // Skip if type is undetectable

                if (dataType === DataType.TEXT) {
                    fieldsMap[camelKey] = {
                        field: {
                            display: camelKey,
                            name: camelKey,
                            type: DataType.OPTION,
                            options: [],
                        },
                        uniqueValues: new Set<string>(),
                    };
                    if (typeof value === 'string') {
                        fieldsMap[camelKey].uniqueValues.add(value);
                    }
                } else {
                    fieldsMap[camelKey] = {
                        field: {
                            display: camelKey,
                            name: camelKey,
                            type: dataType,
                            options: [],
                        },
                        uniqueValues: new Set<string>(),
                    };
                }
            } else {

                if (fieldsMap[camelKey].field.type === DataType.OPTION && typeof value === 'string') {
                    fieldsMap[camelKey].uniqueValues.add(value);
                }
            }

            tempCleanRow[camelKey] = value;
        });

        cleanedData.push(tempCleanRow as Row);
    });

    Object.keys(fieldsMap).forEach((key) => {
        const { field, uniqueValues } = fieldsMap[key];
        if (field.type === DataType.OPTION) {
            if (uniqueValues.size > 5) {
                // change to TEXT if too many unique values
                field.type = DataType.TEXT;
                field.options = [];
            } else {
                field.options = Array.from(uniqueValues);
            }
        }
    });

    // Clean and typecast the data based on the finalized schema
    const finalCleanedData: Row[] = cleanedData.map((row) => {
        const cleanRow: Row = {};

        Object.entries(row).forEach(([key, value]) => {
            const schemaField = fieldsMap[key]?.field;
            if (schemaField) {
                cleanRow[key] = typeCast(value, schemaField.type);
            }
        });

        return cleanRow;
    });

    // Extract the finalized schema
    const schema: Schema = Object.values(fieldsMap).map((entry) => entry.field);

    return { schema, cleanedData: finalCleanedData };
}

export async function initialize() {
    try {
        const rawData = await fetchData('https://app-media.noloco.app/noloco/dublin-bikes.json');
        const { schema, cleanedData } = processData(rawData);

        globalSchema = schema;
        globalData = cleanedData;

        console.log('Data and schema initialized successfully.');

    } catch (error) {

        console.error('Error during initialization:', error);

    }
}
