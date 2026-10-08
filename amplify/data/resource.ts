import { a, defineData, type ClientSchema } from '@aws-amplify/backend';
const schema = a.schema({
  Store: a.model({
    slug: a.string().required(), owner: a.string().authorization((allow) => [allow.owner().to(['read', 'delete'])]), businessName: a.string().required(), description: a.string(), category: a.string(),
    phone: a.string(), whatsapp: a.string(), city: a.string(), address: a.string(), openingHours: a.string(),
    deliveryInfo: a.string(), logoUrl: a.string(), productsJson: a.string(),
  }).identifier(['slug']).authorization((allow) => [
    allow.owner(),
    allow.guest().to(['read']),
    allow.authenticated('identityPool').to(['read']),
    allow.publicApiKey().to(['read']),
  ]),
});
export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema, authorizationModes: { defaultAuthorizationMode: 'userPool', apiKeyAuthorizationMode: { expiresInDays: 365 } } });