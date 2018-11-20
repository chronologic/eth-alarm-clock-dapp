import Loki from 'lokijs';
import LokiMemoryAdapter from 'lokijs/src/loki-memory-adapter.js';

export default class NetworkAwareStorageService {
  _keyModifier;

  /**
   * @type {Promise<undefined>}
   */
  _initializationPromise;

  /**
   * @type {Function}
   */
  _initializationPromiseResolver;

  /**
   * @type {string}
   */
  _collectionName = 'basic-key-value-pairs';

  /**
   * @type {Loki}
   */
  _db;

  /**
   * @type {Loki.Collection}
   */
  _collection;

  constructor(keyModifier) {
    this._keyModifier = keyModifier;
    this._initializationPromise = new Promise(
      resolve => (this._initializationPromiseResolver = resolve)
    );

    this._initDatabase().then(() => this._initializationPromiseResolver());
  }

  save(key, value) {
    const foundObject = this._collection.find({ key })[0];

    if (foundObject) {
      foundObject.value = value;

      this._collection.update(foundObject);
    } else {
      this._collection.insert({
        key,
        value
      });
    }
  }

  load(key) {
    const queryResult = this._collection.find({ key });

    return queryResult[0] && queryResult[0].value;
  }

  remove(key) {
    return this._collection.findAndRemove({ key });
  }

  /**
   * @public
   *
   * @returns {Promise<undefined>}
   */
  async waitForInitialization() {
    return this._initializationPromise;
  }

  /**
   * @private
   */
  async _initDatabase() {
    await this._keyModifier.waitForInitialization();

    const persistenceAdapter = new LokiMemoryAdapter();

    return new Promise(resolve => {
      this._db = new Loki(this._getDatabaseName(), {
        adapter: persistenceAdapter,
        autoload: true,
        autoloadCallback: () => {
          this._collection = this._getCollection();

          resolve();
        },
        autosave: true,
        autosaveInterval: 2000
      });
    });
  }

  /**
   * @private
   */
  _getCollection() {
    return this._db.getCollection(this._collectionName) || this._createCollection();
  }

  /**
   * @private
   */
  _createCollection() {
    return this._db.addCollection(this._collectionName, {
      unique: 'key'
    });
  }

  /**
   * @private
   */
  _getDatabaseName() {
    return `${this._getModifiedKey('network-aware-storage')}.db`;
  }

  /**
   * @private
   *
   * @param {string} key
   * @returns {string}
   *
   */
  _getModifiedKey(key) {
    return this._keyModifier ? this._keyModifier.modify(key) : key;
  }
}
