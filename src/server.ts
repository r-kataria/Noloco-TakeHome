import express, { Application } from 'express';
import router, { getSchemaRoute, getDataRoute, getDataByIdRoute } from './routes';
import { initialize, globalData, globalSchema } from './helpers/data';

const PORT = 3000;

const app: Application = express();

app.use(express.json());

initialize().then(() => {
  getSchemaRoute(globalSchema);
  getDataRoute(globalData);
  getDataByIdRoute(globalData);

  app.use('/', router);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
