import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { MSeriesChallengeLeaderboardParticipants, MSeriesChallengeLeaderboardResponse, MSeriesChallengeParticipant, MSeriesChallengeParticipantListResponse, MSeriesChallengeParticipantResponse, MSeriesChallengeParticipants, MSeriesChallengeParticipantSorting } from './mSeriesChallengeParticipant'

export const enum MSeriesChallengeType {
  TimeBased = 'timeBased',
  GoalBased = 'goalBased',
}

export const enum MSeriesChallengeFocus {
  Points = 'points',
  CaloricBurn = 'caloricBurn',
  Distance = 'distance',
  Duration = 'duration',
}

export const enum MSeriesChallengeRelationship {
  Owned = 'owned',
  Joined = 'joined'
}

export const enum MSeriesChallengeSorting {
  ID = 'id',
  StartAt = 'startAt',
  EndAt = 'endAt',
  CreatedAt = 'createdAt'
}

export interface MSeriesChallengeData {
  id: number
  joinCode: string
  name: string
  userId: number
  isPublic: boolean
  userLimit: number | null
  challengeType: MSeriesChallengeType
  startAt: string
  endAt: string | null
  focus: MSeriesChallengeFocus
  goal: number
  isCompleted: boolean
  isJoined: boolean
}

export interface MSeriesChallengeResponse extends AuthenticatedResponse {
  mSeriesChallenge: MSeriesChallengeData
}

export interface MSeriesChallengeListResponse extends AuthenticatedResponse {
  mSeriesChallenges: MSeriesChallengeData[]
  mSeriesChallengesMeta: MSeriesChallengeListResponseMeta
}

export interface MSeriesChallengeListResponseMeta extends ListMeta {
  from?: string
  to?: string
  isCompleted: boolean
  relationship: MSeriesChallengeRelationship
  sort: MSeriesChallengeSorting
}

export abstract class MSeriesChallenge extends Model {
  protected _mSeriesChallengeData: MSeriesChallengeData

  constructor (mSeriesChallengeData: MSeriesChallengeData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._mSeriesChallengeData = mSeriesChallengeData
  }

  protected setMSeriesChallenge (mSeriesChallengeData: MSeriesChallengeData) {
    this._mSeriesChallengeData = mSeriesChallengeData
  }

  async reload () {
    const { mSeriesChallenge } = await this.action('mSeriesChallenge:show', { id: this._mSeriesChallengeData.id, userId: this.sessionHandler.userId }) as MSeriesChallengeResponse
    this.setMSeriesChallenge(mSeriesChallenge)
    return this
  }

  /**
    * Method to get user's challenge participant data.
     *
     * @param mSeriesChallengeParticipantId Id of participant to be shown.
     * @returns An MSeries Challenge Participant
     */
  async getParticipant (params: { mSeriesChallengeParticipantId: number }) {
    const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', {
      userId: this.sessionHandler.userId,
      mSeriesChallengeParticipantId: params.mSeriesChallengeParticipantId,
      joinCode: this._mSeriesChallengeData.isJoined ? undefined : this._mSeriesChallengeData.joinCode
    }) as MSeriesChallengeParticipantResponse
    return new MSeriesChallengeParticipant(mSeriesChallengeParticipant, this.sessionHandler)
  }

  /**
     * Method to search for participants in challenge.
     *
     * @param options.nameSearchQuery Name to search for
     * @param options.sort default: 'name'
     * @param options.ascending default: true
     * @param options.limit default: 20
     * @param options.offset default: 0
     * @returns An array of MSeries Challenge Participants
     */
  async getParticipants (options: {
    nameSearchQuery: string
    sort?: MSeriesChallengeParticipantSorting
    ascending?: boolean
    limit?: number
    offset?: number
  }) {
    const queryId = this._mSeriesChallengeData.isJoined ? { mSeriesChallengeId: this._mSeriesChallengeData.id } : { joinCode: this._mSeriesChallengeData.joinCode }

    const participants = await this.action('mSeriesChallengeParticipant:list', {
      userId: this.sessionHandler.userId,
      ...queryId,
      ...options
    }) as MSeriesChallengeParticipantListResponse
    return new MSeriesChallengeParticipants(participants.mSeriesChallengeParticipants, participants.mSeriesChallengeParticipantsMeta, this.sessionHandler)
  }

  /**
     * Method to get leaderboard of challenge.
     *
     * @param options.targetUserId userId to "center" leaderboard on
     * @param options.ascending default: true
     * @param options.limit default: 20
     * @param options.offset default: 0
     * @returns An array of MSeries Challenge Participants sorted by rank
     */
  async getLeaderboard (options: {
    targetUserId?: number
    ascending?: boolean
    limit?: number
    offset?: number
  } = {}) {
    const queryId = this._mSeriesChallengeData.isJoined ? { id: this._mSeriesChallengeData.id } : { joinCode: this._mSeriesChallengeData.joinCode }
    const leaderboard = await this.action('mSeriesChallenge:leaderboard', {
      userId: this.sessionHandler.userId,
      ...queryId,
      ...options
    }) as MSeriesChallengeLeaderboardResponse

    return new MSeriesChallengeLeaderboardParticipants(leaderboard.mSeriesChallengeParticipants, leaderboard.mSeriesChallengeParticipantsMeta, this.sessionHandler)
  }

  get id () {
    return this._mSeriesChallengeData.id
  }

  get joinCode () {
    return this._mSeriesChallengeData.joinCode
  }

  get userId () {
    return this._mSeriesChallengeData.userId
  }

  get name () {
    return this._mSeriesChallengeData.name
  }

  get isPublic () {
    return this._mSeriesChallengeData.isPublic
  }

  get userLimit () {
    return this._mSeriesChallengeData.userLimit
  }

  get challengeType () {
    return this._mSeriesChallengeData.challengeType
  }

  get startAt () {
    return new Date(this._mSeriesChallengeData.startAt)
  }

  get endAt () {
    return this._mSeriesChallengeData.endAt !== null ? new Date(this._mSeriesChallengeData.endAt) : null
  }

  get focus () {
    return this._mSeriesChallengeData.focus
  }

  get goal () {
    return this._mSeriesChallengeData.goal
  }

  get isCompleted () {
    return this._mSeriesChallengeData.isCompleted
  }

  get isJoined () {
    return this._mSeriesChallengeData.isJoined
  }

  get mSeriesChallengeData (): MSeriesChallengeData {
    return { ...this._mSeriesChallengeData }
  }
}

