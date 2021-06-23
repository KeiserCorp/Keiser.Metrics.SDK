import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

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

export const enum MSeriesChallengeParticipantSorting {
  ID = 'id',
  Name = 'name',
  JoinedAt = 'joinedAt'
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

export interface MSeriesChallengeParticipantData {
  id: number
  userId: number
  mSeriesChallengeId: number
  joinedAt: string
  currentValue: number
  rank: number | undefined
  name: string
}

export interface MSeriesChallengeResponse extends AuthenticatedResponse {
  mSeriesChallenge: MSeriesChallengeData
}

export interface MSeriesChallengeParticipantResponse extends AuthenticatedResponse {
  mSeriesChallengeParticipant: MSeriesChallengeParticipantData
}

export interface MSeriesChallengeListResponse extends AuthenticatedResponse {
  mSeriesChallenges: MSeriesChallengeData[]
  mSeriesChallengesMeta: MSeriesChallengeListResponseMeta
}

export interface MSeriesChallengeParticipantListResponse extends AuthenticatedResponse {
  mSeriesChallengeParticipants: MSeriesChallengeParticipantData[]
  mSeriesChallengeParticipantsMeta: MSeriesChallengeParticipantListResponseMeta
}

export interface MSeriesChallengeLeaderboardResponse extends AuthenticatedResponse {
  mSeriesChallengeParticipants: MSeriesChallengeParticipantData[]
  mSeriesChallengeParticipantsMeta: MSeriesChallengeLeaderboardResponseMeta
}

export interface MSeriesChallengeListResponseMeta extends ListMeta {
  from: string | undefined
  to: string | undefined
  isCompleted: boolean
  relationship: MSeriesChallengeRelationship
  sort: MSeriesChallengeSorting
}

export interface MSeriesChallengeParticipantListResponseMeta extends ListMeta {
  nameSearchQuery: string
  sort: MSeriesChallengeParticipantSorting
}

export interface MSeriesChallengeLeaderboardResponseMeta {
  ascending: boolean
  limit: number
  offset: number
  totalCount: number
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
  private _mSeriesChallengeParticipantData?: MSeriesChallengeParticipantData

  constructor (mSeriesChallengeData: MSeriesChallengeData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._mSeriesChallengeData = mSeriesChallengeData
  }

  private setMSeriesChallenge (mSeriesChallengeData: MSeriesChallengeData) {
    this._mSeriesChallengeData = mSeriesChallengeData
  }

  private setMSeriesChallengeParticipant (mSeriesChallengeParticipantData: MSeriesChallengeParticipantData) {
    this._mSeriesChallengeParticipantData = mSeriesChallengeParticipantData
  }

  async reload (options: { includeOwnedParticipantData: boolean } = { includeOwnedParticipantData: false }) {
    const { mSeriesChallenge } = await this.action('mSeriesChallenge:show', { id: this._mSeriesChallengeData.id }) as MSeriesChallengeResponse

    if (options.includeOwnedParticipantData) {
      const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', { mSeriesChallengeId: this._mSeriesChallengeData.id }) as MSeriesChallengeParticipantResponse
      this.setMSeriesChallengeParticipant(mSeriesChallengeParticipant)
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
    await this.action('mSeriesChallengeParticipant:delete', { mSeriesChallengeId: this._mSeriesChallengeData.id })
  }

  /**
   * Method to join a challenge. Challenge instance must contain joinCode to successfully join.
   */
  async join () {
    if (this._mSeriesChallengeData.joinCode !== undefined) {
      const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:create', { joinCode: this._mSeriesChallengeData.joinCode }) as MSeriesChallengeParticipantResponse
      this.setMSeriesChallengeParticipant(mSeriesChallengeParticipant)
      return mSeriesChallengeParticipant
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
      const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', { mSeriesChallengeParticipantId: mSeriesChallengeParticipantId }) as MSeriesChallengeParticipantResponse
      return mSeriesChallengeParticipant
    } else {
      const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', { mSeriesChallengeId: this._mSeriesChallengeData.id }) as MSeriesChallengeParticipantResponse
      this.setMSeriesChallengeParticipant(mSeriesChallengeParticipant)
      return mSeriesChallengeParticipant
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
  async searchParticipantsByName (options: {
    nameSearchQuery: string
    sort?: MSeriesChallengeParticipantSorting
    ascending?: boolean
    limit?: number
    offset?: number
  }) {
    const participants = await this.action('mSeriesChallengeParticipant:list', {
      mSeriesChallengeId: this._mSeriesChallengeData.id,
      ...options
    }) as MSeriesChallengeParticipantListResponse
    return participants
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
      ...options
    }) as MSeriesChallengeLeaderboardResponse

    return leaderboard
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
    return this._mSeriesChallengeData.startAt
  }

  get endAt () {
    return this._mSeriesChallengeData.endAt
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
    return this._mSeriesChallengeParticipantData
  }
}
