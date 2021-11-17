export interface ActionErrorProperties {
  code?: number
  name: string
  message: string
  explanation?: string
  params?: string[]
}

export class BaseMetricsError extends Error {
  static readonly code: number = 600
  readonly message: string
  readonly explanation: string
  readonly params: string[]

  constructor (errorProperties: ActionErrorProperties) {
    super(errorProperties.name)
    this.message = errorProperties.message ?? ''
    this.explanation = errorProperties.explanation ?? ''
    this.params = errorProperties.params ?? []
  }

  toString () {
    return this.name + ': ' + this.message + (this.params?.length > 0 ? ' [' + this.params.join(', ') + ']' : '')
  }

  get code () {
    return (this.constructor as typeof BaseMetricsError).code
  }
}

/** @hidden */
export function GetErrorInstance (errorProperties: ActionErrorProperties) {
  const ErrorType = [
    MissingParamsError,
    UnknownActionError,
    InvalidCredentialsError,
    ValidationError,
    UnknownEntityError,
    DuplicateEntityError,
    CSRFError,
    UnsupportedTypeError,
    ServerShutdownError,
    PendingActionOverflowError,
    DataSizeLimitError,
    OTPTokenExpiredError,
    UnauthorizedTokenError,
    InvalidAuthorizationCodeError,
    BlacklistTokenError,
    TokenInvalidError,
    ParseError,
    OAuthInvalidLoginError,
    InvalidExchangeCodeError,
    UnauthorizedResourceError,
    OAuthCollisionError,
    OAuthRequestError,
    OAuthRefreshTokenError,
    DuplicateActionError,
    ActionPreventedError,
    DemoActionPreventedError,
    SessionDataMissingError,
    FacilityLicenseExpiredError,
    FacilityAccessControlError,
    UnhealthyNodeError,
    InvalidReturnUrlError,
    SubscribePreventedError,
    DatabaseError
  ].find(c => c.code === errorProperties.code)

  if (typeof ErrorType !== 'undefined') {
    return new ErrorType(errorProperties)
  }

  return new ConnectionError(errorProperties)
}

// Category Errors

export class RequestError extends BaseMetricsError {
  // For errors where the issue is in the action or parameters
}

export class SessionError extends BaseMetricsError {
  // For errors where the issue is in the token lifecycle
}

export class ServerError extends BaseMetricsError {
  // For errors that are a result of the server's health
}

export class ConnectionError extends BaseMetricsError {
  // For errors that are a result of a faulty connection
  static readonly code = 0
}

// Remote Errors

export class MissingParamsError extends RequestError {
  static readonly code = 601
}

export class UnknownActionError extends RequestError {
  static readonly code = 602
}

export class InvalidCredentialsError extends RequestError {
  static readonly code = 603
}

export class ValidationError extends RequestError {
  static readonly code = 604
}

export class UnknownEntityError extends RequestError {
  static readonly code = 605
}

export class DuplicateEntityError extends RequestError {
  static readonly code = 606
}

export class CSRFError extends SessionError {
  static readonly code = 607
}

export class UnsupportedTypeError extends RequestError {
  static readonly code = 608
}

export class ServerShutdownError extends ServerError {
  static readonly code = 609
}

export class PendingActionOverflowError extends ServerError {
  static readonly code = 610
}

export class DataSizeLimitError extends RequestError {
  static readonly code = 611
}

export class OTPTokenExpiredError extends RequestError {
  static readonly code = 612
}

export class UnauthorizedTokenError extends SessionError {
  static readonly code = 613
}

export class InvalidAuthorizationCodeError extends RequestError {
  static readonly code = 614
}

export class BlacklistTokenError extends SessionError {
  static readonly code = 615
}

export class TokenInvalidError extends SessionError {
  static readonly code = 616
}

export class ParseError extends RequestError {
  static readonly code = 617
}

export class OAuthInvalidLoginError extends RequestError {
  static readonly code = 618
}

export class InvalidExchangeCodeError extends RequestError {
  static readonly code = 619
}

export class UnauthorizedResourceError extends RequestError {
  static readonly code = 620
}

export class OAuthCollisionError extends RequestError {
  static readonly code = 621
}

export class OAuthRequestError extends RequestError {
  static readonly code = 622
}

export class OAuthRefreshTokenError extends SessionError {
  static readonly code = 623
}

export class DuplicateActionError extends RequestError {
  static readonly code = 624
}

export class ActionPreventedError extends RequestError {
  static readonly code = 625
}

export class DemoActionPreventedError extends RequestError {
  static readonly code = 626
}

export class SessionDataMissingError extends SessionError {
  static readonly code = 627
}

export class FacilityLicenseExpiredError extends SessionError {
  static readonly code = 628
}

export class FacilityAccessControlError extends RequestError {
  static readonly code = 629
}

export class UnhealthyNodeError extends ServerError {
  static readonly code = 630
}

export class InvalidReturnUrlError extends RequestError {
  static readonly code = 631
}

export class SubscribePreventedError extends RequestError {
  static readonly code = 632
}

export class DatabaseError extends RequestError {
  static readonly code = 633
}

// Local Errors

export class ClientSideActionPrevented extends RequestError {
  constructor ({ explanation }: { explanation?: string }) {
    super({
      name: 'InvalidGACSession',
      message: 'is not a valid GAC session',
      explanation
    })
  }
}

export class ConnectionFaultError extends ConnectionError {
  constructor () {
    super({
      name: 'ConnectionFault',
      message: 'connection to server failed'
    })
  }
}
