import { expect } from 'chai'

import MetricsAdmin, { AdminSession } from '../src/admin'
import { Queue, TaskSorting } from '../src/models/task'
import { elevateUserSession, getDemoUserSession, getMetricsAdminInstance } from './utils/fixtures'

describe('Task', function () {
  let metricsAdminInstance: MetricsAdmin
  let adminSession: AdminSession

  before(async function () {
    metricsAdminInstance = getMetricsAdminInstance()
    const demoUserSession = await getDemoUserSession(metricsAdminInstance)
    adminSession = await elevateUserSession(metricsAdminInstance, demoUserSession)
  })

  after(function () {
    metricsAdminInstance?.dispose()
  })

  it('can get details', async function () {
    const details = await adminSession.getResqueDetails()

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
    const workers = await adminSession.getWorkers()

    expect(Array.isArray(workers)).to.equal(true)
  })

  it('can get queue', async function () {
    const tasks = await adminSession.getTasks({ queue: Queue.High })

    expect(Array.isArray(tasks)).to.equal(true)
    expect(tasks.meta.sort).to.equal(TaskSorting.ID)
  })

  it('can delete queued task', async function () {
    const tasks = await adminSession.getTasks({ queue: Queue.High })

    if (tasks.length > 0) {
      const task = tasks[0]
      await task.delete()
      const newTasks = await adminSession.getTasks({ queue: Queue.High })
      expect(newTasks.filter(t => t.taskName === task.taskName && t.args[0] === task.args[0]).length).to.equal(0)
    } else {
      this.skip()
    }
  })

  it('can get failed', async function () {
    const failed = await adminSession.getFailedTasks()

    expect(Array.isArray(failed)).to.equal(true)
    expect(failed.meta.sort).to.equal(TaskSorting.ID)
  })

  it('can delete failed task', async function () {
    const failures = await adminSession.getFailedTasks()

    if (failures.length > 0) {
      const task = failures[0]
      await task.delete()
      const newFailures = await adminSession.getFailedTasks()
      expect(newFailures.filter(t => t.taskName === task.taskName && t.args[0] === task.args[0]).length).to.equal(0)
    } else {
      this.skip()
    }
  })

  it('can retry failed task', async function () {
    const failures = await adminSession.getFailedTasks()

    if (failures.length > 0) {
      const task = failures[0]
      await task.retry()
      const newFailures = await adminSession.getFailedTasks()
      expect(newFailures.filter(t => t.taskName === task.taskName && t.args[0] === task.args[0]).length).to.equal(0)
    } else {
      this.skip()
    }
  })

  it('can retry all failed task', async function () {
    await adminSession.retryAllFailedTasks()

    const failures = await adminSession.getFailedTasks()
    expect(failures.length).to.equal(0)
  })

  it('can delete all failed task', async function () {
    await adminSession.deleteAllFailedTasks()

    const failures = await adminSession.getFailedTasks()
    expect(failures.length).to.equal(0)
  })
})
