执行流程

手动单步调试，我们来看看ReactDOM.render这一句方法到底调用了什么

```javascript
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="./react.development.js"></script>
    <script src="./react-dom.development.js"></script>
    <script>
      function App() {
        return React.createElement('div', null, '123')
      }

      const root = document.getElementById('root');

      debugger;
      ReactDOM.render(React.createElement(App), root);
    </script>
  </body>
  </html>
```

首先会去调用React.createElement去创建组件元素，紧接着进入到createElementWithValidation方法，验证传入的组件是否是合法的类型，如果合法，则会去调用createElement方法。通过这句代码进行调用

```javascript
  var element = createElement.apply(this, arguments);
```

这里的this指向React对象，arguments就是你传递给createElementWithValidation函数的参数

通过createElement函数创建出的element对象是这样的,以下为伪代码

```javascript
  type element = {
    $$typeof: Symbol(react.element)
    key: null
    props: {}
    ref: null
    type: function App(){ ... }
    _owner: null
    _store: { validated: false }
    _self: null
    _source: null
  }
```

创建了element之后，还会对传入的chilaren进行校验，也就是从你传入的第三个参数开始遍历检查， 调用的是validateChildKeys方法，React在调用createElementWithValidation方法的时候，参数分别是type， props，children。这里面的type就是你传入的根组件，在我们的例子中也就是App函数。在校验完children和props之后，返回创建好的element

创建好了element，再去调用ReactDOM上的render方法，正如上面的例子上写的，分别传入刚刚创建好的element，以及container，container就是我们的DOM节点对象，还可以传入第三个参数callback，但在我们的例子中并没有传入这个参数，所以暂时忽略。render方法的第一句就是会去检查container是不是一个合法的DOM元素。如果不是就会打印出警告。这里暂时忽略。

接下来render方法就会去调用一个叫legacyRenderSubtreeIntoContainer的方法，并且将这个方法的返回值return。也就是说render方法的返回值，就是legacyRenderSubtreeIntoContainer方法的返回值

调用legacyRenderSubtreeIntoContainer分别传入5个参数，我们去源代码里找出legacyRenderSubtreeIntoContainer看看它是怎么定义的

```javascript
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: DOMContainer,
  forceHydrate: boolean,
  callback: ?Function,
) {
  // TODO: Without `any` type, Flow says "Property cannot be accessed on any
  // member of intersection type." Whyyyyyy.
  let root: Root = (container._reactRootContainer: any);
  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    );
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = DOMRenderer.getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    // Initial mount should not be batched.
    DOMRenderer.unbatchedUpdates(() => {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback,
        );
      } else {
        root.render(children, callback);
      }
    });
  } else {
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = DOMRenderer.getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    // Update
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(
        parentComponent,
        children,
        callback,
      );
    } else {
      root.render(children, callback);
    }
  }
  return DOMRenderer.getPublicRootInstance(root._internalRoot);
}
```

有没有看到上面方法的定义，我最痛恨的就是这种方法。骚长～～～，这里面涉及到每个函数调用里面又包含n多调用。读这种函数调用心理负担很大。因为一个不留神就走不出来了，像迷宫。但我就不信这个邪，我就要死磕。我来一句一句的啃。首先看传入的5个参数

parentComponent从字面意思来看表示父组件，我们第一次调用的时候，传入的element就已经是根组件了，所以在首次调用这个方法时，parentComponent为null
children在这里表示的是子元素，第一次调用时，就把我们上面生成好的element传入即可
第三个container就是我们id为root的DOM节点对象
第四个forceHydrate和服务端渲染有关，一个boolean类型的值，这里传false，因为现在进行的是客户端的渲染。
第五个参数就是一个回调函数callback


首先方法调用的第一句

```javascript
  let root: Root = (container._reactRootContainer: any);
```

第一句就很懵逼，哪猫的_reactRootContainer，这是个啥呀。我们知道container是我们的DOM元素，如果它原生属性上有一个_reactRootContainer属性的话，那这几年前端就当我白学了。所以这肯定是React给DOM元素后加上去的属性。所以此时root肯定为undefined。继续往下执行。

```javascript
  if (!root) {
    ...
  } else {
    ...
  }

```

接下来就是对root进行判断，如果root为undefined，那!root就为真，就会去执行if里面的代码。首行代码如下


```javascript
  // Initial mount
  root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);
```

通过注释大概能猜到这句代码应该表示初次挂载，然后把legacyCreateRootFromDOMContainer方法的返回值赋予container._reactRootContainer和root。那么我们来看看legacyCreateRootFromDOMContainer函数的定义

