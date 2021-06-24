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
  joinCode: string | undefined
  id: number
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
}

export interface MSeriesChallengeResponse extends AuthenticatedResponse {
  mSeriesChallenge: MSeriesChallengeData
}

export interface MSeriesChallengeListResponse extends AuthenticatedResponse {
  mSeriesChallenges: MSeriesChallengeData[]
  mSeriesChallengesMeta: MSeriesChallengeListResponseMeta
}

export interface MSeriesChallengeListResponseMeta extends ListMeta {
  from: string | undefined
  to: string | undefined
  isCompleted: boolean
  relationship: MSeriesChallengeRelationship
  sort: MSeriesChallengeSorting
}

export class MSeriesChallenges extends ModelList<
MSeriesChallenge,
MSeriesChallengeData,
MSeriesChallengeListResponseMeta
> {
  constructor (mSeriesChallenges: MSeriesChallengeData[], mSeriesChallengesMeta: MSeriesChallengeListResponseMeta, sessionHandler: SessionHandler) {
    super(MSeriesChallenge, mSeriesChallenges, mSeriesChallengesMeta, sessionHandler)
  }
}

export class MSeriesChallenge extends Model {
  private _mSeriesChallengeData: MSeriesChallengeData
  private _mSeriesChallengeParticipant?: MSeriesChallengeParticipant

  constructor (mSeriesChallengeData: MSeriesChallengeData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._mSeriesChallengeData = mSeriesChallengeData
  }

  private setMSeriesChallenge (mSeriesChallengeData: MSeriesChallengeData) {
    this._mSeriesChallengeData = mSeriesChallengeData
  }

  private setMSeriesChallengeParticipant (mSeriesChallengeParticipant: MSeriesChallengeParticipant) {
    this._mSeriesChallengeParticipant = mSeriesChallengeParticipant
  }

  async reload (options: { includeOwnedParticipantData: boolean } = { includeOwnedParticipantData: false }) {
    const { mSeriesChallenge } = await this.action('mSeriesChallenge:show', { id: this._mSeriesChallengeData.id, userId: this.sessionHandler.userId }) as MSeriesChallengeResponse

    if (options.includeOwnedParticipantData) {
      const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', { mSeriesChallengeId: this._mSeriesChallengeData.id, userId: this.sessionHandler.userId }) as MSeriesChallengeParticipantResponse
      this.setMSeriesChallengeParticipant(new MSeriesChallengeParticipant(mSeriesChallengeParticipant, this.sessionHandler))
    }

    this.setMSeriesChallenge(mSeriesChallenge)

    return this
  }

  /**
   * Method to end a challenge. Only challenge owners can end a challenge.
   */
  async end () {
    await this.action('mSeriesChallenge:delete', { id: this._mSeriesChallengeData.id })
  }

  /**
   * Method to leave a challenge. Only challenge participants can leave a challenge.
   */
  async leave () {
    await this.action('mSeriesChallengeParticipant:delete', { mSeriesChallengeId: this._mSeriesChallengeData.id, userId: this.sessionHandler.userId })
  }

  /**
   * Method to join a challenge. Challenge instance must contain joinCode to successfully join.
   */
  async join () {
    if (this._mSeriesChallengeData.joinCode !== undefined) {
      const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:create', { joinCode: this._mSeriesChallengeData.joinCode, userId: this.sessionHandler.userId }) as MSeriesChallengeParticipantResponse
      const p = new MSeriesChallengeParticipant(mSeriesChallengeParticipant, this.sessionHandler)
      this.setMSeriesChallengeParticipant(p)
      return p
    }
    return undefined
  }

  /**
   * This method can return the current session user's participant data or a different user's participant data.
   *
   * @param mSeriesChallengeParticipantId Id of participant to be shown. Leave undefined for current session user's participant data.
   * @returns An MSeries Challenge Participant
   */
  async getParticipant (mSeriesChallengeParticipantId?: number) {
    if (mSeriesChallengeParticipantId !== undefined) {
      const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', { mSeriesChallengeParticipantId: mSeriesChallengeParticipantId, userId: this.sessionHandler.userId }) as MSeriesChallengeParticipantResponse
      return new MSeriesChallengeParticipant(mSeriesChallengeParticipant, this.sessionHandler)
    } else {
      const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', { mSeriesChallengeId: this._mSeriesChallengeData.id, userId: this.sessionHandler.userId }) as MSeriesChallengeParticipantResponse
      const p = new MSeriesChallengeParticipant(mSeriesChallengeParticipant, this.sessionHandler)
      this.setMSeriesChallengeParticipant(p)
      return p
    }
  }

  /**
   * Method to search for participants in challenge.
   * Session User must either own or have joined challenge to search for other participants.
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
    const participants = await this.action('mSeriesChallengeParticipant:list', {
      mSeriesChallengeId: this._mSeriesChallengeData.id,
      userId: this.sessionHandler.userId,
      ...options
    }) as MSeriesChallengeParticipantListResponse
    return new MSeriesChallengeParticipants(participants.mSeriesChallengeParticipants, participants.mSeriesChallengeParticipantsMeta, this.sessionHandler)
  }

  /**
   * Method to get leaderboard of challenge.
   * Session User must either own or have joined challenge to get leaderboard.
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
    const leaderboard = await this.action('mSeriesChallenge:leaderboard', {
      id: this._mSeriesChallengeData.id,
      userId: this.sessionHandler.userId,
      ...options
    }) as MSeriesChallengeLeaderboardResponse

    return new MSeriesChallengeLeaderboardParticipants(leaderboard.mSeriesChallengeParticipants, leaderboard.mSeriesChallengeParticipantsMeta, this.sessionHandler)
  }

  /**
   * Method to update challenge meta data.
   * Session User must own challenge to update it.
   *
   * @param options.name
   * @param options.userLimit
   */
  async update (options: {
    name?: string
    // isPublic?: boolean
    userLimit?: number
  }) {
    await this.action('mSeriesChallenge:update', {
      id: this._mSeriesChallengeData.id,
      ...options
    }) as MSeriesChallengeResponse

    await this.reload()
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

  get sessionUserParticipantData () {
    return this._mSeriesChallengeParticipant
  }
}
