
export interface MachineInitializerTokenData {
  initializerToken: string
  url: string
  expiresAt?: string
}
export class MachineInitializerToken {
  protected readonly _machineInitializerTokenData: MachineInitializerTokenData

  constructor (machineInitializerTokenData: MachineInitializerTokenData) {
    this._machineInitializerTokenData = machineInitializerTokenData
  }

  get initializerToken () {
    return this._machineInitializerTokenData.initializerToken
  }

  get url () {
    return this._machineInitializerTokenData.url
  }
}

export class MachineInitializerOTPToken extends MachineInitializerToken {

  get expiresAt() {
    return new Date(this._machineInitializerTokenData.expiresAt as string)
  }
}
