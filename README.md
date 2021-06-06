# appsync-crud-sls-backend

## Environment Setup

To deploy the application, setup a default AWS profile using the AWS cli. You only need to do this once per environment.
just us

**Development**

```
yarn deploy
```

**Staging**

```
yarn deploy -s staging
```

**Production**

```
yarn deploy -s production
```

## Local Development

To run unit tests

```
yarn unit-test
```

To run integration tests

```
yarn export-env
yarn integration-test
```

To run end to end tests

```
yarn export-env
yarn e2e-test
```

## CI/CD

**Dev / Feature work**

1. Work on a feature branch for example `feature/some-feature`. Make sure the tests are passing for each of the commits.
2. When the feature is complete send a PR to `dev`.
3. If tests are passing, and code review is complete merge the PR. Make sure the deployment succeeds and tests pass.

**Deploy to staging**

1. Create a release branch off `dev` for example `release/1.1` and push to github.
2. Make sure the deployment succeeds and tests pass.

**Deploy to production**

1. Create a PR from `release/1.1` into `main`.
2. Merge PR. Make sure deployment succeeds and tests pass.
