// @ts-check

/**
 * @param {any} object
 * @returns {string}
 */
function serialize(object) {
  if (object === null) {
    return '{"type":"null","value":""}';
  }

  if (typeof object === 'undefined') {
    return '{"type":"undefined","value":""}';
  }

  if (typeof object === 'bigint') {
    return JSON.stringify({type: 'bigint', value: object.toString()});
  }

  if (typeof object === 'number' || typeof object === 'string' || typeof object === 'boolean') {
    return JSON.stringify({type: typeof object, value: object.toString()});
  }

  if (object instanceof Date) {
    return JSON.stringify({type: 'date', value: object.toISOString()});
  }

  if (typeof object === 'function') {
    return JSON.stringify({type: 'function', value: object.toString()});
  }

  if (object instanceof Error) {
    const tempObj = {
      name: object.name,
      message: object.message,
      cause: object.cause
    };
    return JSON.stringify({
      type: 'error',
      value: JSON.parse(serialize(tempObj))
    });
  }

  if (Array.isArray(object)) {
    let arrObjs = {}
    for (let i = 0; i < object.length; i++) {
      arrObjs[i] = JSON.parse(serialize(object[i]));
    }
    return JSON.stringify({type: 'array', value: arrObjs})
  }

  if (typeof object === 'object') {
    let objObjs = {}
    for (const key in object) {
      objObjs[key] = JSON.parse(serialize(object[key]));
    }
    return JSON.stringify({type: 'object', value: objObjs});
  }
  return '';
}
/**
 * @param {string} string
 * @returns {any}
 */
function deserialize(string) {
  if (typeof string !== 'string') {
    throw new SyntaxError(`Invalid argument type: ${typeof string}.`);
  }


  const data = JSON.parse(string);
  const type = data.type;
  const value = data.value;

  switch (type) {
    case 'number':
      return Number(value);
    case 'string':
      return value;
    case 'boolean':
      return value === 'true';
    case 'null':
      return null;
    case 'undefined':
      return undefined;
    case 'date':
      return new Date(value);
    case 'function':
      return new Function(`return (${value})`)();
    case 'bigint':
      return BigInt(value);
    case 'error':
      const tempObj = deserialize(JSON.stringify(value));
      const error = new Error(tempObj.message);
      error.name = tempObj.name;
      error.cause = tempObj.cause;
      
      return error;
    case 'array': 
      let arr = [];
      for (let key in value) {
        arr[Number(key)] = deserialize(JSON.stringify(value[Number(key)]));
      }
      return arr;
    case 'object':
      let obj = {};
      for (let key in value) {
        obj[key] = deserialize(JSON.stringify(value[key]));
      }
      return obj;
    default:
      throw new SyntaxError(`Unknown type: ${type}`);
  }

}

module.exports = {
  serialize,
  deserialize,
};
