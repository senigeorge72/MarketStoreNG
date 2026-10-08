# MarketStore Platform

This is the new full-stack app, kept separate from the existing S3 landing page until it is ready.

First release: one email account per trader; one owner-managed public store page at `/{business-name}`; product names, prices, descriptions and optional image URLs; public phone and WhatsApp contact.

## Local AWS setup
1. Run `pnpm install`.
2. Sign in to the AWS account to use and ensure its credentials are available locally.
3. Run `pnpm exec ampx sandbox` from this folder. It provisions Cognito sign-in and the AppSync/DynamoDB store API, then generates `amplify_outputs.json`.
4. Run `pnpm dev` and open `http://localhost:3000`.
5. Create an owner account, verify the email, and create a store.

The store record contains only information intended for public display. Owners can write their own record; anonymous visitors have read-only access. The slug is the primary key, so it is globally unique.

## Production
The current `marketstore.ng` S3 site is not changed. Deploy this app to an Amplify staging branch and verify account creation and public store links first. Only then attach `marketstore.ng` to Amplify and change its DNS mapping. Production sign-up email delivery needs a configured Cognito/SES sender.

## Current limits
One store per owner. Image fields accept public image URLs; direct image uploads, payments, delivery integrations, reviews, and moderation are future work.