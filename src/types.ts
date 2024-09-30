export enum DataType {
    TEXT = 'TEXT',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    DATE = 'DATE',
    BOOLEAN = 'BOOLEAN',
    OPTION = 'OPTION',
  }
  
  export interface Field {
    display: string;
    name: string;
    type: DataType;
    options: string[];
  }
  
  export interface Row {
    [key: string]: any;
  }
  
  export enum FilterOptions {
    EQUAL = 'eq',
    GREATERTHAN = 'gt',
    LESSTHAN = 'lt',
    NOTEQUAL = 'ne',
  }

  export type Filter = {
    [key in FilterOptions]?: any
  }

  export interface FiltersObject {
    [key: string]: Filter;
  }

  export interface Query {
    where: FiltersObject;
    orderBy: string;
  }
    

  export type Schema = Field[];
  