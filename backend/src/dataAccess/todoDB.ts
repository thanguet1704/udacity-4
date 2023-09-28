import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../utils/logger'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todoAccess')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todo items')

    try {
      const result = await this.docClient
        .query({
          TableName: this.todosTable,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()
      return result.Items as TodoItem[]
    } catch (error) {
      console.log('get todo error', error.message)
    }
  }

  async createTodo(newTodo: TodoItem): Promise<TodoItem> {
    try {
      logger.info(`Creating new todo item: ${newTodo.todoId}`)
      await this.docClient
        .put({
          TableName: this.todosTable,
          Item: newTodo
        })
        .promise()
      logger.info(`New todo item created: ${newTodo.todoId}`)

      return newTodo
    } catch (error) {
      logger.error(`Failed to create todo item: ${newTodo.todoId}`)
    }
  }

  async updateTodo(
    userId: string,
    todoId: string,
    data: TodoUpdate
  ): Promise<void> {
    logger.info(`Updating a todo item: ${todoId}`)
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
        ExpressionAttributeNames: { '#n': 'name' },
        ExpressionAttributeValues: {
          ':n': data.name,
          ':due': data.dueDate,
          ':dn': data.done
        }
      })
      .promise()
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise()
  }

  async saveImgUrl(
    userId: string,
    todoId: string,
    bucket: string
  ): Promise<void> {
    try {
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: { userId, todoId },
          ConditionExpression: 'attribute_exists(todoId)',
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': `https://${bucket}.s3.amazonaws.com/${todoId}`
          }
        })
        .promise()
      logger.info(
        `Updating image url for a todo item: https://${bucket}.s3.amazonaws.com/${todoId}`
      )
    } catch (error) {
      logger.error(error)
    }
  }
}
