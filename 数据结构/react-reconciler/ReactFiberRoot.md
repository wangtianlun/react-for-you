```javascript
  type FiberRoot = {|
    // Any additional information from the host associated with this root.
    containerInfo: any,
    // 只有在持久化更新中会用到
    pendingChildren: any,
    // The currently active root fiber. This is the mutable root of the tree.
    // 当前激活的Root Fiber
    current: Fiber,

    // 优先级区分
    // 1) 未提交的任务
    // 2) 未提交被挂起的任务
    // 3) 未提交且可能被挂起的任务
    // 为了兼顾性能，我们不会去追踪每一个单独的阻塞等级
    // 最早和最新的在提交时被挂起的优先级
    earliestSuspendedTime: ExpirationTime,
    latestSuspendedTime: ExpirationTime,

    // 最早和最新不确定是否被挂起的优先级
    earliestPendingTime: ExpirationTime,
    latestPendingTime: ExpirationTime,

    // 最新的通过一个promise被resolve并且能够重新尝试的优先级
    latestPingedTime: ExpirationTime,

    pingCache:
      | WeakMap<Thenable, Set<ExpirationTime>>
      | Map<Thenable, Set<ExpirationTime>>
      | null,

    // 如果有错误被抛出，而且队列里没有更多的更新时，我们会在处理错误前尝试重新渲染整个root
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
    // 用来确定第一次挂载的时候是否需要融合
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