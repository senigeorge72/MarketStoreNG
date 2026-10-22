import { a, defineData, type ClientSchema } from '@aws-amplify/backend';
const schema = a.schema({
  Store: a.model({
    slug: a.string().required().authorization((allow) => [allow.owner().to(['create', 'read']), allow.groups(['MARKETSTORE_ADMINS']), allow.guest().to(['read']), allow.authenticated('identityPool').to(['read']), allow.publicApiKey().to(['read'])]), owner: a.string().authorization((allow) => [allow.owner().to(['read', 'delete']), allow.groups(['MARKETSTORE_ADMINS']).to(['create', 'read', 'delete'])]), businessName: a.string().required().authorization((allow) => [allow.owner().to(['create', 'read']), allow.groups(['MARKETSTORE_ADMINS']), allow.guest().to(['read']), allow.authenticated('identityPool').to(['read']), allow.publicApiKey().to(['read'])]), description: a.string(), category: a.string().authorization((allow) => [allow.owner().to(['create', 'read']), allow.groups(['MARKETSTORE_ADMINS']), allow.guest().to(['read']), allow.authenticated('identityPool').to(['read']), allow.publicApiKey().to(['read'])]),
    phone: a.string().authorization((allow) => [allow.owner().to(['create', 'read']), allow.groups(['MARKETSTORE_ADMINS']), allow.guest().to(['read']), allow.authenticated('identityPool').to(['read']), allow.publicApiKey().to(['read'])]), whatsapp: a.string().authorization((allow) => [allow.owner().to(['create', 'read']), allow.groups(['MARKETSTORE_ADMINS']), allow.guest().to(['read']), allow.authenticated('identityPool').to(['read']), allow.publicApiKey().to(['read'])]), city: a.string().authorization((allow) => [allow.owner().to(['create', 'read']), allow.groups(['MARKETSTORE_ADMINS']), allow.guest().to(['read']), allow.authenticated('identityPool').to(['read']), allow.publicApiKey().to(['read'])]), address: a.string(), openingHours: a.string(),
    deliveryInfo: a.string(), logoUrl: a.string(), productsJson: a.string(),
  }).identifier(['slug']).authorization((allow) => [
    allow.owner(),
    allow.groups(['MARKETSTORE_ADMINS']),
    allow.guest().to(['read']),
    allow.authenticated('identityPool').to(['read']),
    allow.publicApiKey().to(['read']),
  ]),
});
export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema, authorizationModes: { defaultAuthorizationMode: 'userPool', apiKeyAuthorizationMode: { expiresInDays: 365 } } });
