/* eslint- @typescript-eslint/explicit-module-boundary-types */
import { createJSDocBlockText } from '@kubb/core'
import type { Resolver } from '@kubb/swagger'
import { OasBuilder, getComments, isReference } from '@kubb/swagger'

import type { Operation, OperationSchemas } from '@kubb/swagger'
import { getParams } from '@kubb/swagger'
import { FormGenerator } from '../generators/FormGenerator'
import type { PluginContext } from '@kubb/core'
import { camelCase } from 'change-case'
import type { FormKeyword } from '../parsers/index.ts'
import { renderTemplate } from '@kubb/core'

type Config = {
  operation: Operation
  schemas: OperationSchemas
  errors: Resolver[]
  name: string
  resolveName: PluginContext['resolveName']
  withDevtools?: boolean
  mapper?: Record<FormKeyword, string>
}

type FormResult = { source: string; name: string }

export class FormBuilder extends OasBuilder<Config> {
  private get mutation(): FormResult {
    const { name, operation, schemas, resolveName, withDevtools, mapper } = this.config

    if (!schemas.request?.name) {
      return { name, source: '' }
    }

    const operationId = camelCase(operation.getOperationId())
    const pathParamsTyped = getParams(schemas.pathParams, { typed: true })
    const comments = getComments(operation)

    const options = [
      pathParamsTyped,
      schemas.queryParams?.name ? `params${!schemas.queryParams.schema.required?.length ? '?' : ''}: ${schemas.queryParams.name}` : '',
    ].filter(Boolean)

    const formGenerator = new FormGenerator({
      resolveName,
      withJSDocs: true,
      mapper,
    })
    const fields = formGenerator.build({
      schema: schemas.request.schema,
      /**
       * In case of type is like `type UploadFileMutationRequest = string;`, then it should use the operationId as naming.
       * Same for `FieldValues`
       */
      baseName: schemas.request.schema.type === 'object' ? undefined : operationId,
      description: schemas.request.description,
    })

    const properties = schemas.request?.schema?.properties || {}

    const defaultValues = Object.keys(properties)
      .map((key) => {
        const schema = properties[key as keyof typeof properties]

        if (isReference(schema)) {
          return undefined
        }

        if (schema.type === 'string') {
          return `"${key}": ${schema.default ? `"${schema.default as string}"` : 'undefined'}`
        }
      })
      .filter(Boolean)

    const form = renderTemplate(
      `
      <form
        onSubmit={handleSubmit((data) => {
          onSubmit?.(data)
        })}
      >
        {{fields}}
        <input type="submit" />
      </form>
    `,
      { fields: fields.join('\n') }
    )

    const source = `
    ${createJSDocBlockText({ comments })}

    type FieldValues = ${schemas.request.schema.type === 'object' ? schemas.request.name : `{ ${operationId}?: ${schemas.request.name} }`};

    type Props = {
      onSubmit?: (data: FieldValues) => Promise<${schemas.response.name}> | void; 
      ${options.join(';\n')}
    };

    export function ${name}(props: Props): React.ReactNode {
      const { onSubmit } = props;

      const {
        control,
        register,
        handleSubmit,
        formState: { errors }
      } = useForm<FieldValues>({
        defaultValues: {
          ${defaultValues.join(',\n')}
        }
      });

      return (
        <>
          ${form}
          
          ${withDevtools ? `<DevTool id="${operation.getOperationId()}" control={control} styles={{ button: { position: 'relative' } }} />` : ''}
        </>
      );
    };
  `

    return { source, name }
  }

  configure(config: Config): this {
    this.config = config

    return this
  }

  print(): string {
    const codes: string[] = []

    const { source: mutation } = this.mutation

    codes.push(mutation)

    return codes.join('\n')
  }
}
