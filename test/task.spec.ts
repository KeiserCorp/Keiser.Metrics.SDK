import { expect } from 'chai'

import { MetricsAdmin } from '../src'
import { Queue, TaskSorting } from '../src/models/task'
import { AdminSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AdminUser } from './persistent/user'

describe('Task', function () {
  let metricsInstance: MetricsAdmin
  let session: AdminSession

  before(async function () {
    metricsInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    session = await AdminUser(metricsInstance)
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get details', async function () {
    const details = await session.getResqueDetails()

    expect(typeof details).to.equal('object')
    expect(typeof details.queues).to.equal('object')
    expect(typeof details.queues.high).to.equal('object')
    expect(typeof details.queues.high.length).to.equal('number')
    expect(typeof details.queues.low).to.equal('object')
    expect(typeof details.queues.low.length).to.equal('number')
    expect(typeof details.stats).to.equal('object')
    expect(typeof details.stats.processed).to.equal('string')
  })

  it('can get workers', async function () {
    const workers = await session.getWorkers()

    expect(Array.isArray(workers)).to.equal(true)
  })

  it('can get queue', async function () {
    const tasks = await session.getTasks({ queue: Queue.High })

    expect(Array.isArray(tasks)).to.equal(true)
    expect(tasks.meta.sort).to.equal(TaskSorting.ID)
  })

  it('can delete queued task', async function () {
    const tasks = await session.getTasks({ queue: Queue.High })

    if (tasks.length > 0) {
      const task = tasks[0]
      await task.delete()
      const newTasks = await session.getTasks({ queue: Queue.High })
      expect(newTasks.filter(t => t.taskName === task.taskName && t.args[0] === task.args[0]).length).to.equal(0)
    } else {
      this.skip()
    }
  })

  it('can get failed', async function () {
    const failed = await session.getFailedTasks()

    expect(Array.isArray(failed)).to.equal(true)
    expect(failed.meta.sort).to.equal(TaskSorting.ID)
  })

  it('can delete failed task', async function () {
    const failures = await session.getFailedTasks()

    if (failures.length > 0) {
      const task = failures[0]
      await task.delete()
      const newFailures = await session.getFailedTasks()
      expect(newFailures.filter(t => t.taskName === task.taskName && t.args[0] === task.args[0]).length).to.equal(0)
    } else {
      this.skip()
    }
  })

  it('can retry failed task', async function () {
    const failures = await session.getFailedTasks()

    if (failures.length > 0) {
      const task = failures[0]
      await task.retry()
      const newFailures = await session.getFailedTasks()
      expect(newFailures.filter(t => t.taskName === task.taskName && t.args[0] === task.args[0]).length).to.equal(0)
    } else {
      this.skip()
    }
  })

  it('can retry all failed task', async function () {
    await session.retryAllFailedTasks()

    const failures = await session.getFailedTasks()
    expect(failures.length).to.equal(0)
  })

  it('can delete all failed task', async function () {
    await session.deleteAllFailedTasks()

    const failures = await session.getFailedTasks()
    expect(failures.length).to.equal(0)
  })
})
