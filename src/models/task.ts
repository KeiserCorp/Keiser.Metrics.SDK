import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum Queue {
  High= 'high',
  Low = 'low'
}

export const enum TaskSorting {
  ID = 'id'
}

export interface TaskQueues {
  high: { length: number }
  low: { length: number }
}

export interface TaskStats {
  failed?: string
  processed?: string
}

export interface TaskWorkers {
  [key: string]: 'started' | TaskWorkerStatus
}

export interface TaskPayload {
  args: string[]
  class: string
  queue: Queue
}

export interface TaskWorkerStatus {
  payload: TaskPayload
  queue: Queue
  run_at: string
  worker: string
}

export interface TaskFailure {
  backtrace: string[]
  error: string
  exception: string
  failed_at: string
  payload: TaskPayload
  queue: Queue
  worker: string
}

export interface ResqueDetailsResponse extends AuthenticatedResponse {
  details: {
    queues: TaskQueues
    stats: TaskStats
    workers: TaskWorkers
  }
}

export interface WorkersResponse extends AuthenticatedResponse {
  workers: TaskWorkers
}

export interface TaskQueueResponse extends AuthenticatedResponse {
  tasks: TaskPayload[]
  tasksMeta: TaskQueueResponseMeta
}

export interface TaskQueueResponseMeta extends ListMeta {
  queue: string
  sort: TaskSorting
}

export interface TaskFailedResponse extends AuthenticatedResponse {
  tasks: TaskFailure[]
  tasksMeta: TaskQueueResponseMeta
}

export class Tasks extends ModelList<Task, TaskPayload, TaskQueueResponseMeta> {
  constructor (tasks: TaskPayload[], tasksMeta: TaskQueueResponseMeta, sessionHandler: SessionHandler) {
    super(Task, tasks, tasksMeta, sessionHandler)
  }
}

export class Task extends Model {
  private readonly _taskPayload: TaskPayload

  constructor (taskPayload: TaskPayload, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._taskPayload = taskPayload
  }

  get queue () {
    return this._taskPayload.queue
  }

  get taskName () {
    return this._taskPayload.class
  }

  get args () {
    return this._taskPayload.args.map(s => s)
  }

  async delete () {
    await this.action('resque:task:deleteTask', { queue: this.queue, taskName: this.taskName, args: JSON.stringify(this.args) })
  }
}

export class FailedTasks extends ModelList<FailedTask, TaskFailure, TaskQueueResponseMeta> {
  constructor (tasks: TaskFailure[], tasksMeta: TaskQueueResponseMeta, sessionHandler: SessionHandler) {
    super(FailedTask, tasks, tasksMeta, sessionHandler)
  }
}

export class FailedTask extends Model {
  private readonly _taskFailure: TaskFailure

  constructor (taskFailure: TaskFailure, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._taskFailure = taskFailure
  }

  get error () {
    return this._taskFailure.error
  }

  get backtrace () {
    return this._taskFailure.backtrace.map(s => s.trim())
  }

  get exception () {
    return this._taskFailure.exception
  }

  get failedAt () {
    return new Date(this._taskFailure.failed_at)
  }

  get queue () {
    return this._taskFailure.queue
  }

  get taskName () {
    return this._taskFailure.payload.class
  }

  get args () {
    return this._taskFailure.payload.args.map(s => s)
  }

  async delete () {
    await this.action('resque:task:deleteFailed', { failedTask: JSON.stringify(this._taskFailure) })
  }

  async retry () {
    await this.action('resque:task:retryFailed', { failedTask: JSON.stringify(this._taskFailure) })
  }
}
