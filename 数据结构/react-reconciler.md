### Fiber（react-reconciler/src/ReactFiber.js）

```javascript
export type Fiber = {|
  tag: WorkTag,

  key: null | string,

  elementType: any,

  type: any,

  stateNode: any,

  return: Fiber | null,

  child: Fiber | null,
  sibling: Fiber | null,
  index: number,

  ref: null | (((handle: mixed) => void) & {_stringRef: ?string}) | RefObject,

  pendingProps: any, 
  memoizedProps: any, 

  updateQueue: UpdateQueue<any> | null,

  memoizedState: any,

  contextDependencies: ContextDependencyList | null,

  mode: TypeOfMode,

  effectTag: SideEffectTag,

  nextEffect: Fiber | null,

  firstEffect: Fiber | null,
  lastEffect: Fiber | null,

  expirationTime: ExpirationTime,

  childExpirationTime: ExpirationTime,

  alternate: Fiber | null,

  actualDuration?: number,

  actualStartTime?: number,

  selfBaseDuration?: number,

  treeBaseDuration?: number,

  _debugID?: number,
  _debugSource?: Source | null,
  _debugOwner?: Fiber | null,
  _debugIsCurrentlyTiming?: boolean,

  _debugHookTypes?: Array<HookType> | null,
|};
```

### ExpirationTime

```javascript
  export type ExpirationTime = number;
```

### BaseFiberRootProperties

```javascript
type BaseFiberRootProperties = {|
  containerInfo: any,

  pendingChildren: any,

  current: Fiber,

  earliestSuspendedTime: ExpirationTime,
  latestSuspendedTime: ExpirationTime,

  earliestPendingTime: ExpirationTime,
  latestPendingTime: ExpirationTime,

  latestPingedTime: ExpirationTime,

  pingCache:
    | WeakMap<Thenable, Set<ExpirationTime>>
    | Map<Thenable, Set<ExpirationTime>>
    | null,

  didError: boolean,

  pendingCommitExpirationTime: ExpirationTime,

  finishedWork: Fiber | null,

  timeoutHandle: TimeoutHandle | NoTimeout,

  context: Object | null,
  pendingContext: Object | null,

  +hydrate: boolean,

  nextExpirationTimeToWorkOn: ExpirationTime,
  expirationTime: ExpirationTime,

  firstBatch: Batch | null,

  nextScheduledRoot: FiberRoot | null,
|};
```

### ProfilingOnlyFiberRootProperties

```javascript
  type ProfilingOnlyFiberRootProperties = {|
    interactionThreadID: number,
    memoizedInteractions: Set<Interaction>,
    pendingInteractionMap: PendingInteractionMap,
  |};
```

### FiberRoot

```javascript
  export type FiberRoot = {
    ...BaseFiberRootProperties,
    ...ProfilingOnlyFiberRootProperties,
  };
```

### ReactElement（shared/ReactElementType.js）

```javascript
  export type ReactElement = {
    $$typeof: any,
    type: any,
    key: any,
    ref: any,
    props: any,
    _owner: any,

    _store: {
      validated: boolean,
    },
    _self: React$Element<any>,
    _shadowChildren: any,
    _source: Source,
  };
```

### Source

```javascript
  export type Source = {
    fileName: string,
    lineNumber: number,
  };
```

### ReactNode

```javascript
  export type ReactNode =
    | React$Element<any>
    | ReactPortal
    | ReactText
    | ReactFragment
    | ReactProvider<any>
    | ReactConsumer<any>;
```

### ReactEmpty

```javascript
  export type ReactEmpty = null | void | boolean;
```

### ReactFragment

```javascript
  export type ReactFragment = ReactEmpty | Iterable<React$Node>;
```

### ReactNodeList

```javascript
  export type ReactNodeList = ReactEmpty | React$Node;
```

### ReactText

```javascript
  export type ReactText = string | number;
```

### ReactProvider

```javascript
  export type ReactProvider<T> = {
    $$typeof: Symbol | number,
    type: ReactProviderType<T>,
    key: null | string,
    ref: null,
    props: {
      value: T,
      children?: ReactNodeList,
    },
  };
```

### ReactProviderType

```javascript
  export type ReactProviderType<T> = {
    $$typeof: Symbol | number,
    _context: ReactContext<T>,
  };
```

### ReactConsumer

```javascript
  export type ReactConsumer<T> = {
    $$typeof: Symbol | number,
    type: ReactContext<T>,
    key: null | string,
    ref: null,
    props: {
      children: (value: T) => ReactNodeList,
      unstable_observedBits?: number,
    },
  };
```

### ReactContext

```javascript
  export type ReactContext<T> = {
    $$typeof: Symbol | number,
    Consumer: ReactContext<T>,
    Provider: ReactProviderType<T>,

    _calculateChangedBits: ((a: T, b: T) => number) | null,

    _currentValue: T,
    _currentValue2: T,
    _threadCount: number,

    _currentRenderer?: Object | null,
    _currentRenderer2?: Object | null,
  };
```

