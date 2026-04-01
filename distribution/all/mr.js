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
    const mrId = id.getID(`${configuration}${Date.now()}`);
    const mrGid = `mr${mrId}`;
    const shuffleGroupId = `mr${mrId}shuffle`;
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
        globalThis.distribution.local.store.get({key: null, gid: mrGid}, (e, keys) => {
          if (e) return callback(e, null);

          if (keys.length === 0) return callback(null, []);

          let completed = 0;
          const mapped = [];

          keys.forEach((key) => {
            globalThis.distribution.local.store.get({key, gid: mrGid}, (e, value) => {
              completed += 1;
              if (e) return callback(e);
              const result = this.mapper(key, value);
              if (Array.isArray(result)) {
                result.forEach((item) => mapped.push(item));
              } else {
                mapped.push(result);
              }

              if (completed === keys.length) {
                globalThis.distribution.local.store.put(mapped, `${mrID}_map`, (e) => {
                  callback(e, mapped)
                });           
              }
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
        globalThis.distribution.local.store.get(`${mrID}_map`, (e, mappedData) => {
          if (e) return callback(null, []);
          if (e) return callback(e, null);
          if (!mappedData || mappedData.length === 0) return callback(null, []);

          let completed = 0;
          const errors = [];

          mappedData.forEach((obj) => {
            const [key] = Object.keys(obj);
            globalThis.distribution[gid].store.append(obj[key], key, () => {
              completed++;
              if (completed === mappedData.length) {
                return callback(null, mappedData);
              }
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
        globalThis.distribution.local.store.get({key: null, gid}, (e, keys) => {
          if (e) return callback(e);
          if (!Array.isArray(keys) || keys.length === 0) return callback(null, null);

          let completed = 0;
          const reduced = [];

          keys.forEach((key) => {
            globalThis.distribution.local.store.get({key, gid}, (e, vals) => {
              completed += 1;
              if (e) return callback(e);
              const result = this.reducer(key, vals);
              reduced.push(result);
              if (completed === keys.length) {
                return callback(null, reduced);
              }
            });
          });
        });
      },
    };

    function copyDataToGroup(keys, callback) {
      if (!Array.isArray(keys) || keys.length === 0) {
        return callback(null, null);
      }

      let completed = 0;
      let firstError = null;

      keys.forEach((key) => {
        globalThis.distribution[context.gid].store.get(key, (e, val) => {
          if (e) {
            completed += 1;
            firstError = e || firstError
            if (completed === keys.length) callback(firstError);
            return;
          }
          globalThis.distribution[mrGid].store.put(val, {key, gid: mrGid}, (e) => {
            console.log('copied key:', key, 'to mrGid:', mrGid, 'error:', e);
            if (e) firstError = firstError || e;
            completed += 1;
            if (completed === keys.length) {
              return callback(firstError, keys);
            }
          });
        });
      });
    };

    // Register the mr service on all nodes in the group and execute in sequence: map, shuffle, reduce.
    globalThis.distribution[context.gid].routes.put(mrService, `mr-${mrId}`, (e, v) => {
      if (Object.keys(e).length > 0) return callback(e, null);
      globalThis.distribution.local.groups.get(context.gid, (e, group) => {
        if (e) return callback(e, null);

        const createGroup = (gid, callback) => {
          globalThis.distribution.local.groups.put({gid}, group, (e) => {
            if (e && Object.keys(e).length > 0) return callback(e);

            globalThis.distribution[context.gid].groups.put({gid}, group, (e) => {
              if (e && Object.keys(e).length > 0) return callback(e);
              return callback(null);
            });
          });
        };

        createGroup(mrGid, (e) => {
          if (e) return callback(e);
          createGroup(shuffleGroupId, (e) => {
            if (e) return callback(e);
            copyDataToGroup(configuration.keys, (e) => {
              if (e) return callback(e);

              globalThis.distribution[context.gid].comm.send([mrGid, mrId], {service: `mr-${mrId}`, method: 'map'}, (e, mapResult) => {
                console.log('MAP:', e, mapResult);
                globalThis.distribution[context.gid].comm.send([shuffleGroupId, mrId], {service: `mr-${mrId}`, method: 'shuffle'}, (e, shuffleResult) => {
                  console.log('SHUFFLE:', e, shuffleResult);
                  globalThis.distribution[context.gid].comm.send([shuffleGroupId, mrId], {service: `mr-${mrId}`, method: 'reduce'}, (e, reduceResult) => {
                    console.log('REDUCE:', e, reduceResult);
                    let finalResults = [];
                    for (const val of Object.values(reduceResult)) {
                      if (val !== null) {
                        finalResults = finalResults.concat(val);
                      }
                    }
                    globalThis.distribution[context.gid].routes.rem(`mr-${mrId}`, () => {
                      callback(null, finalResults);
                    });
                  });
                });
              });
            });
          });
        });
      });  
    });
  }

  return {exec};
}

module.exports = mr;
