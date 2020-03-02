import { expect } from 'chai'
import Metrics from '../src'

const restEndpoint = 'http://localhost:8000/api'
const socketEndpoint = 'ws://localhost:8000/ws'

// let metrics = new Metrics({
//   restEndpoint: 'http://localhost:8000/api',
//   socketEndpoint: 'ws://localhost:8000/ws',
//   persistConnection: true
// })

// metrics.onConnectionChangeEvent.subscribe(s => console.log(s))

// console.log(metrics.socketConnected);

// (window as any).socketInfo = () => {
//   return {
//     socketStatus: metrics.socketConnected
//   }
// }

mocha.setup('bdd')
mocha.growl()

describe('Core', function () {
  // let validMetricsInstance: Metrics

  describe('Construction', function () {
    it('can create instance with properties', function () {
      let metricsInstance = new Metrics({
        restEndpoint,
        socketEndpoint
      })

      expect(metricsInstance).to.be.an('object')
      expect(metricsInstance.persistConnection).to.be.equal(true)
      metricsInstance.dispose()
    })

    it('can create instance with defaults', function () {
      let metricsInstance = new Metrics()

      expect(metricsInstance).to.be.an('object')
      expect(metricsInstance.persistConnection).to.be.equal(true)
      metricsInstance.dispose()
    })

    it('can create non-persistent connection instance', function () {
      let metricsInstance = new Metrics({
        restEndpoint,
        socketEndpoint,
        persistConnection: false
      })

      expect(metricsInstance).to.be.an('object')
      expect(metricsInstance.persistConnection).to.be.equal(false)
      metricsInstance.dispose()
    })
  })

  describe('Disposing', function () {
    it('can dispose instance', function () {
      let metricsInstance = new Metrics()
      expect(metricsInstance.persistConnection).to.be.equal(true)
      metricsInstance.dispose()
      expect(metricsInstance.persistConnection).to.be.equal(false)
    })
  })
})

mocha.run()
