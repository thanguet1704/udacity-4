import uuid from 'uuid'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoDataLayer } from '../dataLayer/todosDataLayer'
import { TodoItem, TodoItemDTO } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import * as utils from '../lambda/utils'

const todoDataLayer = new TodoDataLayer()
const logger = createLogger('todos')

export async function getAllTodos(event): Promise<TodoItem[]> {
  try {
    logger.info('getAllTodos start =>>>>', { event })

    const todoItemDTO: TodoItemDTO = {
      userId: utils.getUserId(event)
    }
    logger.info('getAllTodos succesfully <=====', { event })
    return todoDataLayer.getAllTodos(todoItemDTO)
  } catch (err) {
    logger.info('getAllTodos error', { err })
  }
}

export async function createTodo(event): Promise<TodoItem> {
  try {
    logger.info('createTodo start =>>>>', { event })

    const parsedTodo: CreateTodoRequest = JSON.parse(event.body)

    const todoItemTDO: TodoItemDTO = {
      userId: utils.getUserId(event),
      todoId: uuid.v4(),
      createdAt: new Date().toDateString(),
      name: parsedTodo.name,
      dueDate: parsedTodo.dueDate,
      done: false,
      attachmentUrl: ''
    }
    logger.info('createTodo succesfully <=====', { event })
    return todoDataLayer.createTodo(todoItemTDO)
  } catch (e) {
    logger.info('createTodo error', { e })
  }
}

export async function deleteTodo(event): Promise<String> {
  try {
    logger.info('deleteTodo start =>>>', { event })

    const todoItemTDO: TodoItemDTO = {
      userId: utils.getUserId(event),
      todoId: event.pathParameters.todoId
    }
    logger.info('deleteTodo succesfully <====', { event })
    return todoDataLayer.deleteTodo(todoItemTDO)
  } catch (e) {
    logger.error('deleteTodo error', { e })
  }
}

export async function updateTodo(event): Promise<String> {
  try {
    logger.info('updateTodo', { event })

    const todo: UpdateTodoRequest = JSON.parse(event.body)

    const todoItemTDO: TodoItemDTO = {
      userId: utils.getUserId(event),
      todoId: event.pathParameters.todoId,
      name: todo.name,
      dueDate: todo.dueDate,
      done: todo.done
    }
    logger.info('updateTodo successfully', { event })
    return todoDataLayer.updateTodo(todoItemTDO)
  } catch (e) {
    logger.error('updateTodo error', { e })
  }
}

export async function generateUploadUrl(event): Promise<String> {
  try {
    logger.info('generateUploadUrl', { event })

    const todoItemTDO: TodoItemDTO = {
      userId: utils.getUserId(event),
      todoId: event.pathParameters.todoId
    }
    logger.info('generateUploadUrl successfully', { event })
    return todoDataLayer.generateUploadUrl(todoItemTDO)
  } catch (e) {
    logger.error('generateUploadUrl error', { e })
  }
}
