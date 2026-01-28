// @ts-check

/**
 * @param {any} object
 * @returns {string}
 */
function serialize(object) {
}


/**
 * @param {string} string
 * @returns {any}
 */
function deserialize(string) {
  if (typeof string !== 'string') {
    throw new Error(`Invalid argument type: ${typeof string}.`);
  }
}

module.exports = {
  serialize,
  deserialize,
};
