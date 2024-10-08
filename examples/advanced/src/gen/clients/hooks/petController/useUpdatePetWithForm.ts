import client from '../../../../tanstack-query-client.ts'
import type { RequestConfig } from '../../../../tanstack-query-client.ts'
import type {
  UpdatePetWithFormMutationResponse,
  UpdatePetWithFormPathParams,
  UpdatePetWithFormQueryParams,
  UpdatePetWithForm405,
} from '../../../models/ts/petController/UpdatePetWithForm.ts'
import type { UseMutationOptions } from '@tanstack/react-query'
import { updatePetWithFormMutationResponseSchema } from '../../../zod/petController/updatePetWithFormSchema.ts'
import { useMutation } from '@tanstack/react-query'

/**
 * @summary Updates a pet in the store with form data
 * @link /pet/:petId
 */
async function updatePetWithForm(petId: UpdatePetWithFormPathParams['petId'], params?: UpdatePetWithFormQueryParams, config: Partial<RequestConfig> = {}) {
  const res = await client<UpdatePetWithFormMutationResponse, UpdatePetWithForm405, unknown>({
    method: 'POST',
    url: `/pet/${petId}`,
    baseURL: 'https://petstore3.swagger.io/api/v3',
    params,
    ...config,
  })
  return updatePetWithFormMutationResponseSchema.parse(res.data)
}

/**
 * @summary Updates a pet in the store with form data
 * @link /pet/:petId
 */
export function useUpdatePetWithForm(
  options: {
    mutation?: UseMutationOptions<
      UpdatePetWithFormMutationResponse,
      UpdatePetWithForm405,
      {
        petId: UpdatePetWithFormPathParams['petId']
        params?: UpdatePetWithFormQueryParams
      }
    >
    client?: Partial<RequestConfig>
  } = {},
) {
  const { mutation: mutationOptions, client: config = {} } = options ?? {}
  return useMutation({
    mutationFn: async ({
      petId,
      params,
    }: {
      petId: UpdatePetWithFormPathParams['petId']
      params?: UpdatePetWithFormQueryParams
    }) => {
      return updatePetWithForm(petId, params, config)
    },
    ...mutationOptions,
  })
}
