export async function limitedRunnerQueue<FunctionType> (collection: IterableIterator<FunctionType>, limit: number, runner: (iterate: FunctionType) => Promise<void>) {
  const subRunners = new Array(limit).fill(subRunner(collection, runner))
  await Promise.allSettled(subRunners)
}

async function subRunner<FunctionType> (collection: IterableIterator<FunctionType>, runner: (iterate: FunctionType) => Promise<void>) {
  let nextIterable = collection.next()
  while (nextIterable.done !== true) {
    await runner(nextIterable.value)
    nextIterable = collection.next()
  }
}
