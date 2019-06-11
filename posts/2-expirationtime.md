```javascript
const MAX_SIGNED_31_BIT_INT = 1073741823

type ExpirationTime = number;

const NoWork = 0;
const Never = 1;
const Sync = MAX_SIGNED_31_BIT_INT;

const UNIT_SIZE = 10;
const MAGIC_NUMBER_OFFSET = MAX_SIGNED_31_BIT_INT - 1;

// 1 unit of expiration time represents 10ms
// 1个单位的过期时间代表10ms
function msToExpirationTime(ms: number): ExpirationTime {
  // Always add an offset so that we don't clash with the magic number for NoWork.
  // 总是添加一个偏移值以至于不会和NoWork的魔法数产生冲突
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0);
}

function expirationTimeToMs(expirationTime: ExpirationTime): number {
  return (MAGIC_NUMBER_OFFSET - expirationTime) * UNIT_SIZE;
}

function ceiling(num: number, precision: number): number {
  return (((num / precision) | 0) + 1) * precision;
}

function computeExpirationBucket(
  currentTime,
  expirationInMs,
  bucketSizeMs,
): ExpirationTime {
  return (
    MAGIC_NUMBER_OFFSET -
    ceiling(
      MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE,
      bucketSizeMs / UNIT_SIZE,
    )
  );
}

const LOW_PRIORITY_EXPIRATION = 5000;
const LOW_PRIORITY_BATCH_SIZE = 250;

function computeAsyncExpiration(
  currentTime: ExpirationTime,
): ExpirationTime {
  return computeExpirationBucket(
    currentTime,
    LOW_PRIORITY_EXPIRATION,
    LOW_PRIORITY_BATCH_SIZE,
  );
}

// We intentionally set a higher expiration time for interactive updates in
// dev than in production.

// If the main thread is being blocked so long that you hit the expiration,
// it's a problem that could be solved with better scheduling.

// People will be more likely to notice this and fix it with the long
// expiration time in development.

// In production we opt for better UX at the risk of masking scheduling
// problems, by expiring fast.

/**
 * 
*/
const HIGH_PRIORITY_EXPIRATION = __DEV__ ? 500 : 150;
const HIGH_PRIORITY_BATCH_SIZE = 100;

function computeInteractiveExpiration(currentTime: ExpirationTime) {
  return computeExpirationBucket(
    currentTime,
    HIGH_PRIORITY_EXPIRATION,
    HIGH_PRIORITY_BATCH_SIZE,
  );
}

```

这里有一点说明，关于expirationTime和优先级之间的关系，在最开始的阶段，关系是expirationTime值越小优先级越大，但是现在是值越大优先级越大。

这里我们主要看computeExpirationBucket这个函数，我们通过最后两个计算不同优先级的方法来对computeExpirationBucket函数进行测试。首先测试computeInteractiveExpiration这个函数，假设我们传入的当前时间currentTime为10000。那么到了computeExpirationBucket函数中就会是这样

```javascript
  return (
    1073741822 -
    ceiling(
      1073741822 - 10000 + 150 / 10,
      100 / 10,
    )
  );
```

我们再来看看ceiling函数，根据函数名，应该跟Math.ceil向上取整方法有相似之处，那为什么没有直接用Math.ceil呢，肯定是里面有一套自定义向上取整的规范。这个函数接收两个参数，第一个就是将被转化的数字，第二个是表示精度的参数precision。我们来写一段代码

```javascript
  const num = 1073741822 - 10000 + 150 / 10;
  const precision = 100 / 10;

  // 进入到ceiling函数就变成这样

  ((((1073741822 - 10000 + 150 / 10) / (100 / 10)) | 0) + 1) * (100 / 10)

```

将上面的计算表达式放到浏览器控制台上执行，并不断修改上式中的10000这个数字，比如从9998 - 10018，依次试一下得出来的值会发现，从9998 - 10007之间得到的值都是1073731840，而从10008 - 10017之间得到的值都是1073731830。也就是说两次相差为precision值之内的currentTime会得到相同的ExpirationTime。所以precision这个值就成为关键，而precision是和批次数量有关系的，这个文件中定义了两种批次数量，一个是代表高优先级批次数量的HIGH_PRIORITY_BATCH_SIZE（100），另一个是代表低优先级批次数量的LOW_PRIORITY_BATCH_SIZE（250）

