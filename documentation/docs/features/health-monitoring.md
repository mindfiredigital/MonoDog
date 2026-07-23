---
sidebar_position: 2
title: Health Monitoring
---

# Health Monitoring

Health Monitoring offers up-to-date information on the linting, security, and build status of your monorepo's packages.

## Overview

Real-time insights into the package quality of your monorepo are provided by Health Monitoring including test coverage, linting, security, and build status.

![Screenshot of the health metrics](/img/health-page.png 'Health Metrics Screen')

## Health Metrics

### Test Coverage

Measures what percentage of your code is covered by tests. MonoDog expects a `coverage-summary.json` file to calculate exact scores, but it provides graceful fallbacks if your setup is incomplete.

The maximum health score awarded for testing is **25 points**.

- **Perfect Scenario(x% Coverage):** MonoDog reads **`coverage/coverage-summary.json`** and awards points based on the exact percentage (e.g. `x / 100 * 25` = **y Points**).
- **Alternative files present but not `coverage-summary.json`:** If it finds `lcov.info`, `clover.xml`, or `coverage.json` instead, it provides a 50% coverage (`50 / 100 * 25` = **12.5 Points**).
- **Testing configured but not run:** If no coverage files exist but your `package.json` contains test scripts or libraries like `jest`, it provides 30% coverage (`30 / 100 * 25` = **7.5 Points**).
- **No tests:** If no tests are configured at all, you receive **0 Points**.

### Linting Status

Identifies problems with code quality:

- **Pass**: No warnings or lint errors
- **Warn**: Just warnings; no errors
- **Fail**: Linting errors found

### Security Audit

Identifies vulnerable dependencies:

- **Pass**: No vulnerabilities
- **Warn**: Low-severity vulnerabilities
- **Fail**: Medium or high-severity vulnerabilities

### Build Status

Tracks build success rate:

- **Healthy**: All recent builds are successful
- **Warning**: Some builds are failed
- **Error**: Most builds are failing

## Health Score

Each package receives an overall health score (0-100) based on a weighted calculation:

- **30 Points** - Build Status
- **25 Points** - Test Coverage
- **25 Points** - Linting Status
- **20 Points** - Security Audit

## Accessing Health Data

### Via API

```bash
# Get all packages health
curl http://localhost:4000/api/health/packages

# Get specific package health
curl http://localhost:4000/api/health/packages/@scope/backend

# Refresh health data
curl -X POST http://localhost:4000/api/health/refresh
```

### Via Dashboard

View health metrics in the dashboard with:

- Package health cards
- Health score visualization
- Detailed metrics breakdown

## Next Steps

- [API Reference - Health](/api-reference/health)