这个函数在react-dom/client/ReactDOM.js里面

老规矩，日常搬代码，嘿嘿嘿~~~ 

```javascript
function legacyCreateRootFromDOMContainer(
  container: DOMContainer,
  forceHydrate: boolean,
): Root {
  const shouldHydrate =
    forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  // First clear any existing content.
  if (!shouldHydrate) {
    let warned = false;
    let rootSibling;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }
  }

  // Legacy roots are not async by default.
  const isConcurrent = false;
  return new ReactRoot(container, isConcurrent, shouldHydrate);
}
```

我还是把一些开发环境下的提示判断给删除了，要不然是在太多了。
我们还是先从函数参数讲起。

我就喜欢这样的函数定义，就俩参数，倍儿清爽。
首先第一个container，它依然就是我们ID为root的DOM元素对象
第二个forceHydrate依然和服务端渲染有关，这里传入的是false；
这个函数最后会返回一个Root类型的值。

开头第一句判断是否需要hydrate，这里显然返回为false。那么接下去就回去执行if代码块里的代码。if语句上面的注释表明，这一块操作就是要删除id为root的DOM元素里面的子元素。注意是全部子元素，也就是一个清空操作。执行完if代码块里的代码之后，跳出来继续执行。最后两句，定义了一个isConcurrent常量，注释上说明根节点默认不采取异步模式，我当前猜测这里应该和React之前提出的异步渲染有关系，但我还没有证据，先放到这里。最后一句就是new一个ReactRoot实例，并将其返回。这个返回的ReactRoot实例就是这一句root = container._reactRootContainer = legacyCreateRootFromDOMContainer的执行结果。
先不回到顶层，我们继续深入，看这个ReactRoot构造函数是如何定义的。

ReactRoot方法也是在react-dom/client/ReactDOM.js文件里，老规矩

```javascript
  function ReactRoot(
    container: Container,
    isConcurrent: boolean,
    hydrate: boolean,
  ) {
    const root = DOMRenderer.createContainer(container, isConcurrent, hydrate);
    this._internalRoot = root;
  }
```

首先说明参数，container依然是id为root的DOM元素，isConcurrent标识为false，hydrate这里也为false，进入函数体

首先调用DOMRenderer.createContainer方法，并将返回值赋给root常量。我们来看看createContainer方法的定义

DOMRenderer对象是在react-reconciler/inline.dom文件中。该文件就一句代码，导出了ReactFiberReconciler文件中的所有变量

```javascript
  export * from './src/ReactFiberReconciler';
```

我们再进入ReactFiberReconciler文件，找到createContainer方法，如下

```javascript
  export function createContainer(
    containerInfo: Container,
    isConcurrent: boolean,
    hydrate: boolean,
  ): OpaqueRoot {
    return createFiberRoot(containerInfo, isConcurrent, hydrate);
  }
```

依然说明下参数，第一个containerInfo还是id为root的DOM元素，isConcurrent标识为false，hydrate这里也为false，这个函数会去调用createFiberRoot方法，并将该方法的返回值进行返回，进入到createFiberRoot方法。这个函数是在react-reconciler/src/ReactFiberRoot.js文件里。

```javascript
export function createFiberRoot(
  containerInfo: any,
  isConcurrent: boolean,
  hydrate: boolean,
): FiberRoot {
  // Cyclic construction. This cheats the type system right now because
  // stateNode is any.
  const uninitializedFiber = createHostRootFiber(isConcurrent);

  let root;
  if (enableSchedulerTracing) {
    root = ({
      current: uninitializedFiber,
      containerInfo: containerInfo,
      pendingChildren: null,

      earliestPendingTime: NoWork,
      latestPendingTime: NoWork,
      earliestSuspendedTime: NoWork,
      latestSuspendedTime: NoWork,
      latestPingedTime: NoWork,

      didError: false,

      pendingCommitExpirationTime: NoWork,
      finishedWork: null,
      timeoutHandle: noTimeout,
      context: null,
      pendingContext: null,
      hydrate,
      nextExpirationTimeToWorkOn: NoWork,
      expirationTime: NoWork,
      firstBatch: null,
      nextScheduledRoot: null,

      interactionThreadID: unstable_getThreadID(),
      memoizedInteractions: new Set(),
      pendingInteractionMap: new Map(),
    }: FiberRoot);
  } else {
    root = ({
      current: uninitializedFiber,
      containerInfo: containerInfo,
      pendingChildren: null,

      earliestPendingTime: NoWork,
      latestPendingTime: NoWork,
      earliestSuspendedTime: NoWork,
      latestSuspendedTime: NoWork,
      latestPingedTime: NoWork,

      didError: false,

      pendingCommitExpirationTime: NoWork,
      finishedWork: null,
      timeoutHandle: noTimeout,
      context: null,
      pendingContext: null,
      hydrate,
      nextExpirationTimeToWorkOn: NoWork,
      expirationTime: NoWork,
      firstBatch: null,
      nextScheduledRoot: null,
    }: BaseFiberRootProperties);
  }

  uninitializedFiber.stateNode = root;

  // The reason for the way the Flow types are structured in this file,
  // Is to avoid needing :any casts everywhere interaction tracing fields are used.
  // Unfortunately that requires an :any cast for non-interaction tracing capable builds.
  // $FlowFixMe Remove this :any cast and replace it with something better.
  return ((root: any): FiberRoot);
}
```

