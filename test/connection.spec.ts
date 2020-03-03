import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, IsBrowser } from './constants'
import Metrics from '../src'

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

        const result = await(new Promise(resolve => {
          metricsInstance.onConnectionChangeEvent.one(event => resolve(event.socketConnection))
        }))

        expect(result).to.equal(true)
        const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
        expect(typeof healthResponse.error).to.equal('undefined')
        expect(healthResponse.healthy).to.equal(true)
      })

      it('can make request to server before connection event', async function () {
        this.timeout(connectionTimeout)

        const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
        expect(typeof healthResponse.error).to.equal('undefined')
        expect(healthResponse.healthy).to.equal(true)
      })

    })

    describe('Socket (Prod Server)', function () {
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

        const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
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
      this.timeout(connectionTimeout + 100)

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

      const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
      expect(typeof healthResponse.error).to.equal('undefined')
      expect(healthResponse.healthy).to.equal(true)
    })

  })

  describe('REST (Prod Server)', function () {
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

      const healthResponse = await (metricsInstance.action('core:health') as Promise<{healthy: boolean, error?: any}>)
      expect(typeof healthResponse.error).to.equal('undefined')
      expect(healthResponse.healthy).to.equal(true)
    })

  })

})
