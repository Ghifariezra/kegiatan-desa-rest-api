<div align="center">

# Sukamaju Village Activity Information System

REST API for managing neighborhood units (RT), residents, activity schedules, participant registration, and village activity reports.

![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.12-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Zod](https://img.shields.io/badge/Validation-Zod_4-3E67B1)
![Mocha](https://img.shields.io/badge/Test-Mocha_%2B_Chai-8D6748?logo=mocha&logoColor=white)
![Allure](https://img.shields.io/badge/Report-Allure_3-FF6C37)
![Postman](https://img.shields.io/badge/API_test-Postman_%2B_Newman-FF6C37?logo=postman&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)

[Quick start](#quick-start) · [Endpoints](docs/api.md#api-endpoints) · [Testing](docs/testing.md#testing) · [Limitations](#known-limitations)

</div>

## Overview

- **8 PostgreSQL tables** with one-to-one, one-to-many, and many-to-many relations.
- **8 REST resources**, each with 5 CRUD routes (GET all, GET by ID, POST, PUT, DELETE).
- **Two-layer validation**: Zod for requests, constraints for the database. PostgreSQL errors are translated into readable messages.
- **CRUD code is written once** in `src/core/`. Each resource only contains configuration and, where needed, custom rules.
- **Two kinds of automated tests**, both currently covering only the `akun-warga` resource:
  - Mocha + Supertest (data-driven, uses a separate database, HTML report through Allure).
  - A Postman collection that can be run with Newman.

### Project status

| Area | Status |
| --- | --- |
| CRUD for 8 resources, validation, error handling | Done |
| Password hashing (bcrypt) | Done |
| Automated tests for the `akun-warga` resource (Mocha and Postman) | Done |
| Automated tests for the other 7 resources | Not yet |
| Code coverage measurement | Not yet |
| Authentication and authorization (login, JWT) | Not yet |
| Request rate limiting | Not yet |
| Pagination and filters | Not yet |

The list of known gaps is in [Known limitations](#known-limitations).

## Table of contents

- [Sukamaju Village Activity Information System](#sukamaju-village-activity-information-system)
  - [Overview](#overview)
    - [Project status](#project-status)
  - [Table of contents](#table-of-contents)
  - [Case study](#case-study)
  - [Quick start](#quick-start)
  - [Known limitations](#known-limitations)
  - [Roadmap](#roadmap)
  - [License](#license)
- [Database](docs/database.md)
  - [Database design](docs/database.md#database-design)
    - [Relations](docs/database.md#relations)
    - [Delete rules (ON DELETE)](docs/database.md#delete-rules-on-delete)
    - [CHECK constraints in the database](docs/database.md#check-constraints-in-the-database)
    - [Sample data (`seed.sql`)](docs/database.md#sample-data-seedsql)
  - [Folder structure](docs/database.md#folder-structure)
- [Architecture and installation](docs/architecture.md)
  - [Code architecture](docs/architecture.md#code-architecture)
    - [Technology](docs/architecture.md#technology)
  - [Full installation](docs/architecture.md#full-installation)
    - [npm scripts](docs/architecture.md#npm-scripts)
- [API](docs/api.md)
  - [API endpoints](docs/api.md#api-endpoints)
    - [Response format](docs/api.md#response-format)
    - [Request body examples](docs/api.md#request-body-examples)
  - [Validation rules](docs/api.md#validation-rules)
  - [Error handling](docs/api.md#error-handling)
- [Testing and troubleshooting](docs/testing.md)
  - [Testing](docs/testing.md#testing)
    - [Mocha and Allure](docs/testing.md#mocha-and-allure)
      - [Coverage](docs/testing.md#coverage)
      - [How it works](docs/testing.md#how-it-works)
      - [Parallel mode](docs/testing.md#parallel-mode)
      - [Running the Mocha tests](docs/testing.md#running-the-mocha-tests)
      - [Allure report](docs/testing.md#allure-report)
      - [Adding tests for other resources](docs/testing.md#adding-tests-for-other-resources)
    - [Postman and Newman](docs/testing.md#postman-and-newman)
      - [Import and setup](docs/testing.md#import-and-setup)
      - [Collection variables](docs/testing.md#collection-variables)
      - [Run order](docs/testing.md#run-order)
      - [Running with Newman](docs/testing.md#running-with-newman)
    - [Manual tests for other resources](docs/testing.md#manual-tests-for-other-resources)
  - [Troubleshooting](docs/testing.md#troubleshooting)

## Case study

Sukamaju Village needs an information system to manage the schedules and participants of village activities, such as community clean-ups (kerja bakti), neighborhood watch (siskamling), posyandu health posts, and holiday celebrations. Until now, activity announcements were only shared through WhatsApp groups and the mosque loudspeaker. As a result, village officials struggle to know how many residents will attend, and activity outcomes are not documented.

Feature requirements:

1. Record RTs and the residents in each RT.
2. Account data for each resident (one resident has one account).
3. Group activities by category and location.
4. Schedule activities: date, start and end time, participant quota, and status.
5. Register residents for activities and record their attendance.
6. A report for every activity that has finished.

## Quick start

Prerequisites: Node.js 22.12 or newer, and PostgreSQL (the `psql` command must be callable from the terminal).

```bash
git clone https://github.com/Ghifariezra/kegiatan-desa-rest-api.git
cd kegiatan-desa-rest-api
npm install

psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE kegiatan_desa;"

cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
# fill in DB_PASSWORD in the .env file

npm run db:reset          # creates the tables and loads sample data
npm run dev
```

The server runs at `http://localhost:3000`. Details for each step are in [Full installation](docs/architecture.md#full-installation). How to run the tests is covered in [Testing](docs/testing.md#testing).

## Known limitations

This is the current state of the code, not hidden bugs.

- **No authentication or authorization.** All endpoints are open, including creating accounts with the `admin` role (`peran`). The `akun_warga` table and password hashes exist, but there is no login endpoint yet.
- **No rate limiting.** The `express-rate-limit` package is installed but not used.
- **CORS uses the default configuration** (`cors()`), which accepts requests from any origin.
- **The quota check is not atomic.** `pendaftaran-kegiatan.service.js` counts the registrants and then saves in two separate queries with no transaction or lock, so two simultaneous registrations could exceed the quota.
- **Few business rules.** For example, an activity's quota can be lowered below the number of registrants, a report can be created for an activity that has not finished, and `jumlah_hadir` is not reconciled with registration data.
- **Passwords are not trimmed**, so a password made of 8 spaces is considered valid. This is recorded as a finding in test case `POST-13` in the test data.
- **No pagination or filters** on GET all.
- **No database migrations.** The structure is managed through SQL files, and `db:reset` deletes all data.
- **Limited test coverage**: only `akun-warga`, and no code coverage measurement yet.
- **The Allure report** is currently generated in serial mode (see the note in the [Allure report](docs/testing.md#allure-report) section).

## Roadmap

- Login endpoint and authentication (JWT) based on the `akun_warga` table (the `jsonwebtoken` package is already installed).
- Request rate limiting with `express-rate-limit`, which is also already installed.
- Pagination and filters on the GET all endpoints.
- Mocha tests and Postman collections for the other 7 resources.

## License

ISC