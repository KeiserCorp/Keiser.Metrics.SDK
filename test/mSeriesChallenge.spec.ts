import { expect } from 'chai'

import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { JoinableMSeriesChallenge, JoinedMSeriesChallenge, JoinedMSeriesChallenges, MSeriesChallengeFocus, MSeriesChallengeSorting, MSeriesChallengeType, PrivilegedMSeriesChallenge, PrivilegedMSeriesChallenges } from '../src/models/mSeriesChallenge'
import { MSeriesChallengeParticipantSorting } from '../src/models/mSeriesChallengeParticipant'
import { User } from '../src/models/user'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('M Series Challenge', function () {
  let metricsInstance: Metrics
  let user: User, user2: User
  const user2EmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  let createdMSeriesChallenge: PrivilegedMSeriesChallenge
  let joinedMSeriesChallenge: JoinedMSeriesChallenge

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const userSession2 = await metricsInstance.createUser({ email: user2EmailAddress, password: DemoPassword })
    user = userSession.user
    user2 = userSession2.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can create new M Series Challenge', async function () {
    const mSeriesChallenge = await user.createMSeriesChallenge({
      userLimit: 25,
      name: 'SDK Test Challenge',
      challengeType: MSeriesChallengeType.GoalBased,
      focus: MSeriesChallengeFocus.Points,
      goal: 1000
    })

    expect(typeof mSeriesChallenge).to.equal('object')
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(user.id)
    expect(typeof mSeriesChallenge.joinCode).to.equal('string')
    createdMSeriesChallenge = mSeriesChallenge
  })

  it('can get owned M Series Challenge', async function () {
    const mSeriesChallenge = await user.getMSeriesChallenge({ id: createdMSeriesChallenge.id })

    expect(typeof mSeriesChallenge).to.equal('object')
    expect(mSeriesChallenge instanceof PrivilegedMSeriesChallenge).to.equal(true)
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(user.id)
    expect(typeof mSeriesChallenge.joinCode).to.equal('string')
  })

  it('can get M Series Challenge using joinCode that is neither owned nor joined', async function () {
    const mSeriesChallenge = await user2.getMSeriesChallenge({ joinCode: createdMSeriesChallenge.joinCode })

    expect(typeof mSeriesChallenge).to.equal('object')
    expect(mSeriesChallenge instanceof JoinableMSeriesChallenge).to.equal(true)
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(user.id)
    expect(typeof mSeriesChallenge.joinCode).to.equal('string')
  })

  it('cannot get M Series Challenge using id that is neither owned nor joined', async function () {
    let extError

    try {
      await user2.getMSeriesChallenge({ id: createdMSeriesChallenge.id })
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
  })

  it('can join M Series Challenge', async function () {
    const mSeriesChallengeParticipant = await user2.joinMSeriesChallenge({ joinCode: createdMSeriesChallenge.joinCode })

    expect(typeof mSeriesChallengeParticipant).to.equal('object')
    expect(mSeriesChallengeParticipant.userId).to.equal(user2.id)
    expect(mSeriesChallengeParticipant.mSeriesChallengeId).to.equal(createdMSeriesChallenge.id)
  })

  it('can get joined M Series Challenge', async function () {
    const mSeriesChallenge = await user2.getMSeriesChallenge({ id: createdMSeriesChallenge.id })

    expect(typeof mSeriesChallenge).to.equal('object')
    expect(mSeriesChallenge instanceof JoinedMSeriesChallenge).to.equal(true)
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(user.id)
    expect(typeof mSeriesChallenge.joinCode).to.equal('string')
    joinedMSeriesChallenge = mSeriesChallenge as JoinedMSeriesChallenge
  })

  it('can list owned M Series Challenges', async function () {
    const mSeriesChallenges = await user.getPrivilegedMSeriesChallenges()

    expect(Array.isArray(mSeriesChallenges)).to.equal(true)
    expect(mSeriesChallenges instanceof PrivilegedMSeriesChallenges).to.equal(true)
    expect(mSeriesChallenges.meta.sort).to.equal(MSeriesChallengeSorting.StartAt)
  })

  it('can list joined M Series Challenges', async function () {
    const mSeriesChallenges = await user2.getJoinedMSeriesChallenges()

    expect(Array.isArray(mSeriesChallenges)).to.equal(true)
    expect(mSeriesChallenges instanceof JoinedMSeriesChallenges).to.equal(true)
    expect(mSeriesChallenges.meta.sort).to.equal(MSeriesChallengeSorting.StartAt)
  })

  it('can get owned M Series Challenge Participant data', async function () {
    const mSeriesChallengeParticipant = await createdMSeriesChallenge.getCurrentParticipant()

    expect(typeof mSeriesChallengeParticipant).to.equal('object')
    expect(mSeriesChallengeParticipant.userId).to.equal(user.id)
    expect(mSeriesChallengeParticipant.mSeriesChallengeId).to.equal(createdMSeriesChallenge.id)
  })

  it('can search M Series Challenge Participants by name', async function () {
    const mSeriesChallengeParticipants = await createdMSeriesChallenge.getParticipants({ nameSearchQuery: 'Mo' })

    expect(Array.isArray(mSeriesChallengeParticipants)).to.equal(true)
    expect(mSeriesChallengeParticipants[0].name).to.equal('Moe Power')
    expect(mSeriesChallengeParticipants.meta.sort).to.equal(MSeriesChallengeParticipantSorting.Name)
  })

  it('can get M Series Challenge Leaderboard', async function () {
    const mSeriesChallengeLeaderboardParticipants = await createdMSeriesChallenge.getLeaderboard()

    expect(Array.isArray(mSeriesChallengeLeaderboardParticipants)).to.equal(true)
    expect(mSeriesChallengeLeaderboardParticipants.meta.totalCount).to.equal(2)
  })

  it('can update M Series Challenge', async function () {
    await createdMSeriesChallenge.update({ name: 'Updated SDK Test Challenge' })

    expect(createdMSeriesChallenge.name).to.equal('Updated SDK Test Challenge')
  })

  it('can leave M Series Challenge', async function () {
    await joinedMSeriesChallenge.leave()

    let extError

    try {
      await joinedMSeriesChallenge.getCurrentParticipant()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

  it('can delete M Series Challenge', async function () {
    await createdMSeriesChallenge.end()

    let extError

    try {
      await createdMSeriesChallenge.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