### ReactPortal（shared/ReactTypes）

```javascript
  export type ReactPortal = {
    $$typeof: Symbol | number,
    key: null | string,
    containerInfo: any,
    children: ReactNodeList,
    implementation: any,
  };
```

### RefObject

```javascript
  export type RefObject = {|
    current: any,
  |};
```

### Thenable

```javascript
  export type Thenable<T, R> = {
    then(resolve: (T) => mixed, reject: (mixed) => mixed): R,
  };
```

### LazyComponent

```javascript
  export type LazyComponent<T> = {
    $$typeof: Symbol | number,
    _ctor: () => Thenable<{default: T}, mixed>,
    _status: 0 | 1 | 2,
    _result: any,
  };
```

### ResolvedLazyComponent

```javascript
  type ResolvedLazyComponent<T> = {
    $$typeof: Symbol | number,
    _ctor: () => Thenable<{default: T}, mixed>,
    _status: 1,
    _result: any,
  };
```

### Batch

```javascript
  export type Batch = {
    _defer: boolean,
    _expirationTime: ExpirationTime,
    _onComplete: () => mixed,
    _next: Batch | null,
  };
```

### PendingInteractionMap

```javascript
  export type PendingInteractionMap = Map<ExpirationTime, Set<Interaction>>;
```

### CapturedValue（react-reconciler/ReactCapturedValue.js）

```javascript
  export type CapturedValue<T> = {
    value: T,
    source: Fiber | null,
    stack: string | null,
  };
```

### CapturedError（react-reconciler/src/ReactCapturedValue.js）

```javascript
  export type CapturedError = {
    componentName: ?string,
    componentStack: string,
    error: mixed,
    errorBoundary: ?Object,
    errorBoundaryFound: boolean,
    errorBoundaryName: string | null,
    willRetry: boolean,
  };
```

### LifeCyclePhase（react-reconciler/src/ReactCurrentFiber.js）

```javascript
  type LifeCyclePhase = 'render' | 'getChildContext';
```

### MeasurementPhase（react-reconciler/src/ReactDebugFiberPerf.js）

```javascript
  type MeasurementPhase =
    | 'componentWillMount'
    | 'componentWillUnmount'
    | 'componentWillReceiveProps'
    | 'shouldComponentUpdate'
    | 'componentWillUpdate'
    | 'componentDidUpdate'
    | 'componentDidMount'
    | 'getChildContext'
    | 'getSnapshotBeforeUpdate';
```

### Dispatcher（react-reconciler/src/ReactFiberHooks.js）

```javascript
  export type Dispatcher = {
    readContext<T>(
      context: ReactContext<T>,
      observedBits: void | number | boolean,
    ): T,
    useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>],
    useReducer<S, I, A>(
      reducer: (S, A) => S,
      initialArg: I,
      init?: (I) => S,
    ): [S, Dispatch<A>],
    useContext<T>(
      context: ReactContext<T>,
      observedBits: void | number | boolean,
    ): T,
    useRef<T>(initialValue: T): {current: T},
    useEffect(
      create: () => (() => void) | void,
      deps: Array<mixed> | void | null,
    ): void,
    useLayoutEffect(
      create: () => (() => void) | void,
      deps: Array<mixed> | void | null,
    ): void,
    useCallback<T>(callback: T, deps: Array<mixed> | void | null): T,
    useMemo<T>(nextCreate: () => T, deps: Array<mixed> | void | null): T,
    useImperativeHandle<T>(
      ref: {current: T | null} | ((inst: T | null) => mixed) | null | void,
      create: () => T,
      deps: Array<mixed> | void | null,
    ): void,
    useDebugValue<T>(value: T, formatterFn: ?(value: T) => mixed): void,
  };
```

### Update（react-reconciler/src/ReactFiberHooks.js）

```javascript
  type Update<S, A> = {
    expirationTime: ExpirationTime,
    action: A,
    eagerReducer: ((S, A) => S) | null,
    eagerState: S | null,
    next: Update<S, A> | null,
  };
```

### UpdateQueue（react-reconciler/src/ReactFiberHooks.js）

```javascript
  type UpdateQueue<S, A> = {
    last: Update<S, A> | null,
    dispatch: (A => mixed) | null,
    lastRenderedReducer: ((S, A) => S) | null,
    lastRenderedState: S | null,
  };
```

### HookType（react-reconciler/src/ReactFiberHooks.js）

```javascript
  export type HookType =
    | 'useState'
    | 'useReducer'
    | 'useContext'
    | 'useRef'
    | 'useEffect'
    | 'useLayoutEffect'
    | 'useCallback'
    | 'useMemo'
    | 'useImperativeHandle'
    | 'useDebugValue';
```

### Hook（react-reconciler/src/ReactFiberHooks.js）

