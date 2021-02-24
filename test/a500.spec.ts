import { expect } from 'chai'

import Metrics from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { MachineSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('A500', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let machineSession: MachineSession
  let userSession: UserSession
  const a500Machine = {
    machineModel: 1399,
    firmwareVersion: '00000000',
    softwareVersion: '00000000',
    mainBoardSerial: '1234 5678 9012 3456 7890',
    displayUUID: '1234567890123456',
    leftCylinderSerial: '01234567',
    rightCylinderSerial: '23456789'
  }
  const newUserEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  const newUserMemberId = [...Array(8)].map(i => (~~(Math.random() * 10)).toString()).join('')

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    const tmpFacility = facilities[0]?.eagerFacility()
    if (typeof tmpFacility !== 'undefined') {
      facility = tmpFacility
      await facility.setActive()
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can register machine with facility', async function () {
    const facilityConfiguration = await facility.getA500Qr()
    machineSession = await metricsInstance.authenticateWithA500MachineToken({ ...a500Machine, authorization: facilityConfiguration.accessToken })

    expect(typeof machineSession).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler.accessToken).to.equal('string')
  })

  it('can use machine session to login user', async function () {
    const facilityRelationship = await facility.createFacilityMemberUser({ email: newUserEmailAddress, name: 'Archie Richards', memberIdentifier: newUserMemberId })
    userSession = await machineSession.userLogin({ memberIdentifier: facilityRelationship.memberIdentifier })

    expect(typeof userSession).to.not.equal('undefined')
    expect(typeof userSession.user).to.not.equal('undefined')
    expect(userSession.user.id).to.equal(facilityRelationship.userId)
  })

  it('can create A500 utilization instance', async function () {
    const response = await machineSession.createA500Utilization({ takenAt: new Date(), repetitionCount: 15 })
    expect(typeof response).to.equal('undefined')
  })

  it('can create A500 data set', async function () {
    const response = await machineSession.createA500Set({
      userSession: userSession,
      setData: JSON.stringify({
        startedAt: '2020-01-27T18:58:57.000Z',
        endedAt: '2020-01-27T19:03:41.358Z',
        type: 'test',
        testSide: 'both',
        sampleData: [],
        repData: [
          {
            side: 'right',
            count: 1,
            work: 433,
            completedAt: '2020-01-27T19:01:16.000Z',
            reactionTime: 65367,
            peakPower: 215.58,
            averagePower: 150.37,
            peakVelocity: 3.15393,
            averageVelocity: 2.42709,
            peakForce: 70.065,
            averageForce: 61.33,
            rangeOfMotion: 0.782532,
            setPointForce: 12.5,
            forceUnit: 'lb',
            startSinceEpoch: 1886,
            endSinceEpoch: 1912,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 1,
            work: 436,
            completedAt: '2020-01-27T19:01:16.000Z',
            reactionTime: 65367,
            peakPower: 210.6,
            averagePower: 144.98,
            peakVelocity: 3.06182,
            averageVelocity: 2.27827,
            peakForce: 70.735,
            averageForce: 63.151,
            rangeOfMotion: 0.77325,
            setPointForce: 12.5,
            forceUnit: 'lb',
            startSinceEpoch: 1885,
            endSinceEpoch: 1912,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 2,
            work: 579,
            completedAt: '2020-01-27T19:01:23.000Z',
            reactionTime: 89,
            peakPower: 266.08,
            averagePower: 181.14,
            peakVelocity: 2.78722,
            averageVelocity: 2.05378,
            peakForce: 98.115,
            averageForce: 87.144,
            rangeOfMotion: 0.73721,
            setPointForce: 20,
            forceUnit: 'lb',
            startSinceEpoch: 2643,
            endSinceEpoch: 2672,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 2,
            work: 568,
            completedAt: '2020-01-27T19:01:24.000Z',
            reactionTime: 89,
            peakPower: 255.04,
            averagePower: 180.95,
            peakVelocity: 2.66686,
            averageVelocity: 1.98695,
            peakForce: 98.967,
            averageForce: 90.694,
            rangeOfMotion: 0.706012,
            setPointForce: 20,
            forceUnit: 'lb',
            startSinceEpoch: 2643,
            endSinceEpoch: 2671,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 3,
            work: 786,
            completedAt: '2020-01-27T19:01:32.000Z',
            reactionTime: 85,
            peakPower: 328.8,
            averagePower: 244.54,
            peakVelocity: 2.76271,
            averageVelocity: 2.13785,
            peakForce: 128.472,
            averageForce: 115.071,
            rangeOfMotion: 0.77139,
            setPointForce: 27.5,
            forceUnit: 'lb',
            startSinceEpoch: 3499,
            endSinceEpoch: 3528,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 3,
            work: 758,
            completedAt: '2020-01-27T19:01:32.000Z',
            reactionTime: 85,
            peakPower: 305.16,
            averagePower: 227.52,
            peakVelocity: 2.53487,
            averageVelocity: 1.92972,
            peakForce: 129.836,
            averageForce: 118.599,
            rangeOfMotion: 0.72519,
            setPointForce: 27.5,
            forceUnit: 'lb',
            startSinceEpoch: 3499,
            endSinceEpoch: 3529,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 4,
            work: 966,
            completedAt: '2020-01-27T19:01:40.000Z',
            reactionTime: 81,
            peakPower: 375.06,
            averagePower: 282.53,
            peakVelocity: 2.62135,
            averageVelocity: 2.02083,
            peakForce: 159.804,
            averageForce: 140.842,
            rangeOfMotion: 0.770322,
            setPointForce: 35,
            forceUnit: 'lb',
            startSinceEpoch: 4335,
            endSinceEpoch: 4366,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 4,
            work: 936,
            completedAt: '2020-01-27T19:01:40.000Z',
            reactionTime: 81,
            peakPower: 352.13,
            averagePower: 265.27,
            peakVelocity: 2.39895,
            averageVelocity: 1.83652,
            peakForce: 162.551,
            averageForce: 145.633,
            rangeOfMotion: 0.72714,
            setPointForce: 35,
            forceUnit: 'lb',
            startSinceEpoch: 4335,
            endSinceEpoch: 4367,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 5,
            work: 1166,
            completedAt: '2020-01-27T19:01:52.000Z',
            reactionTime: 85,
            peakPower: 432.88,
            averagePower: 329.12,
            peakVelocity: 2.5489,
            averageVelocity: 1.9804,
            peakForce: 193.369,
            averageForce: 168.628,
            rangeOfMotion: 0.784759,
            setPointForce: 42.5,
            forceUnit: 'lb',
            startSinceEpoch: 5479,
            endSinceEpoch: 5511,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 5,
            work: 1111,
            completedAt: '2020-01-27T19:01:52.000Z',
            reactionTime: 84,
            peakPower: 393.2,
            averagePower: 302.87,
            peakVelocity: 2.2505,
            averageVelocity: 1.75488,
            peakForce: 196.794,
            averageForce: 174.247,
            rangeOfMotion: 0.724797,
            setPointForce: 42.5,
            forceUnit: 'lb',
            startSinceEpoch: 5479,
            endSinceEpoch: 5512,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 6,
            work: 1352,
            completedAt: '2020-01-27T19:02:07.000Z',
            reactionTime: 85,
            peakPower: 478.08,
            averagePower: 368.61,
            peakVelocity: 2.42154,
            averageVelocity: 1.91869,
            peakForce: 226.989,
            averageForce: 194.657,
            rangeOfMotion: 0.785298,
            setPointForce: 50,
            forceUnit: 'lb',
            startSinceEpoch: 7020,
            endSinceEpoch: 7053,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 6,
            work: 1301,
            completedAt: '2020-01-27T19:02:07.000Z',
            reactionTime: 85,
            peakPower: 427.43,
            averagePower: 333.9,
            peakVelocity: 2.12787,
            averageVelocity: 1.67977,
            peakForce: 230.959,
            averageForce: 200.48,
            rangeOfMotion: 0.734708,
            setPointForce: 50,
            forceUnit: 'lb',
            startSinceEpoch: 7020,
            endSinceEpoch: 7055,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 7,
            work: 1485,
            completedAt: '2020-01-27T19:02:28.000Z',
            reactionTime: 78,
            peakPower: 485.13,
            averagePower: 363.78,
            peakVelocity: 2.12631,
            averageVelocity: 1.6515,
            peakForce: 260.669,
            averageForce: 220.959,
            rangeOfMotion: 0.753311,
            setPointForce: 57.5,
            forceUnit: 'lb',
            startSinceEpoch: 9053,
            endSinceEpoch: 9090,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 7,
            work: 1454,
            completedAt: '2020-01-27T19:02:28.000Z',
            reactionTime: 78,
            peakPower: 440.24,
            averagePower: 343.64,
            peakVelocity: 1.9077,
            averageVelocity: 1.51144,
            peakForce: 265.357,
            averageForce: 228.378,
            rangeOfMotion: 0.720562,
            setPointForce: 57.5,
            forceUnit: 'lb',
            startSinceEpoch: 9053,
            endSinceEpoch: 9091,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 8,
            work: 1639,
            completedAt: '2020-01-27T19:02:56.000Z',
            reactionTime: 87,
            peakPower: 495.64,
            averagePower: 366.81,
            peakVelocity: 1.9208,
            averageVelocity: 1.47991,
            peakForce: 293.759,
            averageForce: 247.392,
            rangeOfMotion: 0.74102,
            setPointForce: 65,
            forceUnit: 'lb',
            startSinceEpoch: 11902,
            endSinceEpoch: 11942,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 8,
            work: 1603,
            completedAt: '2020-01-27T19:02:56.000Z',
            reactionTime: 86,
            peakPower: 457.01,
            averagePower: 339.91,
            peakVelocity: 1.74413,
            averageVelocity: 1.33124,
            peakForce: 299.683,
            averageForce: 255.726,
            rangeOfMotion: 0.707271,
            setPointForce: 65,
            forceUnit: 'lb',
            startSinceEpoch: 11901,
            endSinceEpoch: 11944,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 9,
            work: 1884,
            completedAt: '2020-01-27T19:03:36.000Z',
            reactionTime: 16,
            peakPower: 451.19,
            averagePower: 349.02,
            peakVelocity: 1.52183,
            averageVelocity: 1.30883,
            peakForce: 326.517,
            averageForce: 267.447,
            rangeOfMotion: 0.785166,
            setPointForce: 72.5,
            forceUnit: 'lb',
            startSinceEpoch: 15892,
            endSinceEpoch: 15941,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 9,
            work: 1814,
            completedAt: '2020-01-27T19:03:36.000Z',
            reactionTime: 16,
            peakPower: 406.06,
            averagePower: 318.68,
            peakVelocity: 1.31845,
            averageVelocity: 1.14255,
            peakForce: 333.635,
            averageForce: 278.692,
            rangeOfMotion: 0.730726,
            setPointForce: 72.5,
            forceUnit: 'lb',
            startSinceEpoch: 15890,
            endSinceEpoch: 15942,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 10,
            work: 2044,
            completedAt: '2020-01-27T19:04:17.000Z',
            reactionTime: 99,
            peakPower: 455.78,
            averagePower: 304.94,
            peakVelocity: 1.38659,
            averageVelocity: 1.03775,
            peakForce: 360.624,
            averageForce: 287.289,
            rangeOfMotion: 0.775881,
            setPointForce: 80,
            forceUnit: 'lb',
            startSinceEpoch: 19974,
            endSinceEpoch: 20035,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 10,
            work: 1965,
            completedAt: '2020-01-27T19:04:17.000Z',
            reactionTime: 98,
            peakPower: 421.33,
            averagePower: 290.76,
            peakVelocity: 1.26674,
            averageVelocity: 0.94743,
            peakForce: 366.905,
            averageForce: 301.323,
            rangeOfMotion: 0.719759,
            setPointForce: 80,
            forceUnit: 'lb',
            startSinceEpoch: 19974,
            endSinceEpoch: 20035,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 11,
            work: 2169,
            completedAt: '2020-01-27T19:04:58.000Z',
            reactionTime: 84,
            peakPower: 460.11,
            averagePower: 298.92,
            peakVelocity: 1.26305,
            averageVelocity: 0.92246,
            peakForce: 394.203,
            averageForce: 317.727,
            rangeOfMotion: 0.749438,
            setPointForce: 87.5,
            forceUnit: 'lb',
            startSinceEpoch: 24049,
            endSinceEpoch: 24115,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 11,
            work: 2111,
            completedAt: '2020-01-27T19:04:58.000Z',
            reactionTime: 83,
            peakPower: 408.49,
            averagePower: 290.9,
            peakVelocity: 1.13269,
            averageVelocity: 0.86505,
            peakForce: 401.669,
            averageForce: 332.341,
            rangeOfMotion: 0.708756,
            setPointForce: 87.5,
            forceUnit: 'lb',
            startSinceEpoch: 24048,
            endSinceEpoch: 24114,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'right',
            count: 12,
            work: 2258,
            completedAt: '2020-01-27T19:05:39.000Z',
            reactionTime: 84,
            peakPower: 406.5,
            averagePower: 230.35,
            peakVelocity: 1.01792,
            averageVelocity: 0.65157,
            peakForce: 426.479,
            averageForce: 341.346,
            rangeOfMotion: 0.716352,
            setPointForce: 95,
            forceUnit: 'lb',
            startSinceEpoch: 28130,
            endSinceEpoch: 28219,
            addedMass: 0,
            addedForce: 0
          },
          {
            side: 'left',
            count: 12,
            work: 2150,
            completedAt: '2020-01-27T19:05:39.000Z',
            reactionTime: 83,
            peakPower: 380.46,
            averagePower: 223.35,
            peakVelocity: 0.93307,
            averageVelocity: 0.60524,
            peakForce: 434.863,
            averageForce: 358.6,
            rangeOfMotion: 0.661015,
            setPointForce: 95,
            forceUnit: 'lb',
            startSinceEpoch: 28129,
            endSinceEpoch: 28216,
            addedMass: 0,
            addedForce: 0
          }
        ]
      }
      )
    })
    expect(typeof response).to.not.equal('undefined')
    expect(response.id).to.not.equal(0)
  })
})
