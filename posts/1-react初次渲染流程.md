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

