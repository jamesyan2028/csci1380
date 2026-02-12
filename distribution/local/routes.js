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
  if (typeof configuration === 'object') {
    name = configuration.service;
  } else {
    name = configuration;
  }

  const service = services[name]

  if (service) {
    callback(null, service);
  } else {
    callback(new Error(`Unknown Service: "${configuration}`), null);
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
