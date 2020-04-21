import { AuthenticatedResponse, SessionHandler } from '../session'
import { Model } from '../model'

export enum Queue {
  High= 'high',
  Low = 'low'
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
  length: number
  tasks: TaskPayload[]
}

export interface TaskFailedResponse extends AuthenticatedResponse {
  length: number
  tasks: TaskFailure[]
}

export class Tasks extends Model {
  async getDetails () {
    const { details } = await this.action('resque:details') as ResqueDetailsResponse
    return details
  }

  async getWorkers () {
    const { workers } = await this.action('resque:worker:list') as WorkersResponse
    return Object.keys(workers).map(key => ({ worker: key, status: workers[key] }))
  }

  async getQueue (options: {queue: Queue, offset?: number, limit?: number}) {
    const { length, tasks } = await this.action('resque:task:queue', options) as TaskQueueResponse
    return { length, tasks: tasks.map(task => new Task(task, this.sessionHandler)) }
  }

  async getFailed (options: {offset?: number, limit?: number} = {}) {
    const { length, tasks } = await this.action('resque:task:failures', options) as TaskFailedResponse
    return { length, tasks: tasks.map(task => new FailedTask(task, this.sessionHandler)) }
  }

  async retryAllFailed (options: {taskName?: string} = {}) {
    await this.action('resque:task:retryAllFailed', options)
  }

  async deleteAllFailed (options: {taskName?: string} = {}) {
    await this.action('resque:task:deleteAllFailed', options)
  }
}

export class Task extends Model {
  private _taskPayload: TaskPayload

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

export class FailedTask extends Model {
  private _taskFailure: TaskFailure

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