首先第一句代码**const uninitializedFiber = createHostRootFiber(isConcurrent);**，调用了createHostRootFiber方法，我们看下这个方法的定义。这个方法定义在react-reconciler/src/ReactFiber.js文件中。

```javascript
export function createHostRootFiber(isConcurrent: boolean): Fiber {
  let mode = isConcurrent ? ConcurrentMode | StrictMode : NoContext;
  return createFiber(HostRoot, null, null, mode);
}
```

首先需要定义mode这个变量，我们isConcurrent传入的是false，所以在这里mode = NoContext, 这个NoContext是个二进制的常量，来自react-reconciler/src/ReactTypeOfMode.js文件中。这个文件一共导出了4个常量。

```javascript
  export const NoContext = 0b000;
  export const ConcurrentMode = 0b001;
  export const StrictMode = 0b010;
  export const ProfileMode = 0b100;
```

再回到createHostRootFiber方法中，此时我们的mode = 0b000， 然后我们去调用createFiber方法，并传入HostRoot, null, null, mode。 这个HostRoot又是个什么鬼。HostRoot定义在shared/ReactWorkTags文件中。其中HostRoot的定义为

```javascript
  export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
```

通过注释来解释是说这个常量表示一个主树的根，可以被嵌套在另一个节点中。这都哪跟哪啊。没看明白，唯一能看懂的只有一个3，谢谢。先别在这纠结，回到createHostRootFiber方法中，再进入到createFiber方法中。首先来看看createFiber的函数定义

```javascript
  // This is a constructor function, rather than a POJO constructor, still
  // please ensure we do the following:
  // 1) Nobody should add any instance methods on this. Instance methods can be
  //    more difficult to predict when they get optimized and they are almost
  //    never inlined properly in static compilers.
  // 2) Nobody should rely on `instanceof Fiber` for type testing. We should
  //    always know when it is a fiber.
  // 3) We might want to experiment with using numeric keys since they are easier
  //    to optimize in a non-JIT environment.
  // 4) We can easily go from a constructor to a createFiber object literal if that
  //    is faster.
  // 5) It should be easy to port this to a C struct and keep a C implementation
  //    compatible.
  const createFiber = function(
    tag: WorkTag,
    pendingProps: mixed,
    key: null | string,
    mode: TypeOfMode,
  ): Fiber {
    // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
    return new FiberNode(tag, pendingProps, key, mode);
  };
```

首先来看看参数，tag也就是上面我们传入的HostRoot常量，值为3，pendingProps和key传入的都为null，最后mode传入的值为NoContext，也就是0b000。
函数体内又调用了FiberNode的构造方法创建了一个Fiber实例。接下来再进入到FiberNode构造函数中一探究竟。

```javascript
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.firstContextDependency = null;

  this.mode = mode;

  // Effects
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.expirationTime = NoWork;
  this.childExpirationTime = NoWork;

  this.alternate = null;

  if (enableProfilerTimer) {
    this.actualDuration = 0;
    this.actualStartTime = -1;
    this.selfBaseDuration = 0;
    this.treeBaseDuration = 0;
  }
}
```

上面的代码根据我们的调用栈翻译过来也就是这样

