import { defineAuth } from '@aws-amplify/backend';
export const auth = defineAuth({ loginWith: { email: true }, groups: ['MARKETSTORE_ADMINS'] });
