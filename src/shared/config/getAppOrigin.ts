import 'server-only'

import { parseAppOrigin } from '@/shared/config/AppOrigin'

export function getAppOrigin() {
  return parseAppOrigin(process.env.APP_ORIGIN)
}
