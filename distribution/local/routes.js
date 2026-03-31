/**
 * @typedef {import("../types").Callback} Callback
 * @typedef {string} ServiceName
 */

const services = {};

/**
 * @param {ServiceName | {service: ServiceName, gid?: string}} configuration
 * @param {Callback} callback
 * @returns {void}
 */
function get(configuration, callback) {
  let name;
  let gid;
  if (typeof configuration === 'object') {
    name = configuration.service;
    gid = configuration.gid;
  } else {
    name = configuration;
  }

  if (gid && gid !== 'local') {
    const localService = services[name];
    if (localService) {
      return callback(null, localService);
    }
    const groupService = global.distribution[gid];
    if (groupService && groupService[name]) {
      return callback(null, groupService[name]);
    } else {
      return callback(new Error(`Name ${name} not found in group ${gid}`), null);
    }
  } else {
    const service = services[name];
    if (service) {
      return callback(null, service);
    }
    const rpc = globalThis.toLocal.get(name);
    if (rpc) {
      return callback(null, {call: rpc});
    }
    callback(new Error(`Unknown Service: "${name}"`), null);
  }
}

/**
 * @param {object} service
 * @param {string} configuration
 * @param {Callback} callback
 * @returns {void}
 */
function put(service, configuration, callback) {
  services[configuration] = service;
  callback(null, configuration);
}

/**
 * @param {string} configuration
 * @param {Callback} callback
 */
function rem(configuration, callback) {
  if (services[configuration]) {
    const targetService = services[configuration];
    delete services[configuration];
    callback(null, targetService);
  } else {
    callback(new Error(`Configuration Not Found: "${configuration}"`));
  }
}

module.exports = {get, put, rem};