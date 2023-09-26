import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import 'source-map-support/register'
import { deleteTodo } from '../../businessLayer/todosBusinessLayer'
import { createLogger } from '../../utils/logger'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const logger = createLogger('auth')
  try {
    const message = await deleteTodo(event)
    logger.info('Deleted')
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message
      })
    }
  } catch (e) {
    logger.info('Delete failed: ' + e)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Something went wrong when delete todo list' + e.message
      })
    }
  }
}
