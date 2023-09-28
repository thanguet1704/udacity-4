import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'
import { getTodosForUser } from '../../logic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const todos = await getTodosForUser(userId)
    return {
      statusCode: 200,
      body: JSON.stringify(todos)
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
