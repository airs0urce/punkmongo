# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PunkMongo is a web-based MongoDB administration tool inspired by RockMongo. It consists of two main parts:
- **punkmongo-api**: Node.js backend using Koa framework
- **punkmongo-client**: Vue 2 frontend (main client in use)

## Development Commands

### API Server (punkmongo-api/)
```bash
cd punkmongo-api
npm install
npm start          # Runs: nodemon server.js
```

### Client (punkmongo-client/)
```bash
cd punkmongo-client
npm install
npm start          # Runs: vue-cli-service serve
npm run build      # Production build
```

### Prerequisites
- Node.js >= 14.0.0
- MongoDB running locally on port 27017 (configurable in config.js)
- Vue CLI installed globally: `npm install -g @vue/cli`
- nodemon installed globally: `npm install -g nodemon`

## Architecture

### Configuration
`config.js` at the root contains all settings: API host/port, MongoDB connection details, and client configuration.

### API Structure (punkmongo-api/src/)
- `API.js` - Main Koa server setup with dynamic API method loading
- `API/` - Individual API endpoint handlers (one file per method), auto-loaded at startup
  - Methods called via POST to `/api/:method_name`
  - Each method receives `(params, mongoClient)` and returns a result
- `modules/` - Core modules:
  - `Mongo.js` - MongoDB connection singleton
  - `mongoHelpers.js` - Validation, BSON parsing, and Mongo Shell string conversion utilities
  - `UndoDelete.js` - Document restore functionality using NeDB storage
  - `punkmongoStorage.js` - Local NeDB database for app state
- `errors/` - Custom error classes (ApiError with error codes)

### Client Structure (punkmongo-client/src/)
- `api/api.js` - Axios-based API client wrapper
- `store/` - Vuex state management (mutations.js, actions.js)
- `router/` - Vue Router configuration with routes for databases, collections, CRUD operations
- `views/` - Page components (Database, Collection, NewCollection, etc.)
- `components/` - Reusable UI components (CollectionQuery, DatabasesNavigation, Pagination, etc.)

### API Communication
- Client sends POST requests to `/api/{methodName}` with JSON body `{id: uuid, params: {...}}`
- Server responds with `{id, success: true, result: ...}` or `{id, success: false, error: {code, message}}`
- Error codes >= 100 indicate server errors (100 = uncaught, 101 = server error)

### Key API Methods
- `listDatabases`, `getDatabase`, `dropDatabase`
- `getDbCollectionsStats`, `createCollection`, `dropCollection`, `renameCollection`
- `collectionQuery`, `getDocument`, `insertDocument`, `deleteDocument`, `restoreDocument`
- `getIndexes`, `serverInfo`
