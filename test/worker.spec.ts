import { expect } from 'chai'

import { IsBrowser } from './utils/constants'
import TestWorker from './worker/test.worker'

enum TestActions {
  CHECK_LOAD = 'checkLoad',
  CHECK_SOCKET = 'checkSocket',
  RUN_TEST = 'runTest'
}

describe('Worker', function () {
  let worker: Worker

  before(async function () {
    if (!IsBrowser) {
      this.skip()
    }
    worker = new TestWorker()
  })

  it('can load worker', async function () {
    const responsePromise: Promise<{type: TestActions, result: boolean}> = new Promise(resolve => { worker.onmessage = (e) => resolve(e.data as {type: TestActions, result: boolean}) })

    worker.postMessage(TestActions.CHECK_LOAD)

    const response = await responsePromise
    expect(response.type).to.equal(TestActions.CHECK_LOAD)
    expect(response.result).to.equal(true)
  })

  it('can open socket in worker', async function () {
    const responsePromise: Promise<{type: TestActions, result: boolean}> = new Promise(resolve => { worker.onmessage = (e) => resolve(e.data as {type: TestActions, result: boolean}) })

    worker.postMessage(TestActions.CHECK_SOCKET)

    const response = await responsePromise
    expect(response.type).to.equal(TestActions.CHECK_SOCKET)
    expect(response.result).to.equal(true)
  })

  it('can perform actions on socket in worker', async function () {
    const responsePromise: Promise<{type: TestActions, result: boolean}> = new Promise(resolve => { worker.onmessage = (e) => resolve(e.data as {type: TestActions, result: boolean}) })

    worker.postMessage(TestActions.RUN_TEST)

    const response = await responsePromise
    expect(response.type).to.equal(TestActions.RUN_TEST)
    expect(response.result).to.equal(true)
  })
})
