export class MachineInitializerToken {
  protected _initializerToken: string
  private readonly _metricsApiUrl: string

  constructor (initializerToken: string, metricsApiUrl: string) {
    this._initializerToken = initializerToken
    this._metricsApiUrl = metricsApiUrl
  }

  get initializerToken () {
    return this._initializerToken
  }

  get metricsApiUrl () {
    return this._metricsApiUrl
  }
}

export class MachineInitializerJWTToken extends MachineInitializerToken {
  private readonly _jwtToken: string

  constructor (initializerToken: string) {
    const [url, jwt] = initializerToken.substr(initializerToken.indexOf(':') + 1).split(',')
    super(initializerToken, url)
    this._jwtToken = jwt
  }

  get jwtToken () {
    return this._jwtToken
  }
}

export class MachineInitializerOTPToken extends MachineInitializerToken {
  private readonly _otp: string
  private readonly _facilityId: string

  constructor (initializerToken: string) {
    const [url, otp, facilityId] = initializerToken.substr(initializerToken.indexOf(':') + 1).split(',')
    super(initializerToken, url)
    this._otp = otp
    this._facilityId = facilityId
  }

  get facilityId () {
    return this._facilityId
  }

  get otp () {
    return this._otp
  }
}
