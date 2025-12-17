---
sidebar_position: 2
title: Health Monitoring
---

# Health Monitoring

Health Monitoring offers up-to-date information on the linting, security, and build status of your monorepo's packages.

## Overview

Real-time insights into the package quality of your monorepo are provided by Health Monitoring including <!-- test coverage, --> linting, security, and build status.

![Screenshot of the health metrics](/img/health-page.png "Health Metrics Screen")

## Health Metrics

<!-- ### Test Coverage

Measures what percentage of your code is covered by tests:

- **Excellent**: ≥ 80%
- **Good**: 60-79%
- **Fair**: 40-59%
- **Poor**: < 40%
-->

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

Each package receives an overall health score (0-100) based on:

<!-- - **30%** - Test Coverage -->
- **35%** - Linting Status
- **35%** - Security Status  
- **30%** - Build Health

## Accessing Health Data

### Via API

```bash
# Get all packages health
curl http://localhost:8999/api/health/packages

# Get specific package health
curl http://localhost:8999/api/health/packages/@scope/backend

# Refresh health data
curl -X POST http://localhost:8999/api/health/refresh
```

### Via Dashboard

View health metrics in the dashboard with:

- Package health cards
- Health score visualization
- Detailed metrics breakdown

## Next Steps

- [CI Integration](/features/ci-integration)
- [API Reference - Health](/api-reference/health)
