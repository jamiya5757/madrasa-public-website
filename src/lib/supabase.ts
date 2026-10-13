/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://igbbuuirqfxihnutluto.supabase.co';

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_ouxbSdkFIZ659Q738OoCJw_XVpvLBha';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
