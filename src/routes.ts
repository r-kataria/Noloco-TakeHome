import { Router, Request, Response } from 'express';
import { Schema, Row, DataType } from './types';
import { typeCast } from './helpers/data'
import { where, orderBy } from './helpers/query'

const router = Router();


// GET /schema
export function getSchemaRoute(schema: Schema) {
    router.get('/schema', (req: Request, res: Response) => {
        res.json(schema);
    });
}


// GET /data
export function getDataRoute(data: Row[]) {
    router.get('/data', (req: Request, res: Response) => {
        const body = req.body;

        var responseData = where(data, body['where'])
        var responseData = orderBy(responseData, body['orderBy'])

        res.json(responseData);
    });
}

// GET /data/:id
export function getDataByIdRoute(data: Row[]) {
    router.get('/data/:id', (req: Request, res: Response) => {

        const id = typeCast(req.params.id, DataType.INTEGER)
        var responseData = where(data, { "id": { "eq": id } })

        if (responseData.length == 0){{
            res.json("404");
            return;
        }}

        res.json(responseData[0]);
    });
}




export default router;
