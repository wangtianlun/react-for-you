### DOMContainer（src/client/ReactDOM.js）

```javascript
  export type DOMContainer =
    | (Element & {
        _reactRootContainer: ?Root,
        _reactHasBeenPassedToCreateRootDEV: ?boolean,
      })
    | (Document & {
        _reactRootContainer: ?Root,
        _reactHasBeenPassedToCreateRootDEV: ?boolean,
      });
```

### Batch（src/client/ReactDOM.js）

```javascript
  type Batch = FiberRootBatch & {
    render(children: ReactNodeList): Work,
    then(onComplete: () => mixed): void,
    commit(): void,

    _root: Root,
    _hasChildren: boolean,
    _children: ReactNodeList,

    _callbacks: Array<() => mixed> | null,
    _didComplete: boolean,
  };
```

### Root（src/client/ReactDOM.js）

```javascript
  type Root = {
    render(children: ReactNodeList, callback: ?() => mixed): Work,
    unmount(callback: ?() => mixed): Work,
    legacy_renderSubtreeIntoContainer(
      parentComponent: ?React$Component<any, any>,
      children: ReactNodeList,
      callback: ?() => mixed,
    ): Work,
    createBatch(): Batch,

    _internalRoot: FiberRoot,
  };
```

### Work（src/client/ReactDOM.js）

```javascript
  type Work = {
    then(onCommit: () => mixed): void,
    _onCommit: () => void,
    _callbacks: Array<() => mixed> | null,
    _didCommit: boolean,
  };
```

### RootOptions（src/client/ReactDOM.js）

```javascript
  type RootOptions = {
    hydrate?: boolean,
  };
```

### ValueTracker（src/client/inputValueTracking.js）

```javascript
  type ValueTracker = {
    getValue(): string,
    setValue(value: string): void,
    stopTracking(): void,
  };
```

### WrapperState（src/client/inputValueTracking.js）

```javascript
  type WrapperState = {_valueTracker?: ?ValueTracker};
```

### ElementWithValueTracker（src/client/inputValueTracking.js）

```javascript
  type ElementWithValueTracker = HTMLInputElement & WrapperState;
```

### Type（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type Type = string;
```

### Props（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type Props = {
    autoFocus?: boolean,
    children?: mixed,
    hidden?: boolean,
    suppressHydrationWarning?: boolean,
    dangerouslySetInnerHTML?: mixed,
    style?: {
      display?: string,
    },
  };
```

### Container（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type Container = Element | Document;
```

### Instance（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type Instance = Element;
```

### TextInstance（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type TextInstance = Text;
```

### SuspenseInstance（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type SuspenseInstance = Comment;
```

### HydratableInstance（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type HydratableInstance = Instance | TextInstance | SuspenseInstance;
```

### PublicInstance（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type PublicInstance = Element | Text;
```

### HostContextDev（src/react-dom/ReactDOMHostConfig.js）

```javascript
  type HostContextDev = {
    namespace: string,
    ancestorInfo: mixed,
  };
```

### HostContextProd（src/react-dom/ReactDOMHostConfig.js）

```javascript
  type HostContextProd = string;
```

### HostContext（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type HostContext = HostContextDev | HostContextProd;
```

### UpdatePayload（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type UpdatePayload = Array<mixed>;
```

### ChildSet（src/react-dom/ReactDOMHostConfig.js）

```javascript 
  export type ChildSet = void; 
```

### TimeoutHandle（src/react-dom/ReactDOMHostConfig.js）
 
```javascript
  export type TimeoutHandle = TimeoutID;
```

### NoTimeout（src/react-dom/ReactDOMHostConfig.js）

```javascript
  export type NoTimeout = -1;
```


### InputWithWrapperState（src/react-dom/ReactDOMInput.js）

```javascript
  type InputWithWrapperState = HTMLInputElement & {
    _wrapperState: {
      initialValue: ToStringValue,
      initialChecked: ?boolean,
      controlled?: boolean,
    },
  };
```

### SelectWithWrapperState（src/react-dom/ReactDOMSelect.js）

```javascript
  type SelectWithWrapperState = HTMLSelectElement & {
    _wrapperState: {
      wasMultiple: boolean,
    },
  };
```

### TextAreaWithWrapperState（src/react-dom/ReactDOMTextarea.js）

```javascript
  type TextAreaWithWrapperState = HTMLTextAreaElement & {
    _wrapperState: {
      initialValue: ToStringValue,
    },
  };
```




