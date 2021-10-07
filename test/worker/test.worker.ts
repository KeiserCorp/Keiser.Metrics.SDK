import { getMetricsInstance } from '../utils/fixtures'

const ctx: Worker = self as any

enum TestActions {
  CHECK_LOAD = 'checkLoad',
  CHECK_SOCKET = 'checkSocket',
  RUN_TEST = 'runTest'
}

ctx.addEventListener('message', (event) => {
  console.log(event)
  void processMessage(event.data as string)
})

const processMessage = async (message: string) => {
  if (message === TestActions.CHECK_LOAD) {
    ctx.postMessage({ type: TestActions.CHECK_LOAD, result: await checkLoad() })
  } else if (message === TestActions.CHECK_SOCKET) {
    ctx.postMessage({ type: TestActions.CHECK_SOCKET, result: await checkSocket() })
  } else if (message === TestActions.RUN_TEST) {
    ctx.postMessage({ type: TestActions.RUN_TEST, result: await runTest() })
  }
}

const checkLoad = async () => {
  try {
    const metricsInstance = getMetricsInstance()
    return typeof metricsInstance !== 'undefined'
  } catch {
    return false
  }
}

const checkSocket = async () => {
  try {
    const metricsInstance = getMetricsInstance()
    await metricsInstance.core.health()
    return metricsInstance.socketConnected
  } catch {
    return false
  }
}

const runTest = async () => {
  try {
    const metricsInstance = getMetricsInstance()
    const { healthy } = await metricsInstance.core.health()
    const status = await metricsInstance.core.status()
    return typeof healthy !== 'undefined' && typeof status !== 'undefined'
  } catch {
    return false
  }
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {} as typeof Worker & (new () => Worker)
