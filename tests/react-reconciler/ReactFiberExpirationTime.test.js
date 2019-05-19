const MAX_SIGNED_31_BIT_INT = 1073741823

const NoWork = 0;
const Never = 1;
const Sync = MAX_SIGNED_31_BIT_INT;

const UNIT_SIZE = 10;
const MAGIC_NUMBER_OFFSET = MAX_SIGNED_31_BIT_INT - 1;

function msToExpirationTime(ms) {
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0);
}

function expirationTimeToMs(expirationTime) {
  return (MAGIC_NUMBER_OFFSET - expirationTime) * UNIT_SIZE;
}

function ceiling(num, precision) {
  return (((num / precision) | 0) + 1) * precision;
}

function computeExpirationBucket(
  currentTime,
  expirationInMs,
  bucketSizeMs,
) {
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

function computeAsyncExpiration(currentTime) {
  return computeExpirationBucket(
    currentTime,
    LOW_PRIORITY_EXPIRATION,
    LOW_PRIORITY_BATCH_SIZE,
  );
}

// production
const HIGH_PRIORITY_EXPIRATION = 150;

// development
// const HIGH_PRIORITY_EXPIRATION = 500;

const HIGH_PRIORITY_BATCH_SIZE = 100;

function computeInteractiveExpiration(currentTime) {
  return computeExpirationBucket(
    currentTime,
    HIGH_PRIORITY_EXPIRATION,
    HIGH_PRIORITY_BATCH_SIZE,
  );
}

describe('ReactFiberExpirationTime', () => {
  it('计算异步过期时间', () => {
    expect(computeAsyncExpiration(1000)).toBe(497);
    expect(computeAsyncExpiration(1025)).toBe(522);
    expect(computeAsyncExpiration(1030)).toBe(522);
  });

  it('计算交互式过期时间', () => {
    expect(computeInteractiveExpiration(1000)).toBe(982);
    expect(computeInteractiveExpiration(1025)).toBe(1002);
    expect(computeInteractiveExpiration(1028)).toBe(1012);
    expect(computeInteractiveExpiration(1030)).toBe(1012);
  });
});