```javascript
  // Instance
  this.tag = 3;
  this.key = null;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = null;  // 这里的pendingProps我们传入的为null
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.firstContextDependency = null;

  this.mode = 0; // mode传入的为0，因为二进制0b000转换为十进制就是为0

  // Effects
  this.effectTag = 0; // NoEffect来自shared/ReactSideEffectTags.js文件，这个也是一个二进制常量0b00000000000， 转换为十进制也是为0
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.expirationTime = 0; // NoWork常量定义在react-reconciler/ReactFiberExpirationTime.js文件中，值为0
  this.childExpirationTime = 0;

  this.alternate = null;

  // 以下代码会在性能监测时会用到，enableProfilerTimer定义在shared/ReactFeatureFlags文件中，它的值等于__PROFILE__，这个__PROFILE__应该是react通过构建工具去注入到源码中的变量
  // 在我们第一次执行过程中，该值为true，这个先暂且放到这里。在最新版本的react中，这里还有很长的一段注释，如下
  // Note: The following is done to avoid a v8 performance cliff.
  //
  // Initializing the fields below to smis and later updating them with
  // double values will cause Fibers to end up having separate shapes.
  // This behavior/bug has something to do with Object.preventExtension().
  // Fortunately this only impacts DEV builds.
  // Unfortunately it makes React unusably slow for some applications.
  // To work around this, initialize the fields below with doubles.
  //
  // Learn more about this here:
  // https://github.com/facebook/react/issues/14365
  // https://bugs.chromium.org/p/v8/issues/detail?id=8538
  // 
  // 注意：为了避免出现v8的性能瓶颈，请执行以下操作
  // 
  if (enableProfilerTimer) {
    this.actualDuration = Number.NaN;
    this.actualStartTime = Number.NaN;
    this.selfBaseDuration = Number.NaN;
    this.treeBaseDuration = Number.NaN;

    // It's okay to replace the initial doubles with smis after initialization.
    // This won't trigger the performance cliff mentioned above,
    // and it simplifies other profiler code (including DevTools).
    this.actualDuration = 0;
    this.actualStartTime = -1;
    this.selfBaseDuration = 0;
    this.treeBaseDuration = 0;
  }
```

执行过后，我们就得到了一个FiberNode对象，沿着调用栈一直往上回溯。回溯到createFiberRoot方法中，因为上述过程也仅仅是通过该函数中的第一行，调用createHostRootFiber方法产生的。这么“宝贵”的FiberNode对象最终赋予了uninitializedFiber变量。再往下执行，会去判断enableSchedulerTracing，enableSchedulerTracing定义在shared/ReactFeatureFlags文件中，它的值也为__PROFILE__，所以也是和性能监测有关。这里值也为true。接着走到if代码块里来定义我们的root这个变量。这个root变量也就是createFiberRoot方法最后要返回给上一步的FiberRoot对象。定义如下

```javascript
  root = {
    current: uninitializedFiber, // 这个current的值就是我们上面得到的FiberNode对象
    containerInfo: containerInfo, // id为root的DOM元素
    pendingChildren: null,

    earliestPendingTime: NoWork, // NoWork值全为0
    latestPendingTime: NoWork,
    earliestSuspendedTime: NoWork,
    latestSuspendedTime: NoWork,
    latestPingedTime: NoWork,

    pingCache: null,

    didError: false,

    pendingCommitExpirationTime: NoWork,
    finishedWork: null,
    timeoutHandle: noTimeout, // noTimeout定义在react-reconciler/ReactFiberHostConfig.js文件中，值为-1
    context: null,
    pendingContext: null,
    hydrate: hydrate, // 这里的hydrate为false，因为是客户端渲染
    nextExpirationTimeToWorkOn: NoWork,
    expirationTime: NoWork,
    firstBatch: null,
    nextScheduledRoot: null,

    interactionThreadID: unstable_getThreadID(), // 该函数同样也是与性能测试相关的，它会返回一个数字
    memoizedInteractions: new Set(),
    pendingInteractionMap: new Map()
  };
```
执行过后就完成了FiberRoot对象的定义，接下来会把FiberRoot对象赋值给uninitializedFiber对象的stateNode属性上。最后将FiberRoot对象return。
继续往上回溯，回溯到ReactRoot函数里，将返回的FiberRoot对象赋予this的_internalRoot属性上，这里的this指向ReactRoot函数的实例。

```javascript
  this._internalRoot = root;
```

继续往上回溯，直到legacyCreateRootFromDOMContainer函数中，在函数最后返回的就是ReactRoot的实例。

继续往上回溯，legacyRenderSubtreeIntoContainer方法中，还记得这里吗？也就是标记为初次挂载的这部分逻辑里，在这里我们定义了root变量，以及container._reactRootContainer，执行了这一句
root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);
接下来执行的是这段代码

```javascript
  if (typeof callback === 'function') {
    const originalCallback = callback;
    callback = function() {
      const instance = getPublicRootInstance(root._internalRoot);
      originalCallback.call(instance);
    };
  }
```

首次调用时，传入的callback为undefined，所以并不会执行上述代码块里的代码
接下来是这一段代码

