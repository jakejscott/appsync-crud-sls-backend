# appsync-crud-sls-backend

## Environment Setup

To deploy the application, setup a default AWS profile using the AWS cli. You only need to do this once per environment. The IAM user for this will need admin access to your account and is also used to run integration tests locally.

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

## Manual Testing

Install the Thunder Client for VS Code https://www.thunderclient.io

Create a collection by importing the file `thunder-collection-appsync-crud-sls-backend-dev.json` to Thunder client.

Setup the following environment variables in Thunder.

- `APPSYNC_URL`
- `TOKEN`

To get a valid token run `yarn signup` which will output JSON with an `idToken` which you can copy.

```
yarn export-env
yarn signup
```

```json
{
  "id": "21bfa9a8-0382-4757-9533-649a21c0866e",
  "email": "jake.net+cecilia.holmes.eldk@gmail.com",
  "accessToken": "...",
  "idToken": "..."
}
```

## CI/CD

**IAM setup**

1. Setup a user `appsync-crud-sls-ci-user` in IAM that doesn't have any permissions. Take note of the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
2. Setup a role `appsync-crud-sls-ci-role` in IAM that has admin permission.
3. Edit the trust relationship that only allows the `appsync-crud-sls-ci-user` the ability to assume the role.

Make sure the edit `<YOUR_AWS_ACCOUNT_ID>`.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<YOUR_AWS_ACCOUNT_ID>:user/appsync-crud-sls-ci-user"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Github actions setup**

Add the following secrets in the github actions settings

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DEV_ACCOUNT_ID`
- `STAGING_ACCOUNT_ID`
- `PRODUCTION_ACCOUNT_ID`

**Dev / Feature work**

1. Work on a feature branch for example `feature/some-feature`. Make sure the tests are passing for each of the commits.
2. When the feature is complete send a pull request to `dev`.
3. If tests are passing, and code review is complete merge the pull request. Make sure the deployment succeeds and tests pass.

**Deploy to staging**

1. Create a release branch off `dev` for example `release/1.1` and push to github.
2. Make sure the deployment succeeds and tests pass.

**Deploy to production**

1. Create a pull request from `release/1.1` into `main`.
2. Merge the pull request. Make sure deployment succeeds and tests pass.
