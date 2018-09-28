import moment from 'moment';
import { TEMPORAL_UNIT } from '../stores/TransactionStore';

const BLOCK_BUCKET_SIZE = 240;
const TIMESTAMP_BUCKET_SIZE = 3600;

export default class BucketHelper {
  /**
   * @private
   */
  _requestFactory;

  constructor(requestFactory) {
    this.setRequestFactory(requestFactory);
  }

  setRequestFactory(requestFactory) {
    this._requestFactory = requestFactory;
  }

  async getBucketsForLastHours(hours, currentBlock) {
    return this._getBucketsForHours(hours, false, currentBlock);
  }

  async getBucketsForNextHours(hours, currentBlock) {
    return this._getBucketsForHours(hours, true, currentBlock);
  }

  async calcBucketForTimestamp(timestamp) {
    return this._requestFactory.calcBucket(timestamp, TEMPORAL_UNIT.TIMESTAMP);
  }

  async calcBucketForBlock(blockNumber) {
    return this._requestFactory.calcBucket(blockNumber, TEMPORAL_UNIT.BLOCK);
  }

  /**
   * @private
   *
   * @param {number} hours
   * @param {boolean} future
   * @param {number} currentBlock
   */
  async _getBucketsForHours(hours, future, currentBlock) {
    const currentTimestamp = moment().unix();

    const buckets = [];

    let timestampBucket = await this.calcBucketForTimestamp(currentTimestamp);
    let blockBucket = await this.calcBucketForBlock(currentBlock);

    // Adding 0.5, because for each hour we fetch 2 buckets: timestamp, block.
    for (let i = 0; i < hours; i += 0.5) {
      // First, we fetch timestamp bucket, then block bucket.
      const isTimestampBucket = i % 1 === 0;

      buckets.push(isTimestampBucket ? timestampBucket : blockBucket);

      if (isTimestampBucket) {
        timestampBucket += future ? TIMESTAMP_BUCKET_SIZE : -TIMESTAMP_BUCKET_SIZE;
      } else {
        /*
         * Since blockBucket is negative number we should add it to block bucket size,
         * if we want to go back in time.
         */
        blockBucket += future ? -BLOCK_BUCKET_SIZE : +BLOCK_BUCKET_SIZE;
      }
    }

    return buckets;
  }
}