```javascript
  // Initial mount should not be batched.
  unbatchedUpdates(() => {
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(
        parentComponent,
        children,
        callback,
      );
    } else {
      root.render(children, callback);
    }
  });
```

第一行注释说明初始化挂载不应该被批量更新处理，从定义的函数名unbatchedUpdates就能看得出。看看这个函数的定义

```javascript
  // TODO: Batching should be implemented at the renderer level, not inside
  // the reconciler.
  // 批量操作应该在渲染层实现，而不是在协调器里
  function unbatchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
    if (isBatchingUpdates && !isUnbatchingUpdates) {
      isUnbatchingUpdates = true;
      try {
        return fn(a);
      } finally {
        isUnbatchingUpdates = false;
      }
    }
    return fn(a);
  }
```
isBatchingUpdates和isUnbatchingUpdates是两个boolean值，初次渲染时两个值都为false，所以这里面的if代码块就不会执行，而是直接返回fn(a)的返回值。在我们传入的fn这个函数里，首先对parentComponent进行非空判断，第一次渲染时parentComponent为null，所以这里直接进入到了else部分，也就是调用了ReactRoot对象上的render方法。render方法定义在ReactRoot的原型上，如下

```javascript
  ReactRoot.prototype.render = function(
    children: ReactNodeList,
    callback: ?() => mixed,
  ): Work {
    const root = this._internalRoot;
    const work = new ReactWork();
    callback = callback === undefined ? null : callback;
    if (callback !== null) {
      work.then(callback);
    }
    updateContainer(children, root, null, work._onCommit);
    return work;
  };
```

这里children就是我们定义的App组件对象，callback这里为undefined，我们没有指定。首先第一句const root = this._internalRoot; 回顾上面返回FiberRoot的流程，这里的this._internalRoot就是我们之前得到的FiberRoot对象。然后实例化了一个ReactWork对象，来看看ReactWork的定义。

```javascript
  function ReactWork() {
    this._callbacks = null;
    this._didCommit = false;
    // TODO: Avoid need to bind by replacing callbacks in the update queue with
    // list of Work objects.
    this._onCommit = this._onCommit.bind(this);
  }
```

实例化之后，就会执行到updateContainer这个函数里，分别传入App组件对象，FiberRoot，null，以及ReactWork实例的bind方法。来看下具体定义。

```javascript
  function updateContainer(
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
    callback: ?Function,
  ): ExpirationTime {
    const current = container.current;
    const currentTime = requestCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, current);
    return updateContainerAtExpirationTime(
      element,
      container,
      parentComponent,
      expirationTime,
      callback,
    );
  }
```

来看函数体，第一句定义了一个常量current，还记得FiberRoot对象的current属性指向的是之前求得的FiberNode（RootFiber）对象吗，如果不记得，可以翻看下上面的过程。就是那个叫做**uninitializedFiber**的对象。
第二行会去调用requestCurrentTime方法获取一个时间，我们来看看这个函数的定义。它定义在react-reconciler/src/ReactFiberScheduler.js

```javascript
function requestCurrentTime() {
  if (isRendering) {
    return currentSchedulerTime;
  }
  findHighestPriorityRoot();
  if (
    nextFlushedExpirationTime === NoWork ||
    nextFlushedExpirationTime === Never
  ) {
    recomputeCurrentRendererTime();
    currentSchedulerTime = currentRendererTime;
    return currentSchedulerTime;
  }

  return currentSchedulerTime;
}
```

根据注释上的说明可知，调度器会去调用requestCurrentTime函数去计算出一个到期时间，进入到函数体。首先判断isRendering，如果为true则表示正在渲染，返回当前调度时间currentSchedulerTime，这个值最开始被初始化为currentRendererTime这个时间，而currentRendererTime这个时间是通过调用msToExpirationTime并传入当前时间算出的，

```javascript
  // 1 unit of expiration time represents 10ms.
  function msToExpirationTime(ms: number): ExpirationTime {
    // Always add an offset so that we don't clash with the magic number for NoWork.
    return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0);
  }
```

这里的ms我们传入的就是now()，可以理解为Date.now()的值。这里的MAX_SIGNED_31_BIT_INT定义为1073741823，这个值表示二进制0b111111111111111111111111111111的大小，含义就是最大的31位整数。32位系统中，V8所能表示的最大整数大小。上面的 ” | 0 “操作表示取整。翻译过来就是1073741823 - （(Date.now() / 10) | 0 .

