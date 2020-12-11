import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum Permission {
  View = 'view',
  Edit = 'edit'
}

export const enum MSeriesGuidedSessionPermission {
  Access = 'access',
  Publish = 'publish'
}

export const enum ExericsePermission {
  Edit = 'edit'
}

export const enum AnalyticPermission {
  View = 'view'
}

export interface GlobalAccessControlData {
  userId: number,
  userRights: Permission | null,
  exerciseRights: ExericsePermission | null,
  mSeriesGuidedSessionRights: MSeriesGuidedSessionPermission | null,
  facilityRights: Permission | null,
  licenseRights: Permission | null,
  accessControlRights: Permission | null,
  resqueRights: Permission | null,
  analyticRights: AnalyticPermission | null
}

export interface GlobalAccessControlSecretData {
  secret: string,
  uri: string
}

export interface GlobalAccessControlResponse extends AuthenticatedResponse {
  globalAccessControl: GlobalAccessControlData
  globalAccessControlSecret?: GlobalAccessControlSecretData
}

export class GlobalAccessControl extends Model {
  protected _globalAccessControlData: GlobalAccessControlData

  constructor(globalAccessControlData: GlobalAccessControlData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._globalAccessControlData = globalAccessControlData
  }

  protected setGlobalAccessControlData(globalAccessControlData: GlobalAccessControlData) {
    this._globalAccessControlData = globalAccessControlData
  }

  async reload() {
    const {globalAccessControl} = await this.action('globalAccessControl:show', {userId: this.userId}) as GlobalAccessControlResponse
    this.setGlobalAccessControlData(globalAccessControl)
    return this
  }

  get userId() {
    return this._globalAccessControlData.userId
  }

  get userRights() {
    return this._globalAccessControlData.userRights
  }

  get exerciseRights() {
    return this._globalAccessControlData.exerciseRights
  }

  get mSeriesGuidedSessionRights() {
    return this._globalAccessControlData.mSeriesGuidedSessionRights
  }

  get facilityRights() {
    return this._globalAccessControlData.facilityRights
  }

  get licenseRights() {
    return this._globalAccessControlData.licenseRights
  }

  get accessControlRights() {
    return this._globalAccessControlData.accessControlRights
  }

  get resqueRights() {
    return this._globalAccessControlData.resqueRights
  }

  get analyticRights() {
    return this._globalAccessControlData.analyticRights
  }
}

/** @hidden */
export class PrivilegedGlobalAccessControl extends GlobalAccessControl {
  protected _globalAccessControlSecretData?: GlobalAccessControlSecretData

  constructor(globalAccessControlData: GlobalAccessControlData, sessionHandler: SessionHandler, globalAccessControlSecretData?: GlobalAccessControlSecretData) {
    super(globalAccessControlData, sessionHandler)
    this._globalAccessControlSecretData = globalAccessControlSecretData
  }

  async update(params: { userRights?: Permission, exerciseRights?: ExericsePermission, mSeriesGuidedSessionRights?: MSeriesGuidedSessionPermission, facilityRights?: Permission, licenseRights?: Permission, accessControlRights?: Permission, resqueRights?: Permission, analyticRights?: AnalyticPermission }) {
    const { globalAccessControl } = await this.action('globalAccessControl:update', {...params, userId: this.userId}) as GlobalAccessControlResponse
    this.setGlobalAccessControlData(globalAccessControl)
    return this
  }
  
  async delete() {
    await this.action('globalAccessControl:delete', { userId: this.userId})
  }

  get secret() {
    return this._globalAccessControlSecretData?.secret
  }

  get uri() {
    return this._globalAccessControlSecretData?.uri
  }
}