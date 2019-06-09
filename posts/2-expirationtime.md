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