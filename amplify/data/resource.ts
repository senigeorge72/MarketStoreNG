import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Store: a.model({
    slug: a.string().required(),
    owner: a.string().authorization((allow) => [allow.owner().to(['read', 'delete']), allow.groups(['MARKETSTORE_ADMINS']).to(['create', 'read', 'delete']), allow.guest().to(['read']), allow.publicApiKey().to(['read'])]),
    businessName: a.string().required(), description: a.string(), category: a.string(), phone: a.string(), whatsapp: a.string(), city: a.string(), address: a.string(), openingHours: a.string(), deliveryInfo: a.string(), logoUrl: a.string(), productsJson: a.string(),
  }).identifier(['slug']).authorization((allow) => [allow.owner(), allow.groups(['MARKETSTORE_ADMINS']), allow.guest().to(['read']), allow.authenticated('identityPool').to(['read']), allow.publicApiKey().to(['read'])]),
  Order: a.model({
    id: a.id().required(),
    storeSlug: a.string().required(),
    sellerOwner: a.string().required(),
    customerName: a.string().required(),
    deliveryLocation: a.string().required(),
    itemsJson: a.string().required(),
    total: a.float().required(),
    status: a.enum(['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED']).authorization((allow) => [allow.ownerDefinedIn('sellerOwner'), allow.guest().to(['read']), allow.publicApiKey().to(['read'])]),
  }).authorization((allow) => [allow.ownerDefinedIn('sellerOwner'), allow.guest().to(['create', 'get']), allow.publicApiKey().to(['create', 'get'])]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema, authorizationModes: { defaultAuthorizationMode: 'userPool', apiKeyAuthorizationMode: { expiresInDays: 365 } } });
