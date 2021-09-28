import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum MSeriesChallengeParticipantSorting {
  ID = 'id',
  Name = 'name',
  JoinedAt = 'joinedAt'
}

export interface MSeriesChallengeParticipantData {
  id: number
  userId: number
  mSeriesChallengeId: number
  joinedAt: string
  currentValue: number
  rank?: number
  name: string
}

export interface MSeriesChallengeParticipantResponse extends AuthenticatedResponse {
  mSeriesChallengeParticipant: MSeriesChallengeParticipantData
}

export interface MSeriesChallengeParticipantListResponse extends AuthenticatedResponse {
  mSeriesChallengeParticipants: MSeriesChallengeParticipantData[]
  mSeriesChallengeParticipantsMeta: MSeriesChallengeParticipantListResponseMeta
}

export interface MSeriesChallengeLeaderboardResponse extends AuthenticatedResponse {
  mSeriesChallengeParticipants: MSeriesChallengeParticipantData[]
  mSeriesChallengeParticipantsMeta: MSeriesChallengeLeaderboardResponseMeta
}

export interface MSeriesChallengeParticipantListResponseMeta extends ListMeta {
  userId?: number
  nameSearchQuery?: string
  sort: MSeriesChallengeParticipantSorting
}

export interface MSeriesChallengeLeaderboardResponseMeta {
  ascending: boolean
  limit: number
  offset: number
  totalCount: number
}

export class MSeriesChallengeParticipants extends ModelList<
MSeriesChallengeParticipant,
MSeriesChallengeParticipantData,
MSeriesChallengeParticipantListResponseMeta
> {
  constructor (mSeriesChallengeParticipants: MSeriesChallengeParticipantData[], mSeriesChallengeParticipantsMeta: MSeriesChallengeParticipantListResponseMeta, sessionHandler: SessionHandler) {
    super(MSeriesChallengeParticipant, mSeriesChallengeParticipants, mSeriesChallengeParticipantsMeta, sessionHandler)
  }
}

export class MSeriesChallengeLeaderboardParticipants extends ModelList<
MSeriesChallengeParticipant,
MSeriesChallengeParticipantData,
MSeriesChallengeLeaderboardResponseMeta
> {
  constructor (mSeriesChallengeParticipants: MSeriesChallengeParticipantData[], mSeriesChallengeLeaderboardMeta: MSeriesChallengeLeaderboardResponseMeta, sessionHandler: SessionHandler) {
    super(MSeriesChallengeParticipant, mSeriesChallengeParticipants, mSeriesChallengeLeaderboardMeta, sessionHandler)
  }
}

export class MSeriesChallengeParticipant extends Model {
  private _mSeriesChallengeParticipantData: MSeriesChallengeParticipantData

  constructor (mSeriesChallengeParticipantData: MSeriesChallengeParticipantData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._mSeriesChallengeParticipantData = mSeriesChallengeParticipantData
  }

  private setMSeriesChallengeParticipant (mSeriesChallengeParticipantData: MSeriesChallengeParticipantData) {
    this._mSeriesChallengeParticipantData = mSeriesChallengeParticipantData
  }

  async reload () {
    const { mSeriesChallengeParticipant } = await this.action('mSeriesChallengeParticipant:show', { mSeriesChallengeParticipantId: this._mSeriesChallengeParticipantData.id }) as MSeriesChallengeParticipantResponse
    this.setMSeriesChallengeParticipant(mSeriesChallengeParticipant)
  }

  get id () {
    return this._mSeriesChallengeParticipantData.id
  }

  get userId () {
    return this._mSeriesChallengeParticipantData.userId
  }

  get mSeriesChallengeId () {
    return this._mSeriesChallengeParticipantData.mSeriesChallengeId
  }

  get joinedAt () {
    return this._mSeriesChallengeParticipantData.joinedAt
  }

  get currentValue () {
    return this._mSeriesChallengeParticipantData.currentValue
  }

  get rank () {
    return this._mSeriesChallengeParticipantData.rank
  }

  get name () {
    return this._mSeriesChallengeParticipantData.name
  }
}
