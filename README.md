# Keiser Metrics SDK
![Release](https://github.com/KeiserCorp/Keiser.Metrics.SDK/workflows/Release/badge.svg)

## Project
This SDK facilitates communication between a client system (_ie: phone app, website, server_) and [Keiser Metrics](https://metrics.keiser.com). The SDK is written in [TypeScript](https://www.typescriptlang.org) and supports both [browser](https://caniuse.com/#feat=es6) and [NodeJS](https://nodejs.org) platforms.

For a more information about this SDK visit the [Keiser Developer Zone](https://dev.keiser.com/metrics/sdk).

To play around with the SDK try out the [Keiser Metrics SDK REPL](https://repl.it/@KeiserDev/Metrics-SDK-Example).

To see the full SDK API view the [Keiser Metrics SDK Documentation](https://keisercorp.github.io/Keiser.Metrics.SDK/).

## Installation
Install with [npm](https://www.npmjs.com/): `npm install @keiser/metrics-sdk`

## Initialization
Import the SDK package root class and instantiate a [`Metrics`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html) connection instance. Each instance maintains a connection to the Keiser Metrics servers so only one instance should be created per an application.

This instance handles multiplexing requests, throttling, and request retries automatically. The default implementation for browsers uses a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) connection, but it will fall back to a normal HTTP request strategy if WebSockets are not supported. The NodeJS implementation will always use HTTP requests.

```ts
import Metrics from '@keiser/metrics-sdk'

const metrics = new Metrics()
```

## Authentication
The base [`Metrics`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html) instance is a connection handler with access to only limited information. To access user specific information a [`UserSession`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/usersession.html) must be created by authenticating through one of the available mechanisms:

- [`authenticateWithCredentials`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticatewithcredentials) - Use email and password
- [`authenticateWithFacebook`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticateWithFacebook) - Use Facebook OAuth flow
- [`authenticateWithGoogle`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticateWithGoogle) - Use Google OAuth flow
- [`authenticateWithToken`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticateWithToken) - Use a stored refresh token string

```ts
const userSession = await metrics.authenticateWithCredentials({email: 'demo@keiser.com', password: 'password'})
```

The result of an authentication request is a [`UserSession`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/usersession.html) which contains methods for interacting with the user's data as well as mechanisms for controlling the session.

To log-out a user, call teh [`logout()`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/usersession.html#logout) method on the [`UserSession`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/usersession.html).

```ts
await userSession.logout()
```

To restore an authenticated session, store the refresh token string and use the [`authenticateWithToken`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticateWithToken) authentication mechanism to restore the session. The refresh token needs to be stored in a secure place that will persist between sessions (ie: [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)) and is valid for 90 days from it's creation.

```ts
const refreshTokenKey = 'refreshToken'
const userSession = await metrics.authenticateWithCredentials({email: 'demo@keiser.com', password: 'password'})

localStorage.setItem(refreshTokenKey, userSession.refreshToken)

userSession.onRefreshTokenChangeEvent.subscribe(({refreshToken}) => {
  // Will update token in local storage each time it is updated
  localStorage.setItem(refreshTokenKey, refreshToken)
})

// On next application start
const refreshToken = localStorage.getItem(refreshTokenKey)
const userSession = await metrics.authenticateWithToken({token: refreshToken})
```

## Accessing User Data
The [`UserSession`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/usersession.html) instance contains a [`user`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/usersession.html#user) property accessor for the authenticated user's [`User`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/user.html) class.

```ts
const userSession = await metrics.authenticateWithCredentials({email: 'demo@keiser.com', password: 'password'})

console.log(userSession.user.profile.name)
```

All properties exposed by the [`User`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/user.html) class and it's children are instances that are generated on access, so subsequent calls to the same property are not returning the exact same instance. It is recommended to keep accessed instances in scope using local references. This prevents memory leaks and improves performance when dealing with large data sets.

This means that separate instances will also be out of sync as changes to one instance will not be reflected in other instances. The `reload()` method available on most classes will bring the instance in sync with the current server state.

```ts
let userProfile1 = userSession.user.profile
let userProfile2 = userSession.user.profile

console.log(userProfile1 === userProfile2)           // Output: false
console.log(userProfile1.name === userProfile2.name) // Output: true

await userProfile1.update({name: 'Pickle Rick'})
console.log(userProfile1 === userProfile2)           // Output: false
console.log(userProfile1.name === userProfile2.name) // Output: false

await userProfile2.reload()
console.log(userProfile1 === userProfile2)           // Output: false
console.log(userProfile1.name === userProfile2.name) // Output: true
```

```ts
// Recommended usage example
function generateUsername(user: User) {
  const name = user.profile.name

  return name ? name.replace(/\s/, '_').toLowerCase() : 'unknown_username'
}
```

## Error Handling

All errors are handled by throwing inside the method call with the expectation of a [`try/catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) to catch the error.

All errors will be in the same format which includes a `code` value that can be used to determine the type of error, as well as a `message`.

```ts
let userSession
try {
  userSession = await metrics.authenticateWithCredentials({email: 'demo@keiser.com', password: 'wrongPassword'})
} catch (exception) {
  if (exception.error.code === 603) {
    this.userCredentialsIncorrect()
  }
}
```

### Common Errors

| Code | Name | Message |
| ---- | ---- | ------- |
| 601 | MissingParams | missing parameter(s) for action |
| 603 | InvalidCredentials | credentials do not match any active users |
| 604 | ValidationError | validation error in parameters |
| 605 | UnknownEntity | entity does not exist |
| 606 | DuplicateEntity | entity already exists |
| 621 | UnauthorizedResource | unauthorized to access resource |
| 625 | ActionPrevented | action cannot be performed |
| 630 | FacilityAccessControlError | action is prevented due to facility access control limitations |

A full list of errors is available here: [Metrics API Errors List](https://metrics-api.keiser.com/api?action=core:errors)

## Closing Connection

The base [`Metrics`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html) instance maintains an active connection until it is disposed, so it is recommended to dispose the connection by calling [`dispose()`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#dispose) once the connection is no longer needed.

```ts
metrics.dispose()
```

## Copyright and License
Copyright © 2020 [Keiser Corporation](http://keiser.com/).

The Keiser Metrics SDK source code and distributed package are made available through the [MIT license](LICENSE.md).

Using any of the APIs made available through the Keiser Metrics SDK to communicate with [Keiser Metrics](https://metrics.keiser.com) make you subject to the following agreements. Please read all documents in their entirety as they govern your use of the APIs and Keiser Metrics servers.
- [API Agreement](https://dev.keiser.com/api-agreement/)
- [Brand Guidelines for Developers](https://dev.keiser.com/brand-guidelines/)