先别在这纠结，回溯到requestCurrentTime函数中，紧接着就要执行findHighestPriorityRoot方法，从方法名来看是要去寻找最高优先级的根，来看看这个方法是干嘛的。

```javascript
function findHighestPriorityRoot() {
  let highestPriorityWork = NoWork; // NoWork为0
  let highestPriorityRoot = null;
  if (lastScheduledRoot !== null) { 
    let previousScheduledRoot = lastScheduledRoot;
    let root = firstScheduledRoot;
    while (root !== null) {
      const remainingExpirationTime = root.expirationTime;
      if (remainingExpirationTime === NoWork) {
        // This root no longer has work. Remove it from the scheduler.

        // TODO: This check is redudant, but Flow is confused by the branch
        // below where we set lastScheduledRoot to null, even though we break
        // from the loop right after.
        invariant(
          previousScheduledRoot !== null && lastScheduledRoot !== null,
          'Should have a previous and last root. This error is likely ' +
            'caused by a bug in React. Please file an issue.',
        );
        if (root === root.nextScheduledRoot) {
          // This is the only root in the list.
          root.nextScheduledRoot = null;
          firstScheduledRoot = lastScheduledRoot = null;
          break;
        } else if (root === firstScheduledRoot) {
          // This is the first root in the list.
          const next = root.nextScheduledRoot;
          firstScheduledRoot = next;
          lastScheduledRoot.nextScheduledRoot = next;
          root.nextScheduledRoot = null;
        } else if (root === lastScheduledRoot) {
          // This is the last root in the list.
          lastScheduledRoot = previousScheduledRoot;
          lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
          root.nextScheduledRoot = null;
          break;
        } else {
          previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot;
          root.nextScheduledRoot = null;
        }
        root = previousScheduledRoot.nextScheduledRoot;
      } else {
        if (remainingExpirationTime > highestPriorityWork) {
          // Update the priority, if it's higher
          highestPriorityWork = remainingExpirationTime;
          highestPriorityRoot = root;
        }
        if (root === lastScheduledRoot) {
          break;
        }
        if (highestPriorityWork === Sync) {
          // Sync is highest priority by definition so
          // we can stop searching.
          break;
        }
        previousScheduledRoot = root;
        root = root.nextScheduledRoot;
      }
    }
  }

  nextFlushedRoot = highestPriorityRoot;
  nextFlushedExpirationTime = highestPriorityWork;
}
```

首次看这个函数会发现这里面多了几个变量，这几个变量也是定义在ReactFiberScheduler.js文件中，算是文件内的全局变量。首先来看几个和findHighestPriorityRoot方法有关的。

```javascript
  let firstScheduledRoot: FiberRoot | null = null;
  let lastScheduledRoot: FiberRoot | null = null;
  let nextFlushedRoot: FiberRoot | null = null;
  let nextFlushedExpirationTime: ExpirationTime = NoWork;
```

这些变量在不同方法中可能会被重新赋值。

首次渲染的lastScheduledRoot变量为null， 所以if代码块里并不会执行，所以会直接执行最后两句。最后两句的执行结果是nextFlushedRoot = null， nextFlushedExpirationTime = 0。继续回溯到requestCurrentTime方法中，会执行到这句if判断(nextFlushedExpirationTime === NoWork || nextFlushedExpirationTime === Never)，在findHighestPriorityRoot函数中我们得到nextFlushedExpirationTime = 0，所以会进入到if代码块里，开始执行recomputeCurrentRendererTime()方法。

```javascript
  function recomputeCurrentRendererTime() {
    const currentTimeMs = now() - originalStartTimeMs;
    currentRendererTime = msToExpirationTime(currentTimeMs);
  }
```

originalStartTimeMs最开始被定义为 **let originalStartTimeMs: number = now();** 也就是说这个值在react bundle加载完毕后会打一个时间戳，这就是originalStartTimeMs，而在recomputeCurrentRendererTime函数的调用过程中，这个时候的now()与我们的originalStartTimeMs肯定是不同的，这样就算出了currentTimeMs这个时间差，然后经过msToExpirationTime的转化，就得到了currentRendererTime。currentRendererTime最开始也有定义，
let currentRendererTime:ExpirationTime = msToExpirationTime(originalStartTimeMs); 它是把第一次bundle加载时间传递进去了。同时将值赋予给currentSchedulerTime变量。所以说最开始currentSchedulerTime与currentRendererTime是相等的。

回溯到updateContainer方法，计算出一个当前渲染时间之后，开始执行computeExpirationForFiber方法

