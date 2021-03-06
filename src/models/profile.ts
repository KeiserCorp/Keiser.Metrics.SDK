import { Units } from '../constants'
import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum Gender {
  Male = 'm',
  Female = 'f',
  Other = 'o'
}

export interface ProfileData {
  userId: number
  updatedAt: string
  name: string | null
  birthday: string | null
  gender: string | null
  language: string | null
  units: string | null
}

export interface ProfileResponse extends AuthenticatedResponse {
  profile: ProfileData
}

export class Profile extends Model {
  private _profileData: ProfileData

  constructor (profileData: ProfileData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._profileData = profileData
  }

  private setProfileData (profileData: ProfileData) {
    this._profileData = profileData
  }

  async reload () {
    const { profile } = await this.action('profile:show', { userId: this._profileData.userId }) as ProfileResponse
    this.setProfileData(profile)
    return this
  }

  async update (params: {
    name?: string | null
    birthday?: string | null
    gender?: Gender | null
    language?: string | null
    units?: Units | null
  }) {
    const { profile } = await this.action('profile:update', { ...params, userId: this._profileData.userId }) as ProfileResponse
    this.setProfileData(profile)
    return this
  }

  get updatedAt () {
    return new Date(this._profileData.updatedAt)
  }

  get name () {
    return this._profileData.name
  }

  get birthday () {
    return this._profileData.birthday
  }

  get gender () {
    return this._profileData.gender as Gender ?? null
  }

  get language () {
    return this._profileData.language
  }

  get units () {
    return this._profileData.units as Units ?? null
  }
}

export class StaticProfile {
  private readonly _profileData: ProfileData

  constructor (profileData: ProfileData) {
    this._profileData = profileData
  }

  get name () {
    return this._profileData.name
  }

  get birthday () {
    return this._profileData.birthday
  }

  get gender () {
    return this._profileData.gender as Gender ?? null
  }

  get language () {
    return this._profileData.language
  }

  get units () {
    return this._profileData.units as Units ?? null
  }
}
