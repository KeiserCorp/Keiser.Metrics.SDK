import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { JoinableMSeriesChallenge, JoinedMSeriesChallenge, JoinedMSeriesChallenges, MSeriesChallengeFocus, MSeriesChallengeRelationship, MSeriesChallengeSorting, MSeriesChallengeType, PrivilegedMSeriesChallenge, PrivilegedMSeriesChallenges } from '../src/models/mSeriesChallenge'
import { MSeriesChallengeParticipant, MSeriesChallengeParticipantSorting } from '../src/models/mSeriesChallengeParticipant'
import { User } from '../src/models/user'
import { createNewUserSession, getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('M Series Challenge', function () {
  let metricsInstance: Metrics
  let demoUser: User
  let createdUser: User
  let createdMSeriesChallenge: PrivilegedMSeriesChallenge
  let joinedMSeriesChallenge: JoinedMSeriesChallenge
  let joinableMSeriesChallenge: JoinableMSeriesChallenge
  let createdMSeriesChallengeParticipant: MSeriesChallengeParticipant

  before(async function () {
    metricsInstance = getMetricsInstance()
    const demoUserSession = await getDemoUserSession(metricsInstance)
    demoUser = demoUserSession.user
    const createdUserSession = await createNewUserSession(metricsInstance)
    createdUser = createdUserSession.user
  })

  after(async function () {
    await createdUser?.delete()
    metricsInstance?.dispose()
  })

  it('can create new M Series Challenge', async function () {
    const mSeriesChallenge = await demoUser.createMSeriesChallenge({
      userLimit: 25,
      name: 'SDK Test Challenge',
      challengeType: MSeriesChallengeType.GoalBased,
      focus: MSeriesChallengeFocus.Points,
      goal: 1000
    })

    expect(mSeriesChallenge).to.be.an('object')
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(demoUser.id)
    expect(mSeriesChallenge.joinCode).to.be.a('string')
    createdMSeriesChallenge = mSeriesChallenge
  })

  it('can get owned M Series Challenge', async function () {
    const mSeriesChallenge = await demoUser.getMSeriesChallenge({ id: createdMSeriesChallenge.id })

    expect(mSeriesChallenge).to.be.an('object')
    expect(mSeriesChallenge instanceof PrivilegedMSeriesChallenge).to.equal(true)
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(demoUser.id)
    expect(mSeriesChallenge.joinCode).to.be.a('string')
  })

  it('can get M Series Challenge using joinCode that is neither owned nor joined', async function () {
    const mSeriesChallenge = await createdUser.getMSeriesChallenge({ joinCode: createdMSeriesChallenge.joinCode })

    expect(typeof mSeriesChallenge).to.equal('object')
    expect(mSeriesChallenge instanceof JoinableMSeriesChallenge).to.equal(true)
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(demoUser.id)
    expect(mSeriesChallenge.joinCode).to.be.a('string')
    joinableMSeriesChallenge = mSeriesChallenge as JoinableMSeriesChallenge
  })

  it('cannot get M Series Challenge using id that is neither owned nor joined', async function () {
    let extError

    try {
      await createdUser.getMSeriesChallenge({ id: createdMSeriesChallenge.id })
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
  })

  it('can get owned M Series Challenge Participant data', async function () {
    const mSeriesChallengeParticipant = await createdMSeriesChallenge.getCurrentParticipant()

    expect(typeof mSeriesChallengeParticipant).to.equal('object')
    expect(mSeriesChallengeParticipant.userId).to.equal(demoUser.id)
    expect(mSeriesChallengeParticipant.mSeriesChallengeId).to.equal(createdMSeriesChallenge.id)
    createdMSeriesChallengeParticipant = mSeriesChallengeParticipant
  })

  it('can search M Series Challenge Participants by name', async function () {
    const mSeriesChallengeParticipants = await createdMSeriesChallenge.getParticipants({ nameSearchQuery: 'Mo' })

    expect(Array.isArray(mSeriesChallengeParticipants)).to.equal(true)
    expect(mSeriesChallengeParticipants[0].name).to.equal('Moe Power')
    expect(mSeriesChallengeParticipants.meta.sort).to.equal(MSeriesChallengeParticipantSorting.Name)
  })

  it('can get M Series Challenge Participant in joinable challenge', async function () {
    const mSeriesChallengeParticipant = await joinableMSeriesChallenge.getParticipant({ mSeriesChallengeParticipantId: createdMSeriesChallengeParticipant.id })

    expect(typeof mSeriesChallengeParticipant).to.equal('object')
    expect(mSeriesChallengeParticipant.name).to.equal('Moe Power')
  })

  it('can search M Series Challenge Participants by name in joinable challenge', async function () {
    const mSeriesChallengeParticipants = await joinableMSeriesChallenge.getParticipants({ nameSearchQuery: 'Mo' })

    expect(Array.isArray(mSeriesChallengeParticipants)).to.equal(true)
    expect(mSeriesChallengeParticipants[0].name).to.equal('Moe Power')
    expect(mSeriesChallengeParticipants.meta.sort).to.equal(MSeriesChallengeParticipantSorting.Name)
  })

  it('can get M Series Challenge Leaderboard in joinable challenge', async function () {
    const mSeriesChallengeLeaderboardParticipants = await joinableMSeriesChallenge.getLeaderboard()

    expect(Array.isArray(mSeriesChallengeLeaderboardParticipants)).to.equal(true)
    expect(mSeriesChallengeLeaderboardParticipants.meta.totalCount).to.equal(1)
  })

  it('can join M Series Challenge', async function () {
    const mSeriesChallengeParticipant = await createdUser.joinMSeriesChallenge({ joinCode: createdMSeriesChallenge.joinCode })

    expect(typeof mSeriesChallengeParticipant).to.equal('object')
    expect(mSeriesChallengeParticipant.userId).to.equal(createdUser.id)
    expect(mSeriesChallengeParticipant.mSeriesChallengeId).to.equal(createdMSeriesChallenge.id)
  })

  it('can get M Series Challenge Leaderboard', async function () {
    const mSeriesChallengeLeaderboardParticipants = await createdMSeriesChallenge.getLeaderboard()

    expect(Array.isArray(mSeriesChallengeLeaderboardParticipants)).to.equal(true)
    expect(mSeriesChallengeLeaderboardParticipants.meta.totalCount).to.equal(2)
  })

  it('can get joined M Series Challenge', async function () {
    const mSeriesChallenge = await createdUser.getMSeriesChallenge({ id: createdMSeriesChallenge.id })

    expect(typeof mSeriesChallenge).to.equal('object')
    expect(mSeriesChallenge instanceof JoinedMSeriesChallenge).to.equal(true)
    expect(mSeriesChallenge.userLimit).to.equal(25)
    expect(mSeriesChallenge.userId).to.equal(demoUser.id)
    expect(typeof mSeriesChallenge.joinCode).to.equal('string')
    joinedMSeriesChallenge = mSeriesChallenge as JoinedMSeriesChallenge
  })

  it('can list owned M Series Challenges', async function () {
    const mSeriesChallenges = await demoUser.getMSeriesChallenges({ relationship: MSeriesChallengeRelationship.Owned })

    expect(Array.isArray(mSeriesChallenges)).to.equal(true)
    expect(mSeriesChallenges instanceof PrivilegedMSeriesChallenges).to.equal(true)
    expect(mSeriesChallenges.meta.sort).to.equal(MSeriesChallengeSorting.StartAt)
  })

  it('can list joined M Series Challenges', async function () {
    const mSeriesChallenges = await createdUser.getMSeriesChallenges()

    expect(Array.isArray(mSeriesChallenges)).to.equal(true)
    expect(mSeriesChallenges instanceof JoinedMSeriesChallenges).to.equal(true)
    expect(mSeriesChallenges.meta.sort).to.equal(MSeriesChallengeSorting.StartAt)
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
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })

  it('can delete M Series Challenge', async function () {
    await createdMSeriesChallenge.end()

    let extError

    try {
      await createdMSeriesChallenge.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })
})
