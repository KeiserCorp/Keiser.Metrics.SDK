import { expect } from 'chai'

import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { MSeriesChallenge, MSeriesChallengeFocus, MSeriesChallengeParticipantSorting, MSeriesChallengeSorting, MSeriesChallengeType } from '../src/models/mSeriesChallenge'
import { User } from '../src/models/user'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('M Series Challenge', function () {
  let metricsInstance: Metrics
  let user: User
  let createdMSeriesChallenge: MSeriesChallenge

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    user = userSession.user
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
      goal: 1000,
      shouldAutoJoinCreator: false
    })

    expect(typeof mSeriesChallenge).to.equal('object')
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(user.id)
    expect(typeof mSeriesChallenge.joinCode).to.equal('string')
    createdMSeriesChallenge = mSeriesChallenge
  })

  it('can join M Series Challenge', async function () {
    const mSeriesChallengeParticipant = await user.joinMSeriesChallenge({ joinCode: createdMSeriesChallenge.joinCode })

    expect(typeof mSeriesChallengeParticipant).to.equal('object')
    expect(mSeriesChallengeParticipant.userId).to.equal(user.id)
    expect(mSeriesChallengeParticipant.mSeriesChallengeId).to.equal(createdMSeriesChallenge.id)
  })

  it('can get specific M Series Challenge', async function () {
    const mSeriesChallenge = await user.getMSeriesChallenge({ id: createdMSeriesChallenge.id })

    expect(typeof mSeriesChallenge).to.equal('object')
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(user.id)
    expect(typeof mSeriesChallenge.joinCode).to.equal('string')
  })

  it('can list owned M Series Challenges', async function () {
    const mSeriesChallenges = await user.getMSeriesChallenges()

    expect(Array.isArray(mSeriesChallenges)).to.equal(true)
    expect(mSeriesChallenges.meta.sort).to.equal(MSeriesChallengeSorting.StartAt)
  })

  it('can get owned M Series Challenge Participant data', async function () {
    const mSeriesChallengeParticipant = await createdMSeriesChallenge.getParticipant()

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
    expect(mSeriesChallengeLeaderboardParticipants.meta.totalCount).to.equal(1)
  })

  it('can update M Series Challenge', async function () {
    await createdMSeriesChallenge.update({ name: 'Updated SDK Test Challenge' })

    expect(createdMSeriesChallenge.name).to.equal('Updated SDK Test Challenge')
  })

  it('can leave M Series Challenge', async function () {
    await createdMSeriesChallenge.leave()

    let extError

    try {
      await createdMSeriesChallenge.getParticipant()
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
