# Mela Release Gate

This project is not considered production-ready merely because a build succeeds.

## Required release sequence

1. Open a pull request into `main`.
2. The Mela pre-launch integration QA workflow must pass on the pull request.
3. Verify the same commit is the commit selected for production deployment.
4. Deploy to the staging/preview environment first and verify the production contract, authentication, role isolation, payments, and browser smoke tests.
5. Record the previous production deployment/build as the rollback target before promoting the new build.
6. Promote the verified build to production.
7. Run the production contract and browser smoke checks again after promotion.
8. Only after all checks pass may `production_launch` be changed from `false` to `true`.

## Rollback

If post-deployment verification fails, immediately restore the previously verified production deployment/build. Do not change `production_launch` to `true` while the new deployment is failing.

## Release identity

`mela.sync.json` is the source-of-truth marker for the active frontend build and SHA-256 digest. A release must use one immutable commit/build identity throughout QA, staging, and production.
