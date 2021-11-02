import { expect } from 'chai'

import { ConnectionEvent } from '../src/connection'
import Metrics from '../src/core'
import { DevRestEndpoint, DevSocketEndpoint, IsBrowser } from './utils/constants'

const connectionTimeout = 3000

describe('Connection', function () {
  if (IsBrowser) {
    describe('Socket (Dev Server)', function () {
      let metricsInstance: Metrics

      beforeEach(function () {
        metricsInstance = new Metrics({
          restEndpoint: DevRestEndpoint,
          socketEndpoint: DevSocketEndpoint,
          persistConnection: true
        })
      })

      afterEach(function () {
        metricsInstance?.dispose()
      })

      it('can create a socket connection to server', async function () {
        this.timeout(connectionTimeout)

        expect(metricsInstance.persistConnection).to.be.equal(true)
        expect(metricsInstance.socketConnected).to.equal(false) // This doesn't have to work, just seeing if it ever fails

        const result = await (new Promise(resolve => {
          metricsInstance.onConnectionChangeEvent.one(event => {
            if (event.socketConnection) {
              resolve(true)
            }
          })
        }))

        expect(result).to.equal(true)
        expect(metricsInstance.socketConnected).to.equal(true)
      })

      it('ensures connection is closed after dispose', async function () {
        this.timeout(connectionTimeout)

        const openResult = await (new Promise(resolve => {
          metricsInstance.onConnectionChangeEvent.one(event => {
            if (event.socketConnection) {
              resolve(true)
            }
          })
        }))

        expect(openResult).to.equal(true)
        expect(metricsInstance.socketConnected).to.equal(true)

        const closedResultPromise = new Promise(resolve => {
          metricsInstance.onConnectionChangeEvent.one(event => {
            if (!event.socketConnection) {
              resolve(true)
            }
          })
        })

        metricsInstance.dispose()
        const closedResult = await closedResultPromise

        expect(closedResult).to.equal(true)
        expect(metricsInstance.socketConnected).to.equal(false)
      })

      it('can make request to server after connection event', async function () {
        this.timeout(connectionTimeout)

        const result = await (new Promise(resolve => {
          metricsInstance.onConnectionChangeEvent.one(event => resolve(event.socketConnection))
        }))

        expect(result).to.equal(true)
        const healthResponse = await (metricsInstance.action('core:health') as Promise<{ healthy: boolean, error?: any }>)
        expect(typeof healthResponse.error).to.equal('undefined')
        expect(healthResponse.healthy).to.equal(true)
      })

      it('can make request to server before connection event', async function () {
        this.timeout(connectionTimeout)

        const metricsInstance = new Metrics({
          restEndpoint: DevRestEndpoint,
          socketEndpoint: DevSocketEndpoint,
          persistConnection: true
        })

        const healthResponse = await (metricsInstance.action('core:health') as Promise<{ healthy: boolean, error?: any }>)
        expect(typeof healthResponse.error).to.equal('undefined')
        expect(healthResponse.healthy).to.equal(true)
        metricsInstance.dispose()
      })

      it.skip('can handle server restart', async function () {
        this.timeout(30000)

        const metricsInstance = new Metrics({
          restEndpoint: DevRestEndpoint,
          socketEndpoint: DevSocketEndpoint,
          persistConnection: true
        })

        if (!metricsInstance.socketConnected) {
          await (new Promise(resolve => {
            metricsInstance.onConnectionChangeEvent.one(event => resolve(event.socketConnection))
          }))
        }

        const socketDisconnectEventPromise: Promise<ConnectionEvent> = new Promise(resolve => {
          const unsubscribe = metricsInstance.onConnectionChangeEvent.subscribe(e => {
            if (!e.socketConnection) {
              unsubscribe()
              resolve(e)
            }
          })
        })

        const socketReconnectEventPromise: Promise<ConnectionEvent> = new Promise(resolve => {
          const unsubscribe = metricsInstance.onConnectionChangeEvent.subscribe(e => {
            if (e.socketConnection) {
              unsubscribe()
              resolve(e)
            }
          })
        })

        void metricsInstance.action('dev:serverRestart').catch(() => {})

        const socketDisconnectEvent = await socketDisconnectEventPromise
        expect(socketDisconnectEvent.socketConnection).to.equal(false)

        const socketReconnectEvent = await socketReconnectEventPromise
        expect(socketReconnectEvent.socketConnection).to.equal(true)

        const healthResponse = await (metricsInstance.action('core:health') as Promise<{ healthy: boolean, error?: any }>)
        expect(typeof healthResponse.error).to.equal('undefined')
        expect(healthResponse.healthy).to.equal(true)

        metricsInstance.dispose()
      })

      it.skip('can handle server connection close', async function () {
        this.timeout(10000)

        const metricsInstance = new Metrics({
          restEndpoint: DevRestEndpoint,
          socketEndpoint: DevSocketEndpoint,
          persistConnection: true
        })

        if (!metricsInstance.socketConnected) {
          await (new Promise(resolve => {
            metricsInstance.onConnectionChangeEvent.one(event => resolve(event.socketConnection))
          }))
        }

        const socketConnectionEventPromise: Promise<ConnectionEvent> = new Promise(resolve => {
          metricsInstance.onConnectionChangeEvent.one(event => resolve(event))
        })

        const socketReconnectEventPromise: Promise<ConnectionEvent> = new Promise(resolve => {
          const unsubscribe = metricsInstance.onConnectionChangeEvent.subscribe(e => {
            if (e.socketConnection) {
              unsubscribe()
              resolve(e)
            }
          })
        })

        void metricsInstance.action('dev:connectionClose').catch(() => {})

        const socketConnectionEvent = await socketConnectionEventPromise
        expect(socketConnectionEvent.socketConnection).to.equal(false)

        const socketReconnectEvent = await socketReconnectEventPromise
        expect(socketReconnectEvent.socketConnection).to.equal(true)

        const healthResponse = await (metricsInstance.action('core:health') as Promise<{ healthy: boolean, error?: any }>)
        expect(typeof healthResponse.error).to.equal('undefined')
        expect(healthResponse.healthy).to.equal(true)

        metricsInstance.dispose()
      })

      it('can perform 25 actions', async function () {
        this.timeout(20000)

        const metricsInstance = new Metrics({
          restEndpoint: DevRestEndpoint,
          socketEndpoint: DevSocketEndpoint,
          persistConnection: true
        })

        if (!metricsInstance.socketConnected) {
          await (new Promise(resolve => {
            metricsInstance.onConnectionChangeEvent.one(event => resolve(event.socketConnection))
          }))
        }

        const statusRequests = new Array<Promise<any>>()
        for (let x = 0; x < 25; x++) {
          statusRequests.push(metricsInstance.core.status())
        }

        const resolved = await Promise.all(statusRequests)
        expect(resolved.length).to.equal(25)
        metricsInstance.dispose()
      })

      it('cannot perform 50 actions', async function () {
        this.timeout(20000)

        const metricsInstance = new Metrics({
          restEndpoint: DevRestEndpoint,
          socketEndpoint: DevSocketEndpoint,
          persistConnection: true
        })

        if (!metricsInstance.socketConnected) {
          await (new Promise(resolve => {
            metricsInstance.onConnectionChangeEvent.one(event => resolve(event.socketConnection))
          }))
        }

        const statusRequests = new Array<Promise<any>>()
        for (let x = 0; x < 50; x++) {
          statusRequests.push(metricsInstance.core.status())
        }

        let extErrorRef: {error: {statusText: string}} | null = null

        try {
          await Promise.all(statusRequests)
        } catch (error) {
          extErrorRef = error as {error: {statusText: string}}
        }

        expect(extErrorRef).to.not.equal(null)
        if (extErrorRef !== null) {
          expect(extErrorRef.error.statusText).to.equal('Socket request queue is full.')
        }
        metricsInstance.dispose()
      })
    })

    describe.skip('Socket (Prod Server)', function () {
      let metricsInstance: Metrics

      beforeEach(function () {
        if (!IsBrowser) {
          this.skip()
        }

        metricsInstance = new Metrics({
          persistConnection: true
        })
      })

      afterEach(function () {
        metricsInstance?.dispose()
      })

      it('can create a socket connection to server', async function () {
        this.timeout(connectionTimeout)

        expect(metricsInstance.persistConnection).to.be.equal(true)
        expect(metricsInstance.socketConnected).to.equal(false) // This doesn't have to work, just seeing if it ever fails

        const result = await (new Promise(resolve => {
          metricsInstance.onConnectionChangeEvent.one(event => {
            if (event.socketConnection) {
              resolve(true)
            }
          })
        }))

        expect(result).to.equal(true)
        expect(metricsInstance.socketConnected).to.equal(true)
      })

      it('can make request to server', async function () {
        this.timeout(connectionTimeout)

        const healthResponse = await (metricsInstance.action('core:health') as Promise<{ healthy: boolean, error?: any }>)
        expect(typeof healthResponse.error).to.equal('undefined')
        expect(healthResponse.healthy).to.equal(true)
      })
    })
  }

  describe('REST (Dev Server)', function () {
    let metricsInstance: Metrics

    beforeEach(function () {
      metricsInstance = new Metrics({
        restEndpoint: DevRestEndpoint,
        socketEndpoint: DevSocketEndpoint,
        persistConnection: false
      })
    })

    afterEach(function () {
      metricsInstance.dispose()
    })

    it('does not automatically create a connection to server', async function () {
      this.timeout(connectionTimeout + 200)

      expect(metricsInstance.persistConnection).to.be.equal(false)
      expect(metricsInstance.socketConnected).to.equal(false)

      const result = await (new Promise(resolve => {
        metricsInstance.onConnectionChangeEvent.subscribe(event => {
          if (event.socketConnection) {
            resolve(true)
          }
        })

        setTimeout(() => resolve(false), connectionTimeout)
      }))

      expect(result).to.equal(false)
      expect(metricsInstance.socketConnected).to.equal(false)
    })

    it('can make request to server', async function () {
      this.timeout(connectionTimeout)

      const healthResponse = await (metricsInstance.action('core:health') as Promise<{ healthy: boolean, error?: any }>)
      expect(typeof healthResponse.error).to.equal('undefined')
      expect(healthResponse.healthy).to.equal(true)
    })
  })

  describe.skip('REST (Prod Server)', function () {
    let metricsInstance: Metrics

    beforeEach(function () {
      metricsInstance = new Metrics({
        persistConnection: false
      })
    })

    afterEach(function () {
      metricsInstance.dispose()
    })

    it('can make request to server', async function () {
      this.timeout(connectionTimeout)

      const healthResponse = await (metricsInstance.action('core:health') as Promise<{ healthy: boolean, error?: any }>)
      expect(typeof healthResponse.error).to.equal('undefined')
      expect(healthResponse.healthy).to.equal(true)
    })
  })
})
