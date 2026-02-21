// @ts-check
/**
 * @typedef {import("../types").Callback} Callback
 * @typedef {import("../types").Node} Node
 *
 * @typedef {Object} Payload
 * @property {{service: string, method: string, node: Node}} remote
 * @property {any} message
 * @property {string} mid
 * @property {string} gid
 */

const N = 10;
const seenMessages = new Set();

/**
 * @param {Payload} payload
 * @param {Callback} callback
 */
function recv(payload, callback) {
  const {remote, message, mid, gid} = payload;
  if (seenMessages.has(mid)) {
    return callback(null, 'Duplicate Message Ignored');
  }

  seenMessages.add(mid);

  global.distribution.local.routes.get(remote.service, (err, service) => {
    if (err || !service || typeof service[remote.method] !== 'function') {
      console.error(`Gossip method execution failed: ${remote.service}.${remote.method}`);
    } else {
      service[remote.method](...message, (e, v) => {
        if (e) {
          console.error(`Error executing method locally:  ${remote.service}.${remote.method}`);
        }
      });
    }
  });

  const config = {
    gid: gid,
    mid: mid,
    service: remote.service,
    method: remote.method,
  };
  
  if (global.distribution[gid] && global.distribution[gid].gossip) {
    global.distribution[gid].gossip.send(message, config, (e, v) => {

    });
  }

  callback(null, 'Message Sent');
}


module.exports = {recv};