```javascript
  export type Hook = {
    memoizedState: any,

    baseState: any,
    baseUpdate: Update<any, any> | null,
    queue: UpdateQueue<any, any> | null,

    next: Hook | null,
  };
```

### Effect（react-reconciler/src/ReactFiberHooks.js）

```javascript
  type Effect = {
    tag: HookEffectTag,
    create: () => (() => void) | void,
    destroy: (() => void) | void,
    deps: Array<mixed> | null,
    next: Effect,
  };
```

### FunctionComponentUpdateQueue（react-reconciler/src/ReactFiberHooks.js）

```javascript
  export type FunctionComponentUpdateQueue = {
    lastEffect: Effect | null,
  };
```

### BasicStateAction（react-reconciler/src/ReactFiberHooks.js）

```javascript
  type BasicStateAction<S> = (S => S) | S;
```

### Dispatch（react-reconciler/src/ReactFiberHooks.js）

```javascript
  type Dispatch<A> = A => void;
```

### ContextDependencyList（react-reconciler/src/ReactFiberNewContext.js）

```javascript
  export type ContextDependencyList = {
    first: ContextDependency<mixed>,
    expirationTime: ExpirationTime,
  };
```

### ContextDependency（react-reconciler/src/ReactFiberNewContext.js）

```javascript
  type ContextDependency<T> = {
    context: ReactContext<T>,
    observedBits: number,
    next: ContextDependency<mixed> | null,
  };
```

### OpaqueRoot（react-reconciler/src/ReactFiberReconciler.js）

```javascript
  type OpaqueRoot = FiberRoot;
```

### BundleType（react-reconciler/src/ReactFiberReconciler.js）

```javascript
  type BundleType = 0 | 1;
```

### DevToolsConfig（react-reconciler/src/ReactFiberReconciler.js）

```javascript
  type DevToolsConfig = {|
    bundleType: BundleType,
    version: string,
    rendererPackageName: string,
    findFiberByHostInstance?: (instance: Instance | TextInstance) => Fiber,
    getInspectorDataForViewTag?: (tag: number) => Object,
  |};
```

### StackCursor（src/ReactFiberStack.js）

```javascript
  export type StackCursor<T> = {
    current: T,
  };
```

### SuspenseState（src/ReactFiberSuspenseComponent.js）

```javascript
  export type SuspenseState = {|
    timedOutAt: ExpirationTime,
  |};
```

### HookEffectTag（src/ReactHookEffectTags.js）

```javascript
  export type HookEffectTag = number;
```

### ProfilerTimer（src/ReactProfilerTimer.js）

```javascript
  export type ProfilerTimer = {
    getCommitTime(): number,
    recordCommitTime(): void,
    startProfilerTimer(fiber: Fiber): void,
    stopProfilerTimerIfRunning(fiber: Fiber): void,
    stopProfilerTimerIfRunningAndRecordDelta(fiber: Fiber): void,
  };
```

### LIFECYCLE（src/ReactStrictModeWarnings.js）

```javascript
  type LIFECYCLE =
    | 'UNSAFE_componentWillMount'
    | 'UNSAFE_componentWillReceiveProps'
    | 'UNSAFE_componentWillUpdate';
```

### LifecycleToComponentsMap（src/ReactStrictModeWarnings.js）

```javascript
  type LifecycleToComponentsMap = {[lifecycle: LIFECYCLE]: Array<Fiber>};
```

### FiberToLifecycleMap（src/ReactStrictModeWarnings.js）

```javascript
  type FiberToLifecycleMap = Map<Fiber, LifecycleToComponentsMap>;
```

### FiberArray（src/ReactStrictModeWarnings.js）

```javascript
  type FiberArray = Array<Fiber>;
```

### FiberToFiberComponentsMap（src/ReactStrictModeWarnings.js）

```javascript
  type FiberToFiberComponentsMap = Map<Fiber, FiberArray>;
```

### TypeOfMode（src/ReactTypeOfMode.js）

```javascript
  export type TypeOfMode = number;
```

### Update（src/ReactUpdateQueue.js）

```javascript
  export type Update<State> = {
    expirationTime: ExpirationTime,

    tag: 0 | 1 | 2 | 3,
    payload: any,
    callback: (() => mixed) | null,

    next: Update<State> | null,
    nextEffect: Update<State> | null,
  };
```

### UpdateQueue（src/ReactUpdateQueue.js）

```javascript
  export type UpdateQueue<State> = {
    baseState: State,

    firstUpdate: Update<State> | null,
    lastUpdate: Update<State> | null,

    firstCapturedUpdate: Update<State> | null,
    lastCapturedUpdate: Update<State> | null,

    firstEffect: Update<State> | null,
    lastEffect: Update<State> | null,

    firstCapturedEffect: Update<State> | null,
    lastCapturedEffect: Update<State> | null,
  };
```