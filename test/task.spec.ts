import { expect } from 'chai'
import { MetricsAdmin } from '../src'
import { Queue } from '../src/models/task'
import { AdminSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Task', function () {
  let metricsInstance: MetricsAdmin
  let session: AdminSession

  before(async function () {
    metricsInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    session = await metricsInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get details', async function () {
    const details = await session.tasks.getDetails()

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
    const workers = await session.tasks.getWorkers()

    expect(Array.isArray(workers)).to.equal(true)
  })

  it('can get queue', async function () {
    const queue = await session.tasks.getQueue({ queue: Queue.High })

    expect(typeof queue).to.equal('object')
    expect(typeof queue.length).to.equal('number')
    expect(Array.isArray(queue.tasks)).to.equal(true)
  })

  it('can delete queued task', async function () {
    const queue = await session.tasks.getQueue({ queue: Queue.High })

    if (queue.length > 0) {
      const task = queue.tasks[0]
      await task.delete()
      const newQueue = await session.tasks.getQueue({ queue: Queue.High })
      expect(newQueue.tasks.filter(t => t.taskName === task.taskName && t.args[0] === task.args[0]).length).to.equal(0)
    } else {
      this.skip()
    }
  })

  it('can get failed', async function () {
    const failed = await session.tasks.getFailed()

    expect(typeof failed).to.equal('object')
    expect(typeof failed.length).to.equal('number')
    expect(Array.isArray(failed.tasks)).to.equal(true)
  })

  it('can delete failed task', async function () {
    const failures = await session.tasks.getFailed()

    if (failures.length > 0) {
      const task = failures.tasks[0]
      await task.delete()
      const newFailures = await session.tasks.getFailed()
      expect(newFailures.tasks.filter(t => t.taskName === task.taskName && t.args[0] === task.args[0]).length).to.equal(0)
    } else {
      this.skip()
    }
  })

  it('can retry failed task', async function () {
    const failures = await session.tasks.getFailed()

    if (failures.length > 0) {
      const task = failures.tasks[0]
      await task.retry()
      const newFailures = await session.tasks.getFailed()
      expect(newFailures.tasks.filter(t => t.taskName === task.taskName && t.args[0] === task.args[0]).length).to.equal(0)
    } else {
      this.skip()
    }
  })

  it('can retry all failed task', async function () {
    await session.tasks.retryAllFailed()

    const failures = await session.tasks.getFailed()
    expect(failures.length).to.equal(0)
  })

  it('can delete all failed task', async function () {
    await session.tasks.deleteAllFailed()

    const failures = await session.tasks.getFailed()
    expect(failures.length).to.equal(0)
  })
})
