import 'dotenv/config'; // Load variables from .env
import express from 'express';
import cors from 'cors';
import { budgetMonthsList, budgetMonthGet, initActualApi, shutdownActualApi, transactionsCategoryGroupMonthList, accountList } from './services/actualApi.js';
import logger from './logging/logger.js';
import { asyncHandler } from './middleware/asyncHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { SERVICE_NAME } from './config/index.js'

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.status(200);
  res.send("Welcome to root URL of Server");
});


app.get('/budgets', asyncHandler(async (req, res) => {

  const months = await budgetMonthsList();
  res.set('Cache-Control', 'no-store');
  res.status(200).json(months);

}));

app.get('/budgets/:year/:month', asyncHandler(async (req, res) => {

  const budget = await budgetMonthGet(`${req.params.year}-${req.params.month}`)
  res.set('Cache-Control', 'no-store');
  res.status(200).json(budget);

}));

app.get('/transactions/:categoryGroup/:year/:month', asyncHandler(async (req, res) => {

  const budget = await transactionsCategoryGroupMonthList(req.params.categoryGroup, `${req.params.year}-${req.params.month}`)
  const groups = Object.groupBy(budget.data, transaction => transaction["category.name"])

  const response = [];
  for (let key in groups) {
    response.push({
      id: groups[key][0]["category.id"],
      name: key,
      transactions: groups[key]
    });
  }

  res.set('Cache-Control', 'no-store');
  res.status(200).json(response);

}));

app.get('/accounts', asyncHandler(async (req, res) => {

  let accounts = await accountList(req.query.includeCurrentBalance);

  if (req.query.name != null && req.query.name != '') {
    accounts = accounts.filter(account => account.name == req.query.name)
  }
  res.set('Cache-Control', 'no-store');
  res.status(200).json(accounts);

}));


// Global error handler (keeps responses consistent)
app.use(errorHandler);

// Startup sequence
(async () => {
  try {
    // Accessing the version from process.env
    const appVersion = process.env.npm_package_version;
    const header = "\n\
  ____              _                  _               _       _                 _        _     ____  ___ \n\
 | __ )  _   _   __| |  __ _   ___    / \\    ___  ___ (_) ___ | |_  __ _  _ __  | |_     / \\   |  _ \\|_ _|\n\
 |  _ \\ | | | | / _` | / _` | / _ \\  / _ \\  / __|/ __|| |/ __|| __|/ _` || '_ \\ | __|   / _ \\  | |_) || | \n\
 | |_) || |_| || (_| || (_| ||  __/ / ___ \\ \\__ \\\\__ \\| |\\__ \\| |_| (_| || | | || |_   / ___ \\ |  __/ | | \n\
 |____/  \\__,_| \\__,_| \\__, | \\___|/_/   \\_\\|___/|___/|_||___/ \\__|\\__,_||_| |_| \\__| /_/   \\_\\|_|   |___|\n\
                       |___/                                                                Version " + appVersion + "\n"
    console.log(header);

    logger.info(`Starting ${SERVICE_NAME} server...`);

    await initActualApi();

    logger.info('Startup complete', {
      port: PORT,
      // env: NODE_ENV,
    });
  } catch (err) {
    logger.error('Critical startup failure', { error: err.message, stack: err.stack });
    process.exit(1);
  }
})();


const shutdown = async (signal) => {
  logger.info(`${signal} received – shutting down gracefully...`);

  try {
    await shutdownActualApi();
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', { error: err.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(`Server is Successfully Running, and App is listening on port ${PORT}`);
  else
    console.log("Error occurred, server can't start", error);
});