```javascript
  type FiberRoot = {|
    // Any additional information from the host associated with this root.
    containerInfo: any,
    // 只有在持久化更新中会用到
    pendingChildren: any,
    // The currently active root fiber. This is the mutable root of the tree.
    current: Fiber,

    // The following priority levels are used to distinguish between 1)
    // uncommitted work, 2) uncommitted work that is suspended, and 3) uncommitted
    // work that may be unsuspended. We choose not to track each individual
    // pending level, trading granularity for performance.
    //
    // The earliest and latest priority levels that are suspended from committing.
    earliestSuspendedTime: ExpirationTime,
    latestSuspendedTime: ExpirationTime,
    // The earliest and latest priority levels that are not known to be suspended.
    earliestPendingTime: ExpirationTime,
    latestPendingTime: ExpirationTime,
    // The latest priority level that was pinged by a resolved promise and can
    // be retried.
    latestPingedTime: ExpirationTime,

    pingCache:
      | WeakMap<Thenable, Set<ExpirationTime>>
      | Map<Thenable, Set<ExpirationTime>>
      | null,

    // If an error is thrown, and there are no more updates in the queue, we try
    // rendering from the root one more time, synchronously, before handling
    // the error.
    didError: boolean,

    pendingCommitExpirationTime: ExpirationTime,
    // A finished work-in-progress HostRoot that's ready to be committed.
    finishedWork: Fiber | null,
    // Timeout handle returned by setTimeout. Used to cancel a pending timeout, if
    // it's superseded by a new one.
    timeoutHandle: TimeoutHandle | NoTimeout,
    // Top context object, used by renderSubtreeIntoContainer
    context: Object | null,
    pendingContext: Object | null,
    // Determines if we should attempt to hydrate on the initial mount
    +hydrate: boolean,
    // Remaining expiration time on this root.
    // TODO: Lift this into the renderer
    nextExpirationTimeToWorkOn: ExpirationTime,
    expirationTime: ExpirationTime,
    // List of top-level batches. This list indicates whether a commit should be
    // deferred. Also contains completion callbacks.
    // TODO: Lift this into the renderer
    firstBatch: Batch | null,
    // Linked-list of roots
    nextScheduledRoot: FiberRoot | null,


    // The following attributes are only used by interaction tracing builds.
    // They enable interactions to be associated with their async work,
    // And expose interaction metadata to the React DevTools Profiler plugin.
    // Note that these attributes are only defined when the enableSchedulerTracing flag is enabled.
    interactionThreadID: number,
    memoizedInteractions: Set<Interaction>,
    pendingInteractionMap: PendingInteractionMap,
  |};
```