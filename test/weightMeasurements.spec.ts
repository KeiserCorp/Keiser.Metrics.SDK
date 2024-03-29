import { expect } from 'chai'

import Metrics from '../src/core'
import { User } from '../src/models/user'
import { WeightMeasurement, WeightMeasurementSorting } from '../src/models/weightMeasurement'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('Weight Measurement', function () {
  let metricsInstance: Metrics
  let user: User
  let createdWeightMeasurement: WeightMeasurement

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
  })

  it('has weight measurements on first load', async function () {
    const weightMeasurements = user.eagerWeightMeasurements()
    expect(Array.isArray(weightMeasurements)).to.equal(true)
    if (Array.isArray(weightMeasurements)) {
      expect(weightMeasurements.length).to.equal(1)
      expect(typeof weightMeasurements[0]).to.equal('object')
    }
  })

  it('can get list of weight measurement', async function () {
    const weightMeasurements = await user.getWeightMeasurements()

    expect(Array.isArray(weightMeasurements)).to.equal(true)
    expect(weightMeasurements.length).to.be.above(0)
    expect(weightMeasurements.meta.sort).to.equal(WeightMeasurementSorting.TakenAt)
  })

  it('can get list of weight measurement with parameters', async function () {
    const weightMeasurements = await user.getWeightMeasurements({ limit: 2 })

    expect(Array.isArray(weightMeasurements)).to.equal(true)
  })

  it('can create weight measurement', async function () {
    const weightMeasurement = await user.createWeightMeasurement({ source: 'test', takenAt: new Date(Date.now() + 5000), metricWeight: 80 })

    expect(typeof weightMeasurement).to.equal('object')
    expect(weightMeasurement.source).to.equal('test')
    expect(weightMeasurement.metricWeight).to.equal(80)
  })

  it('can get new latest weight measurement', async function () {
    const weightMeasurements = await user.getWeightMeasurements({ limit: 1 })

    expect(Array.isArray(weightMeasurements)).to.equal(true)
    expect(weightMeasurements.length).to.equal(1)
    expect(typeof weightMeasurements[0]).to.equal('object')
    expect(weightMeasurements[0].source).to.equal('test')
    expect(weightMeasurements[0].metricWeight).to.equal(80)

    createdWeightMeasurement = weightMeasurements[0]
  })

  it('can get specific weight measurement', async function () {
    const weightMeasurement = await user.getWeightMeasurement({ id: createdWeightMeasurement.id })

    expect(typeof weightMeasurement).to.equal('object')
    expect(weightMeasurement.source).to.equal('test')
    expect(weightMeasurement.id).to.equal(createdWeightMeasurement.id)
    expect(weightMeasurement.source).to.equal(createdWeightMeasurement.source)
    expect(weightMeasurement.metricWeight).to.equal(createdWeightMeasurement.metricWeight)
  })

  it('can reload new weight measurement', async function () {
    const weightMeasurement = await createdWeightMeasurement.reload()

    expect(typeof weightMeasurement).to.equal('object')
    expect(weightMeasurement.source).to.equal('test')
    expect(weightMeasurement.id).to.equal(createdWeightMeasurement.id)
    expect(weightMeasurement.source).to.equal(createdWeightMeasurement.source)
    expect(weightMeasurement.metricWeight).to.equal(createdWeightMeasurement.metricWeight)
  })

  it('can delete new weight measurement', async function () {
    await createdWeightMeasurement.delete()

    const weightMeasurements = await user.getWeightMeasurements({ limit: 1 })

    expect(weightMeasurements[0].id).to.not.equal(createdWeightMeasurement.id)
  })

  it('can create InBody weight measurement using CSV', async function () {
    const pad2 = (n: number) => n < 10 ? `0${n}` : n
    const date = new Date()
    const dateString = date.getFullYear().toString() + pad2(date.getMonth() + 1).toString() + pad2(date.getDate()).toString() + pad2(date.getHours()).toString() + pad2(date.getMinutes()).toString() + pad2(date.getSeconds()).toString()
    const csvString = `"1. Name", "2. ID", "3. Height", "4. Date of Birth", "5. Gender", "6. Age", "7. Mobile Number", "8. Phone Number", "9. Zip Code", "10. Address", "11. E-mail", "12. Date of Registration", "13. Memo", "14. Test Date / Time", "15. Weight", "16. Lower Limit (Weight Normal Range)", "17. Upper Limit (Weight Normal Range)", "18. TBW (Total Body Water)", "19. Lower Limit (TBW Normal Range)", "20. Upper Limit (TBW Normal Range)", "21. DLM (Dry Lean Mass)", "22. BFM (Body Fat Mass)", "23. Lower Limit (BFM Normal Range)", "24. Upper Limit (BFM Normal Range)", "25. LBM (Lean Body Mass)", "26. SMM (Skeletal Muscle Mass)", "27. Lower Limit (SMM Normal Range)", "28. Upper Limit (SMM Normal Range)", "29. BMI (Body Mass Index)", "30. Lower Limit (BMI Normal Range)", "31. Upper Limit (BMI Normal Range)", "32. PBF (Percent Body Fat)", "33. Lower Limit (PBF Normal Range)", "34. Upper Limit (PBF Normal Range)", "35. LBM of Right Arm", "36. LBM% of Right Arm", "37. LBM of Left Arm", "38. LBM% of Left Arm", "39. LBM of Trunk", "40. LBM% of Trunk", "41. LBM of Right Leg", "42. LBM% of Right Leg", "43. LBM of Left Leg", "44. LBM% of Left Leg", "45. BFM Control", "46. LBM Control", "47. BMR (Basal Metabolic Rate)", "48. 20kHz-RA Impedance", "49. 20kHz-LA Impedance", "50. 20kHz-TR Impedance", "51. 20kHz-RL Impedance", "52. 20kHz-LL Impedance", "53. 100kHz-RA Impedance", "54. 100kHz-LA Impedance", "55. 100kHz-TR Impedance", "56. 100kHz-RL Impedance", "57. 100kHz-LL Impedance", "58. InBody Type", "59. Local ID", "60. Medical History", "61. Group",
    "John Doe", "0928", "5ft. 10.0in.", "1980.01.01.", "M", "31.0", "5551113333", "-", "90703", "13850 Cerritos Corporate Dr Unit C", "johnd@email.com", "2014.10.14.", "-", "${dateString}", "87.5", "130.3", "176.4", "63.1", "86.2", "105.4", "21.8", "2.6", "18.5", "36.8", "84.9", "47.4", "65.7", "80.2", "12.6", "18.5", "25.0", "3.0", "10.0", "20.0", "8.62", "218.4", "8.38", "213.3", "63.1", "191.9", "23.17", "191.8", "22.73", "189.9", "20.3", "45.4", "1201", "245.5", "253.7", "23.1", "231.5", "235.4", "208.1", "218.1", "19.6", "196.3", "199.1", "120", "1", "-", "-",`
    const weightMeasurements = await user.createWeightMeasurementsFromInBodyCSV({ bodyCompCSV: csvString })

    expect(Array.isArray(weightMeasurements)).to.equal(true)
    const weightMeasurement = weightMeasurements[0]
    expect(typeof weightMeasurement).to.equal('object')
    expect(weightMeasurement.source).to.equal('inbody')
    expect(weightMeasurement.metricWeight).to.equal(87.5)

    await weightMeasurements[0].delete()
  })

  it('can subscribe to weight measurement changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const weightMeasurement = (await user.getWeightMeasurements({ limit: 1 }))[0]

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = weightMeasurement.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'delete' && e.id === weightMeasurement.id) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    await new Promise(resolve => setTimeout(() => resolve(null), 1000))
    await weightMeasurement.delete()

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.mutation).to.equal('delete')
    expect(modelChangeEvent.id).to.equal(weightMeasurement.id)
  })

  it('can subscribe to weight measurement list changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const weightMeasurements = await user.getWeightMeasurements({ limit: 1 })

    const modelListChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = weightMeasurements.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'create' && (weightMeasurements.length === 0 || e.id !== weightMeasurements[0].id)) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    const weightMeasurement = await user.createWeightMeasurement({ source: 'test', takenAt: new Date(Date.now() + 5000), metricWeight: 80 })

    const modelListChangeEvent = await modelListChangeEventPromise
    expect(modelListChangeEvent).to.be.an('object')
    expect(modelListChangeEvent.mutation).to.equal('create')
    expect(modelListChangeEvent.id).to.equal(weightMeasurement.id)
  })
})
