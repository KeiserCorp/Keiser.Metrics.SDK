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

When developing against a local deployment, or a mocking endpoint, configure the Metrics connection from the initial Metrics instantiation.

```ts
import Metrics from '@keiser/metrics-sdk'

const metrics = new Metrics({restEndpoint: 'http://localhost:8000/api', socketEndpoint: 'ws://localhost:8000/ws'})
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

## Model Association Structure
All model data is nested under it's parent associations in an tree structure stemming from the base session object (`UserSession`, `FacilitySession`). All model references are generated at access and will not be persisted in memory by the SDK so local references are necessary to persist data. Most associated data models will be accessed through `async` method calls with the prefix `get` for single model instantiations, and `list` for multiple model instantiations.

```ts
// Variable `strengthExercises` will be an array containing up to 20 instances of strength exercises with 'back' in the exercise alias (name)
const strengthExercises = await userSession.getStrengthExercises({ defaultAlias: 'back', limit: 20 })

// Variable `strengthExercise` will contain a single strength exercise instance with 'id' equal to 1000
const strengthExercise = await userSession.getStrengthExercise({ id: 1000 })
```

## Paginated Data
All plural [`User`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/user.html) data methods (ex: [`user.getEmailAddresses()`](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/emailaddresses.html)) will return an ordered array of class instances. These arrays have an extended `meta` property which contains the parameters used to query the array, the sorting properties, and a `totalCount` property which is the total number of instances associated with the parent class. By default these method will limit responses to `20` instances.

```ts
// Default call will return 20 entities with uncertain sorting
const emailAddresses = await user.getEmailAddresses()

// Will return 10 entities, sorted by Email property in ascending order, starting at ordered entity 1 (first)
const firstPageOfEmailAddresses = await user.getEmailAddresses({sort: EmailAddressSorting.Email, ascending: true, limit: 10, offset: 0})
const totalNumberOfEmailAddresses = emailAddresses.meta.totalCount

// Same sorting as previous call, but now will return the elements starting at ordered entity 31 (3rd page of entities)
const thirdPageOfEmailAddresses = await user.getEmailAddresses({sort: EmailAddressSorting.Email, ascending: true, limit: 10, offset: 30})

// Will return 10 entities that contain "@gmail.com", sorted and ordered
const searchResultEmailAddresses = await user.getEmailAddresses({email: '@gmail.com', sort: EmailAddressSorting.Email, ascending: true, limit: 10, offset: 0})
```

## Updating Data
All data models and properties are externally immutable and act as functional data structures (_though the implementation is not purely functional_). Properties will change with calls to methods on the model (`update`, `reload`, `delete`). These mutating methods will always return a mutated instance of the model, but the existing model instance will also be mutated in place. There are no events emitted on mutation.

This restriction on direct property mutation preserves the integrity of the data within the SDK by ensuring the data always represents the actual data in the Metrics server.

```ts
// This will result in an error
user.profile.name = 'Rick Sanchez'

// Instead, issue an update
console.log(user.profile.name) // Outputs: 'Richard Sanchez'

await user.profile.update({ ...user.profile, name: 'Rick Sanchez' })

console.log(user.profile.name) // Outputs: 'Rick Sanchez'
```

Update calls are always full replacements of the model, so properties not included in the `update` parameters will be cast to `null` in the data model. Best practice is to expand the model and then override the property changes in the new model instance to ensure there is no unintended data loss.

```ts
// Performing an update with a partial property will result in loss of other properties.
console.log(user.profile.language) // Outputs: 'en'

await user.profile.update({ name: 'Rick Sanchez' })

console.log(user.profile.language) // Outputs: null

// Instead, expand the model to ensure that data is not lost
console.log(user.profile.language) // Outputs: 'en'

await user.profile.update({ ...user.profile, name: 'Rick Sanchez' })

console.log(user.profile.language) // Outputs: 'en'
```

## Error Handling
All errors are handled by throwing inside the method call with the expectation of a [`try/catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) to catch the error.

All errors will be thrown as a typed error instance corresponding to the reason for the error, with the global [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) as the base instance, and an intermediate category type inheritance (for easier bucketing).

```ts
let userSession
try {
  userSession = await metrics.authenticateWithCredentials({email: 'demo@keiser.com', password: 'wrongPassword'})
} catch (error) {
  if (error instanceof RequestError) {
    if (error instanceof InvalidCredentialsError) {
      this.userCredentialsIncorrect()
    } else if (error instanceof ValidationError) {
      this.userCredentialsValidationError()
    }
  } else if (error instanceof ServerError) {
    this.serverDown()
  }
}
```

### Error Categories
| Name                                                                                       | Reason                                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| [Request](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/requesterror.html)       | Issue with the parameters provided for the request           |
| [Session](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/sessionerror.html)       | Issue with the session instance (session is no longer valid) |
| [Server](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/servererror.html)         | Issue with the server (potentially overloaded or offline)    |
| [Connection](https://keisercorp.github.io/Keiser.Metrics.SDK/classes/connectionerror.html) | Issue with connection to server                              |

### Common Errors
| Name                    | Category | Reason                                                                     |
| ----------------------- | -------- | -------------------------------------------------------------------------- |
| Missing Params          | Request  | Parameters are missing from action (potentially `null` or `undefined`)     |
| Invalid Credentials     | Request  | Invalid login credentials (don't match any active user)                    |
| Validation              | Request  | Parameters are present but do not pass validation                          |
| Unknown Entity          | Request  | Request target does not exist (deleted or never existed)                   |
| Duplicate Entity        | Request  | Cannot create a new instance because identical one exists                  |
| Unauthorized Resource   | Request  | Insufficient permissions to access the target                              |
| Action Prevented        | Request  | Request cannot be performed for reason other than those above (edge cases) |
| Facility Access Control | Request  | Request is prevented due to facility access control limitations            |

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
