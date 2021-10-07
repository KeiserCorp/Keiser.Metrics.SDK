import { expect } from 'chai'

import { IsBrowser } from './utils/constants'
import TestWorker from './worker/test.worker'

enum TestActions {
  CHECK_LOAD = 'checkLoad',
  CHECK_SOCKET = 'checkSocket',
  RUN_TEST = 'runTest'
}

describe.only('Worker', function () {
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
    expect(false).to.equal(true)
  })
})
