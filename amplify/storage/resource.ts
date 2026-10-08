import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'marketStoreProductImages',
  access: (allow) => ({
    'products/*': [allow.guest.to(['read'])],
    'products/{entity_id}/*': [allow.entity('identity').to(['read', 'write', 'delete'])],
  }),
});
