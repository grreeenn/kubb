import client from '../../../../axios-client.ts'
import type { ResponseConfig } from '../../../../axios-client.ts'
import type { GetUserByNamePathParams, GetUserByNameQueryResponse } from '../../../models/ts/userController/GetUserByName'

/**
 * @summary Get user by user name
 * @link /user/:username
 */
export async function getUserByName<TData = GetUserByNameQueryResponse>(
  { username }: GetUserByNamePathParams,
  options: Partial<Parameters<typeof client>[0]> = {},
): Promise<ResponseConfig<TData>> {
  return client<TData>({
    method: 'get',
    url: `/user/${username}`,
    ...options,
  })
}
