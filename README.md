# Keiser Metrics SDK Library
![Release](https://github.com/KeiserCorp/Keiser.Metrics.SDK/workflows/Release/badge.svg)

## Project
This library facilitates communication between the [Keiser Metrics API](https://metrics.keiser.com) and client software using a per-user authentication mechanism. Refer to the [Keiser Developer Zone](https://dev.keiser.com) for more details about interacting with the [Keiser Metrics API](https://metrics.keiser.com).

To play around with the SDK try out the [Keiser Metrics SDK REPL](https://repl.it/@KeiserDev/Metrics-SDK-Example).

To see the full SDK API view the [Keiser Metrics SDK API](https://keisercorp.github.io/Keiser.Metrics.SDK/).

## Installation
Install with [npm](https://www.npmjs.com/): `npm install @keiser/metrics-sdk`

## Usage
Import the library root class and instantiate a [`Metrics`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html) connection instance. Each instance maintains a connection to the Keiser Metrics servers so only one instance should be created per an application. This instance handles multiplexing requests, throttling, and request retries automatically.

```ts
import Metrics from '@keiser/metrics-sdk'

const metrics = new Metrics()
```

### Authentication

Create a [`UserSession`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/usersession.html) by authenticating the user using on the available mechanisms:
- [`authenticateWithCredentials`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticatewithcredentials) - Use email and password
- [`authenticateWithFacebook`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticateWithFacebook) - Use Facebook OAuth flow
- [`authenticateWithGoogle`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticateWithGoogle) - Use Google OAuth flow
- [`authenticateWithToken`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticateWithToken) - Use a stored refresh token string

```ts
 const userSession = await metrics.authenticateWithCredentials({email: 'demo@keiser.com', password: 'password'})
```

The [`UserSession`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/usersession.html) instance includes session specific methods and accessors that will be used for a majority of operations. The [`user`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/usersession.html#user) accessor returns an instance of the [`User`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/user.html) class.

```ts
const profile = userSession.user.profile
console.log(`Hello ${profile.name}!`)
```

### User Properties

All properties exposed by the [`User`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/user.html) class and it's children are generating instances on access, so subsequent calls to the same property are not returning the exact same instance. It is recommended to keep accessed instances in scope using local references. This prevents memory leaks and improves performance when dealing with large data sets.

```ts
let userProfile1 = userSession.user.profile
let userProfile2 = userSession.user.profile
console.log(userProfile1 === userProfile2)
// Will output: false
```

```ts
// Recommended usage example
function generateUsername(user: User) {
  const name = user.profile.name

  return name ? name.replace(/\s/, '_').toLowerCase() : 'unknown_username'
}
```

### Persisting Authentication

For maintaining the user authentication between sessions, store the refresh token string and use the [`authenticateWithToken`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#authenticateWithToken) authentication mechanism to start a new session for the same user. The refresh token needs to be stored in a secure place that will persist between sessions (ie: [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)).

```ts
const refreshTokenKey = 'refreshToken'
const userSession = await metrics.authenticateWithCredentials({email: 'demo@keiser.com', password: 'password'})

localStorage.setItem(refreshTokenKey, userSession.refreshToken)

userSession.onRefreshTokenChangeEvent.subscribe(({refreshToken}) => {
  // Will update token in local storage each time it is updated
  localStorage.setItem(refreshTokenKey, refreshToken)
})
```

### Closing Connection

The base [`Metrics`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html) instance maintains an active connection until it is disposed, so it is recommended to dispose the connection by calling [`dispose()`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/metrics.html#dispose) once the connection is no longer needed.

```ts
metrics.dispose()
```

## API
The full API is available for exploration at [Keiser Metrics SDK API](https://keisercorp.github.io/Keiser.Metrics.SDK/).

## Copyright and License
Copyright © 2020 [Keiser Corporation](http://keiser.com/) under the [MIT license](LICENSE.md).
