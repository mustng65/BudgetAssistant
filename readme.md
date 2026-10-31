# Budget Assistant

## Web API configuration

The Web API can persist application state in SQLite. Set `SQLITE_DB_PATH` to the database file you want to use; if it is omitted, the app creates `./data/budgetassistant.db` in the working directory.

Example:

```bash
export SQLITE_DB_PATH=/data/budgetassistant.db
```
