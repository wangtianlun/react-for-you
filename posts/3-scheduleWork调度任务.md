接着第一篇结尾，沿着appendUpdateToQueue函数往上回溯，回溯到scheduleRootUpdate函数的最后一个函数调用scheduleWork函数。

```javascript
function scheduleWork(fiber: Fiber, expirationTime: ExpirationTime) {
  const root = scheduleWorkToRoot(fiber, expirationTime);
  if (root === null) {
    return;
  }

  if (
    !isWorking &&
    nextRenderExpirationTime !== NoWork &&
    expirationTime > nextRenderExpirationTime
  ) {
    // This is an interruption. (Used for performance tracking.)
    interruptedBy = fiber;
    resetStack();
  }
  markPendingPriorityLevel(root, expirationTime);
  if (
    // If we're in the render phase, we don't need to schedule this root
    // for an update, because we'll do it before we exit...
    !isWorking ||
    isCommitting ||
    // ...unless this is a different root than the one we're rendering.
    nextRoot !== root
  ) {
    const rootExpirationTime = root.expirationTime;
    requestWork(root, rootExpirationTime);
  }
  if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
    // Reset this back to zero so subsequent updates don't throw.
    nestedUpdateCount = 0;
    invariant(
      false,
      'Maximum update depth exceeded. This can happen when a ' +
        'component repeatedly calls setState inside ' +
        'componentWillUpdate or componentDidUpdate. React limits ' +
        'the number of nested updates to prevent infinite loops.',
    );
  }
}

```

```javascript
function scheduleWorkToRoot(fiber: Fiber, expirationTime): FiberRoot | null {
  recordScheduleUpdate();

  // Update the source fiber's expiration time
  if (fiber.expirationTime < expirationTime) {
    fiber.expirationTime = expirationTime;
  }
  let alternate = fiber.alternate;
  if (alternate !== null && alternate.expirationTime < expirationTime) {
    alternate.expirationTime = expirationTime;
  }
  // Walk the parent path to the root and update the child expiration time.
  let node = fiber.return;
  let root = null;
  if (node === null && fiber.tag === HostRoot) {
    root = fiber.stateNode;
  } else {
    while (node !== null) {
      alternate = node.alternate;
      if (node.childExpirationTime < expirationTime) {
        node.childExpirationTime = expirationTime;
        if (
          alternate !== null &&
          alternate.childExpirationTime < expirationTime
        ) {
          alternate.childExpirationTime = expirationTime;
        }
      } else if (
        alternate !== null &&
        alternate.childExpirationTime < expirationTime
      ) {
        alternate.childExpirationTime = expirationTime;
      }
      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode;
        break;
      }
      node = node.return;
    }
  }

  if (enableSchedulerTracing) {
    if (root !== null) {
      const interactions = __interactionsRef.current;
      if (interactions.size > 0) {
        const pendingInteractionMap = root.pendingInteractionMap;
        const pendingInteractions = pendingInteractionMap.get(expirationTime);
        if (pendingInteractions != null) {
          interactions.forEach(interaction => {
            if (!pendingInteractions.has(interaction)) {
              // Update the pending async work count for previously unscheduled interaction.
              interaction.__count++;
            }

            pendingInteractions.add(interaction);
          });
        } else {
          pendingInteractionMap.set(expirationTime, new Set(interactions));

          // Update the pending async work count for the current interactions.
          interactions.forEach(interaction => {
            interaction.__count++;
          });
        }

        const subscriber = __subscriberRef.current;
        if (subscriber !== null) {
          const threadID = computeThreadID(
            expirationTime,
            root.interactionThreadID,
          );
          subscriber.onWorkScheduled(interactions, threadID);
        }
      }
    }
  }
  return root;
}
```

这个方法的目的是根据传入的Fiber节点，向上去寻找它所对应的FiberRoot并返回。在向上寻找的过程中，由于Fiber对象有return属性，指向它的父级Fiber对象，而每一级Fiber对象上都有childExpirationTime属性，在while循环中会根据该方法传入的expirationTime同每一级Fiber对象的childExpirationTime属性进行比较，因为对于expirationTime来说，值越小就意味着优先级越高，所以如果childExpirationTime大于expirationTime，那么该Fiber对象上的childExpirationTime将被重置为expirationTime。

scheduleWork方法中还有一个resetStack方法，它的方法定义为

```javascript
  function resetStack() {
    if (nextUnitOfWork !== null) {
      let interruptedWork = nextUnitOfWork.return;
      while (interruptedWork !== null) {
        unwindInterruptedWork(interruptedWork);
        interruptedWork = interruptedWork.return;
      }
    }

    nextRoot = null;
    nextRenderExpirationTime = NoWork;
    nextLatestAbsoluteTimeoutMs = -1;
    nextRenderDidError = false;
    nextUnitOfWork = null;
  }
```
nextUnitOfWork是一个全局变量，它代表下一个要工作的Fiber节点。这个后续在介绍renderRoot的过程中会详细说明，resetStack首先判断nextUnitOfWork是否为null，如果不为null，就定义了一个interruptedWork变量，然后通过while循环依次向上寻找它的祖先Fiber节点，并在到达RootFiber节点时跳出循环，那这时，interruptedWork就指向RootFiber节点。每次while循环都会去调用unwindInterruptedWork方法，并且会把当前得到的interruptedWork传递进去，unwindInterruptedWork方法里面会判断interruptedWork的tag属性，因为interruptedWork就是Fiber对象，Fiber对象上都会有tag标志。根据不同的tag会对context对象做些处理，这里只简单提一下，会单独抽出来一章对context进行说明。resetStack之后，是对几个全局变量的赋值操作。


