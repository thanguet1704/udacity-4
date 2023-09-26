import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import 'source-map-support/register'
import { createTodo } from '../../businessLayer/todosBusinessLayer'
import { createLogger } from '../../utils/logger'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const logger = createLogger('auth')
  try {
    const newTodo = await createTodo(event)
    logger.info('Created')
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: newTodo
      })
    }
  } catch (e) {
    logger.info('Created failed: ' + e)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Something went wrong when create Todo list' + e.message
      })
    }
  }
}
