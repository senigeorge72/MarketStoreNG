import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
const config = outputs as { auth?: { user_pool_id?: string }; data?: { url?: string } };
export const isAmplifyConfigured = Boolean(config.auth?.user_pool_id && config.data?.url);
if (isAmplifyConfigured) Amplify.configure(outputs);