再来看看requestWork函数的定义

```javascript
// requestWork is called by the scheduler whenever a root receives an update.
// It's up to the renderer to call renderRoot at some point in the future.
function requestWork(root: FiberRoot, expirationTime: ExpirationTime) {
  addRootToSchedule(root, expirationTime);
  if (isRendering) {
    // Prevent reentrancy. Remaining work will be scheduled at the end of
    // the currently rendering batch.
    return;
  }

  if (isBatchingUpdates) {
    // Flush work at the end of the batch.
    if (isUnbatchingUpdates) {
      // ...unless we're inside unbatchedUpdates, in which case we should
      // flush it now.
      nextFlushedRoot = root;
      nextFlushedExpirationTime = Sync;
      performWorkOnRoot(root, Sync, false);
    }
    return;
  }

  // TODO: Get rid of Sync and use current time?
  if (expirationTime === Sync) {
    performSyncWork();
  } else {
    scheduleCallbackWithExpirationTime(root, expirationTime);
  }
}
```

```javascript
function addRootToSchedule(root: FiberRoot, expirationTime: ExpirationTime) {
  // Add the root to the schedule.
  // Check if this root is already part of the schedule.
  if (root.nextScheduledRoot === null) {
    // This root is not already scheduled. Add it.
    root.expirationTime = expirationTime;
    if (lastScheduledRoot === null) {
      firstScheduledRoot = lastScheduledRoot = root;
      root.nextScheduledRoot = root;
    } else {
      lastScheduledRoot.nextScheduledRoot = root;
      lastScheduledRoot = root;
      lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
    }
  } else {
    // This root is already scheduled, but its priority may have increased.
    const remainingExpirationTime = root.expirationTime;
    if (expirationTime > remainingExpirationTime) {
      // Update the priority.
      root.expirationTime = expirationTime;
    }
  }
}
```

addRootToSchedule方法接收FiberRoot对象以及它对应的过期时间，这个方法主要是用于将传入的FiberRoot节点添加到调度队列里。方法第一句就首先判断传入的FiberRoot对象是否已经在调度队列里，如果FiberRoot对象上nextScheduledRoot属性为null，说明FiberRoot对象还没有被添加到调度队列里，然后通过lastScheduledRoot这个全局对象来判断队列里到底是只有一个root还是有多个root，如果lastScheduledRoot为null，说明队列里只应有一个root，那就是传进来的FiberRoot对象，于是将FiberRoot对象赋予firstScheduledRoot和lastScheduledRoot，调度队列也是一个头尾相连的环形链表的结构，如果不为null，说明调度队列里有其他root节点，那就将传进来的FiberRoot对象放到队列的末尾。并把FiberRoot对象赋予给lastScheduledRoot这个全局变量。然后回到else部分，如果传进来的FiberRoot对象已经在调度队列里了，那会比较下过期时间，过期时间代表了优先级，如果传进来的过期时间大于remainingExpirationTime，那说明传进来的FiberRoot对象所对应的优先级提升了，把传进来的expirationTime值赋予FiberRoot对象的expirationTime属性。这样addRootToSchedule方法的职责就完成了


```javascript
function scheduleCallbackWithExpirationTime(
  root: FiberRoot,
  expirationTime: ExpirationTime,
) {
  if (callbackExpirationTime !== NoWork) {
    // A callback is already scheduled. Check its expiration time (timeout).
    if (expirationTime < callbackExpirationTime) {
      // Existing callback has sufficient timeout. Exit.
      return;
    } else {
      if (callbackID !== null) {
        // Existing callback has insufficient timeout. Cancel and schedule a
        // new one.
        cancelDeferredCallback(callbackID);
      }
    }
    // The request callback timer is already running. Don't start a new one.
  } else {
    startRequestCallbackTimer();
  }

  callbackExpirationTime = expirationTime;
  const currentMs = now() - originalStartTimeMs;
  const expirationTimeMs = expirationTimeToMs(expirationTime);
  const timeout = expirationTimeMs - currentMs;
  callbackID = scheduleDeferredCallback(performAsyncWork, {timeout});
}
```

```javascript
  function ensureHostCallbackIsScheduled() {
    if (isExecutingCallback) {
      // Don't schedule work yet; wait until the next time we yield.
      return;
    }
    // Schedule the host callback using the earliest expiration in the list.
    var expirationTime = firstCallbackNode.expirationTime;
    if (!isHostCallbackScheduled) {
      isHostCallbackScheduled = true;
    } else {
      // Cancel the existing host callback.
      cancelHostCallback();
    }
    requestHostCallback(flushWork, expirationTime);
  }
```

ensureHostCallbackIsScheduled这个方法的作用是，确保firstCallbackNode指向的是callbackNode队列中，优先级最高的callbackNode