```javascript
function computeExpirationForFiber(currentTime: ExpirationTime, fiber: Fiber) {
  const priorityLevel = unstable_getCurrentPriorityLevel();
  let expirationTime;
  if (expirationContext !== NoWork) {
    // An explicit expiration context was set;
    expirationTime = expirationContext;
  } else if (isWorking) {
    if (isCommitting) {
      // Updates that occur during the commit phase should have sync priority
      // by default.
      expirationTime = Sync;
    } else {
      // Updates during the render phase should expire at the same time as
      // the work that is being rendered.
      expirationTime = nextRenderExpirationTime;
    }
  } else {
    // No explicit expiration context was set, and we're not currently
    // performing work. Calculate a new expiration time.
    if (fiber.mode & ConcurrentMode) {
      if (isBatchingInteractiveUpdates) {
        // This is an interactive update
        expirationTime = computeInteractiveExpiration(currentTime);
      } else {
        // This is an async update
        expirationTime = computeAsyncExpiration(currentTime);
      }
      // If we're in the middle of rendering a tree, do not update at the same
      // expiration time that is already rendering.
      if (nextRoot !== null && expirationTime === nextRenderExpirationTime) {
        expirationTime -= 1;
      }
    } else {
      // This is a sync update
      expirationTime = Sync;
    }
  }
  if (isBatchingInteractiveUpdates) {
    // This is an interactive update. Keep track of the lowest pending
    // interactive expiration time. This allows us to synchronously flush
    // all interactive updates when needed.
    if (
      lowestPriorityPendingInteractiveExpirationTime === NoWork ||
      expirationTime < lowestPriorityPendingInteractiveExpirationTime
    ) {
      lowestPriorityPendingInteractiveExpirationTime = expirationTime;
    }
  }
  return expirationTime;
}
```

unstable_getCurrentPriorityLevel函数的运行结果为3. 最终计算出了expirationTime的值。
然后回溯到updateContainer方法中，进入最后一句函数调用，也就是updateContainerAtExpirationTime，来看看这个函数的定义

```javascript
  function updateContainerAtExpirationTime(
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
    expirationTime: ExpirationTime,
    callback: ?Function,
  ) {
    // TODO: If this is a nested container, this won't be the root.
    const current = container.current;

    const context = getContextForSubtree(parentComponent);
    if (container.context === null) {
      container.context = context;
    } else {
      container.pendingContext = context;
    }

    return scheduleRootUpdate(current, element, expirationTime, callback);
  }
```

接收5个参数，App组件对象，FiberRoot，null，expirationTime，callback绑定函数。
首先从FiberRoot对象里取出current就是之前得到的uninitializedFiber，对，就是那个FiberNode对象。
然后是通过调用getContextForSubtree方法来获取context上下文，进入到getContextForSubtree方法中。

```javascript
  function getContextForSubtree(
    parentComponent: ?React$Component<any, any>,
  ): Object {
    if (!parentComponent) {
      return emptyContextObject;
    }

    const fiber = getInstance(parentComponent);
    const parentContext = findCurrentUnmaskedContext(fiber);

    if (fiber.tag === ClassComponent) {
      const Component = fiber.type;
      if (isLegacyContextProvider(Component)) {
        return processChildContext(fiber, Component, parentContext);
      }
    }

    return parentContext;
  }
```

在这里我们传给函数的parentComponent为null。所以这个函数直接返回了一个emptyContextObject对象。
这个对象就是一个空对象 emptyContextObject = {};
然后回溯到updateContainerAtExpirationTime方法中，进行if/else判断。我们的FiberRoot对象上的context属性此时确实是null，所以会进入到if代码块里。把空对象赋予FiberRoot对象上的context属性上。继续执行。
updateContainerAtExpirationTime函数的最后一句会返回一个值，该值又是scheduleRootUpdate方法的返回值，我们进入到函数定义。

```javascript
function scheduleRootUpdate(
  current: Fiber,
  element: ReactNodeList,
  expirationTime: ExpirationTime,
  callback: ?Function,
) {
  const update = createUpdate(expirationTime);
  // Caution: React DevTools currently depends on this property
  // being called "element".
  update.payload = {element};

  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    warningWithoutStack(
      typeof callback === 'function',
      'render(...): Expected the last optional `callback` argument to be a ' +
        'function. Instead received: %s.',
      callback,
    );
    update.callback = callback;
  }

  flushPassiveEffects();
  enqueueUpdate(current, update);
  scheduleWork(current, expirationTime);

  return expirationTime;
}
```
该函数接收4个参数，分别是上述的FiberNode对象，App组件对象，expirationTime过期时间，callback绑定函数。首先根据过期时间，去调用createUpdate方法。返回一个update对象，我们进入到createUpdate函数中。

