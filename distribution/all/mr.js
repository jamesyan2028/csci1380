// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../util/id.js").NID} NID
 */

/**
 * Map functions used for mapreduce
 * @callback Mapper
 * @param {string} key
 * @param {any} value
 * @returns {object[]}
 */

/**
 * Reduce functions used for mapreduce
 * @callback Reducer
 * @param {string} key
 * @param {any[]} value
 * @returns {object}
 */

/**
 * @typedef {Object} MRConfig
 * @property {Mapper} map
 * @property {Reducer} reduce
 * @property {string[]} keys
 *
 * @typedef {Object} Mr
 * @property {(configuration: MRConfig, callback: Callback) => void} exec
 */


/*
  Note: The only method explicitly exposed in the `mr` service is `exec`.
  Other methods, such as `map`, `shuffle`, and `reduce`, should be dynamically
  installed on the remote nodes and not necessarily exposed to the user.
*/

const { id } = require('../util/util.js');

/**
 * @param {Config} config
 * @returns {Mr}
 */
function mr(config) {
  const context = {
    gid: config.gid || 'all',
  };

  /**
   * @param {MRConfig} configuration
   * @param {Callback} callback
   * @returns {void}
   */
  function exec(configuration, callback) {
    const mrID = id.getID(`${configuration}${Date.now()}`);
    const mrGid = `mr${mrID}`;

    /*
      MapReduce steps:
      1) Setup: register a service `mr-<id>` on all nodes in the group. The service implements the map, shuffle, and reduce methods.
      2) Map: make each node run map on its local data and store them locally, under a different gid, to be used in the shuffle step.
      3) Shuffle: group values by key using store.append.
      4) Reduce: make each node run reduce on its local grouped values.
      5) Cleanup: remove the `mr-<id>` service and return the final output.

      Note: Comments inside the stencil describe a possible implementation---you should feel free to make low- and mid-level adjustments as needed.
    */
    const mrService = {
      mapper: configuration.map,
      reducer: configuration.reduce,
      map: function(
          /** @type {string} */ mrGid,
          /** @type {string} */ mrID,
          /** @type {Callback} */ callback,
      ) {
        // Map should read the node's local keys under the mrGid gid and write to store under gid `${mrID}_map`.
        // Expected output: array of objects with a single key per object.
        const mapper = this.mapper;
        const mapGid = `${mrID}_map`;

        globalThis.distribution.local.store.get({key: null, gid: mrGid}, (e, keys) => {
          if (e) return callback(e, null);

          if (keys.length === 0) return callback(null, []);

          let completed = 0;
          const errors = [];

          keys.forEach((key) => {
            globalThis.distribution.local.store.get({key, gid: mrGid}, (e, value) => {
              if (e) {
                errors.push(e);
                completed += 1;
                if (completed === keys.length) {
                  return callback(errors.length > 0 ? errors[0] : null, null);
                }
                return;
              }

              const mapResult = mapper(key, value);
              const resultKeys = Object.keys(mapResult);
              let stored = 0;

              resultKeys.forEach((resultKey) => {
                const resultValue = mapResult[resultKey];
                globalThis.distribution.local.store.put(resultValue, {key: resultKey, gid: mapGid}, (e) => {
                  if (e) errors.push(e);
                  stored += 1;
                  if (stored === resultKeys.length) {
                    completed += 1;
                    if (completed === keys.length) {
                      callback(errors.length > 0 ? errors[0] : null, null);
                    }
                  }
                });
              });    
            });
          });
        });
      },
      shuffle: function(
          /** @type {string} */ gid,
          /** @type {string} */ mrID,
          /** @type {Callback} */ callback,
      ) {
        // Fetch the mapped values from the local store
        // Shuffle groups values by key (via store.append).
        const mapGid = `${mrID}_map`;
        const reduceGid = `${mrID}_reduce`;

        globalThis.distribution.store.get({key: null, gid: mapGid}, (e, keys) => {
          if (e) return callback(e, null);
          if (keys.length === 0) return callback(null, []);

          let completed = 0;
          const errors = [];

          keys.forEach((key) => {
            globalThis.distribution.local.store.get({key, gid: mapGid}, (e, value) => {
              if (e) {
                errors.push(e);
                completed += 1;
                if (completed === keys.length) {
                  callback(errors.length > 0 ? errors[0] : null, null);
                }
                return;
              }
              globalThis.distribution[mrGid].store.append(value, {key, gid: reduceGid}, (e) => {
                if (e) errors.push(e);
                completed += 1;
                if (completed === keys.length) {
                  callback(errors.length > 0 ? errors[0] : null, null);
                }
              });
            });
          });
        });
      },
      reduce: function(
          /** @type {string} */ gid,
          /** @type {string} */ mrID,
          /** @type {Callback} */ callback,
      ) {
        // Fetch grouped values from local store, apply reducer, and return final output.
        const reduceGid = `${mrID}_reduce`;
        const reducer = this.reducer;

        globalThis.distribution.local.store.get({key: null, gid: reduceGid}, (e, keys) => {
          if (e) return callback(e, null);
          if (keys.length === 0) return callback(null, []);

          let completed = 0;
          const errors = [];
          const results = [];

          keys.forEach((key) => {
            globalThis.distribution.local.store.get({key, gid: reduceGid}, (e, values) => {
              if (e) {
                errors.push(e);
              } else {
                const result = reducer(key, values);
                results.push(result);
              }

              completed += 1;
              if (completed === keys.length) {
                callback(errors.length > 0 ? errors[0] : null, results);
              }
            });
          });
        });
      },
    };


    // Register the mr service on all nodes in the group and execute in sequence: map, shuffle, reduce.
    const putRemote = {service: 'routes', method: 'put'};
    globalThis.distribution[context.gid].comm.send([mrService, mrGid], putRemote, (e, v) => {
      if (Object.keys(e).length > 0) return callback(e, null);

      const copiedData = configuration.keys.map((key) => new Promise((resolve, reject) => {
        globalThis.distribution[context.gid].store.get(key, (e, value) => {
          if (e) return reject(e);
          globalThis.distribution[context.gid].store.put(value, {key, gid: mrGid}, (e, v) => {
            if (e) return reject(e);
            resolve(null);
          });

        });
      }));

      Promise.all(copiedData).then(() => runMR()).catch(callback);

      function runMR() {
        globalThis.distribution[context.gid].comm.send([mrGid, mrID], {service: mrGid, method: 'map'}, (e, v) => {
          if (Object.keys(e).length > 0) return cleanup(callback, e, null);

          globalThis.distribution[context.gid].comm.send([mrGid, mrID], {service: mrGid, method: 'shuffle'}, (e, v) => {
            if (Object.keys(e).length > 0) return cleanup(callback, e, null);

            globalThis.distribution[context.gid].comm.send([mrGid, mrID], {service: mrGid, method: 'reduce'}, (e, reduceResults) => {
              if (Object.keys(e).length > 0) return cleanup(callback, e, null);
              const finalResults = Object.values(reduceResults).flat();
              cleanup(callback, null, finalResults);
            });
          });
        });
      }

      function cleanup(cb, err, val) {
        globalThis.distribution[context.gid].comm.send([mrGid], {service: 'routes', method: 'rem'}, (e, v) => {
          cb(err, val);
        });
      }
    });
  }
  return {exec};
}

module.exports = mr;
