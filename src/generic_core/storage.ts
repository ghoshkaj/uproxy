/**
 * storage.ts
 *
 * Provides a promise-based interface to the storage provider.
 */
/// <reference path='../../../third_party/typings/es6-promise/es6-promise.d.ts' />
/// <reference path='../../../third_party/typings/freedom/freedom-module-env.d.ts' />

import logging = require('../../../third_party/uproxy-lib/logging/logging');

var log :logging.Log = new logging.Log('storage');

// Platform-independent storage provider.
var fStorage :freedom.Storage.Storage = freedom['core.storage']();

// Set false elsewhere to disable log messages (ie. from jasmine)
export var DEBUG_STATESTORAGE = true;

/**
 * Contains all state for uProxy's core.
 */
export class Storage {
  /**
   * Resets state, and clears local storage.
   */
  public reset = () : Promise<void> => {
    return fStorage.clear().then(() => {
      log.info('Cleared all keys from storage');
    });
  }

  // --------------------------------------------------------------------------
  // Promise-based wrappers for Freedom storage API to work with json instead
  // of strings.

  /**
   * Promise loading a key from storage, as a JSON object.
   * Use Generic <T> to indicate the type of the returned object.
   * If the key does not exist, rejects the promise.
   *
   * TODO: Consider using a storage provider that works with JSON.
   */
  public load<T>(key :string) : Promise<T> {
    log.debug('loading', key);
    return fStorage.get(key).then((result :string) => {
      if (typeof result === 'undefined' || result === null) {
        return Promise.reject('non-existing key');
      }
      log.debug('Loaded [%1]: %2', key, result);
      return <T>JSON.parse(result);
    });
  }

  /**
   * Promise saving a key-value pair to storage, fulfilled with the previous
   * value of |key| if it existed (according to the freedom interface.)
   */
  public save(key :string, val :Object) :Promise<void> {
    log.debug('Saving to storage', {
      key: key,
      newVal: val
    });
    return fStorage.set(key, JSON.stringify(val)).then((prev:string) => {
      log.debug('Successfully saved to storage', {
        key: key,
        oldVal: prev
      });
    }).catch((e) => {
      log.error('Save operation failed', e.message);
      return Promise.reject(e);
    });
  }

  public keys = () : Promise<string[]> => {
    return fStorage.keys();
  }
} // class Storage