```javascript
  function createUpdate(expirationTime: ExpirationTime): Update<*> {
    return {
      expirationTime: expirationTime,

      tag: UpdateState,
      payload: null,
      callback: null,

      next: null,
      nextEffect: null,
    };
  }
```

首先看这个UpdateState这个常量，它的值被定义为0. React还定义了其他几种更新类型，分别是：

```javascript
  var UpdateState = 0;
  var ReplaceState = 1;
  var ForceUpdate = 2;
  var CaptureUpdate = 3;
```

创建了Update对象之后，进行返回。回溯到上一层。执行了以下赋值操作。

```javascript
  update.payload = {element};
```

根据注释上的说明可知，React开发工具会用到这个element属性。
接下来是对callback的一个判断。

```javascript
  callback = callback === undefined ? null : callback;
```
我们在第一次执行时calllback是有值的，所以这一句执行过后callback没有变化。紧接着会将callback赋予给 update对象的callback属性上。
flushPassiveEffects暂且不说，直接看enqueueUpdate方法，

```javascript
function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
  // 惰性创建更新队列
  const alternate = fiber.alternate;
  let queue1;
  let queue2;
  if (alternate === null) {
    // There's only one fiber.
    queue1 = fiber.updateQueue;
    queue2 = null;
    if (queue1 === null) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
    }
  } else {
    // There are two owners.
    queue1 = fiber.updateQueue;
    queue2 = alternate.updateQueue;
    if (queue1 === null) {
      if (queue2 === null) {
        // Neither fiber has an update queue. Create new ones.
        queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
        queue2 = alternate.updateQueue = createUpdateQueue(
          alternate.memoizedState,
        );
      } else {
        // Only one fiber has an update queue. Clone to create a new one.
        queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
      }
    } else {
      if (queue2 === null) {
        // Only one fiber has an update queue. Clone to create a new one.
        queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
      } else {
        // Both owners have an update queue.
      }
    }
  }
  if (queue2 === null || queue1 === queue2) {
    // There's only a single queue.
    appendUpdateToQueue(queue1, update);
  } else {
    // There are two queues. We need to append the update to both queues,
    // while accounting for the persistent structure of the list — we don't
    // want the same update to be added multiple times.
    if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
      // One of the queues is not empty. We must add the update to both queues.
      appendUpdateToQueue(queue1, update);
      appendUpdateToQueue(queue2, update);
    } else {
      // Both queues are non-empty. The last update is the same in both lists,
      // because of structural sharing. So, only append to one of the lists.
      appendUpdateToQueue(queue1, update);
      // But we still need to update the `lastUpdate` pointer of queue2.
      queue2.lastUpdate = update;
    }
  }
}
```

首先会取出fiberNode对象上面的alternate属性，然后定义了两个队列变量。首次执行，alternate为null，所以进入到if里，进入到if之后，queue1和queue2都被赋值为null，因为fiberNode上的updateQueue也是null。所以会去调用createUpdateQueue创建一个更新队列。进入到createUpdateQueue一探究竟。

```javascript
function createUpdateQueue<State>(baseState: State): UpdateQueue<State> {
  const queue: UpdateQueue<State> = {
    baseState,
    firstUpdate: null,
    lastUpdate: null,
    firstCapturedUpdate: null,
    lastCapturedUpdate: null,
    firstEffect: null,
    lastEffect: null,
    firstCapturedEffect: null,
    lastCapturedEffect: null,
  };
  return queue;
}
```

本次传入的baseState是fiber.memoizedState，而本例中的fiber.memoizedState在首次渲染时为null。所以得到的queue对象所有属性对应的属性值权威null。回溯到enqueueUpdate方法。此时queue1和fiber.updateQueue都被赋值为刚才得到的queue对象。queue2依然为null，所以进入到下面一个if代码块里去执行appendUpdateToQueue方法，将我们传递进来的update对象追加到更新队列queue1里，来看看appendUpdateToQueue的定义。

```javascript
  function appendUpdateToQueue<State>(
    queue: UpdateQueue<State>,
    update: Update<State>,
  ) {
    // Append the update to the end of the list.
    if (queue.lastUpdate === null) {
      // Queue is empty
      queue.firstUpdate = queue.lastUpdate = update;
    } else {
      queue.lastUpdate.next = update;
      queue.lastUpdate = update;
    }
  }
```

首先queue1中的lastUpdate为null，于是进入到if代码块里，将update赋予queue1的firstUpdate和lastUpdate属性上。函数执行结束。