export class JoinableMSeriesChallenges extends ModelList<
JoinableMSeriesChallenge,
MSeriesChallengeData,
MSeriesChallengeListResponseMeta
> {
  constructor (mSeriesChallenges: MSeriesChallengeData[], mSeriesChallengesMeta: MSeriesChallengeListResponseMeta, sessionHandler: SessionHandler) {
    super(JoinableMSeriesChallenge, mSeriesChallenges, mSeriesChallengesMeta, sessionHandler)
  }
}

export class JoinedMSeriesChallenges extends ModelList<
JoinedMSeriesChallenge,
MSeriesChallengeData,
MSeriesChallengeListResponseMeta
> {
  constructor (mSeriesChallenges: MSeriesChallengeData[], mSeriesChallengesMeta: MSeriesChallengeListResponseMeta, sessionHandler: SessionHandler) {
    super(JoinedMSeriesChallenge, mSeriesChallenges, mSeriesChallengesMeta, sessionHandler)
  }
}

export class PrivilegedMSeriesChallenges extends ModelList<
PrivilegedMSeriesChallenge,
MSeriesChallengeData,
MSeriesChallengeListResponseMeta
> {
  constructor (mSeriesChallenges: MSeriesChallengeData[], mSeriesChallengesMeta: MSeriesChallengeListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedMSeriesChallenge, mSeriesChallenges, mSeriesChallengesMeta, sessionHandler)
  }
}

export class JoinableMSeriesChallenge extends MSeriesChallenge {
/**
   * Method to join a challenge
   */
  async join () {
    const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:create', { joinCode: this._mSeriesChallengeData.joinCode, userId: this.sessionHandler.userId }) as MSeriesChallengeParticipantResponse
    return {
      mSeriesChallengeParticipant: new MSeriesChallengeParticipant(mSeriesChallengeParticipant, this.sessionHandler),
      joinedMSeriesChallenge: new JoinedMSeriesChallenge(this._mSeriesChallengeData, this.sessionHandler)
    }
  }
}
export class JoinedMSeriesChallenge extends MSeriesChallenge {
  /**
   * Method to leave a challenge
   */
  async leave () {
    await this.action('mSeriesChallengeParticipant:delete', { mSeriesChallengeId: this._mSeriesChallengeData.id, userId: this.sessionHandler.userId })
    return new JoinableMSeriesChallenge(this._mSeriesChallengeData, this.sessionHandler)
  }

  /**
   * Method to get the current session user's challenge participant data.
   *
   * @returns An MSeries Challenge Participant
   */
  async getCurrentParticipant () {
    const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', { mSeriesChallengeId: this._mSeriesChallengeData.id, userId: this.sessionHandler.userId }) as MSeriesChallengeParticipantResponse
    return new MSeriesChallengeParticipant(mSeriesChallengeParticipant, this.sessionHandler)
  }
}
export class PrivilegedMSeriesChallenge extends MSeriesChallenge {
  /**
   * Method to end a challenge
   */
  async end () {
    await this.action('mSeriesChallenge:delete', { id: this._mSeriesChallengeData.id })
  }

  /**
   * Method to get the current session user's challenge participant data.
   *
   * @returns An MSeries Challenge Participant
   */
  async getCurrentParticipant () {
    const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', { mSeriesChallengeId: this._mSeriesChallengeData.id, userId: this.sessionHandler.userId }) as MSeriesChallengeParticipantResponse
    return new MSeriesChallengeParticipant(mSeriesChallengeParticipant, this.sessionHandler)
  }

  /**
   * Method to update challenge meta data.
   *
   * @param options.name
   * @param options.userLimit
   */
  async update (options: {
    name?: string
    // isPublic?: boolean
    userLimit?: number
  }) {
    const { mSeriesChallenge } = await this.action('mSeriesChallenge:update', {
      id: this._mSeriesChallengeData.id,
      ...options
    }) as MSeriesChallengeResponse

    this.setMSeriesChallenge(mSeriesChallenge)
  }
}
