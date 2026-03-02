# distribution

This is the distribution library. 

## Environment Setup

We recommend using the prepared [container image](https://github.com/brown-cs1380/container).

## Installation

After you have setup your environment, you can start using the distribution library.
When loaded, distribution introduces functionality supporting the distributed execution of programs. To download it:

```sh
$ npm i '@brown-ds/distribution'
```

This command downloads and installs the distribution library.

## Testing

There are several categories of tests:
  *	Regular Tests (`*.test.js`)
  *	Scenario Tests (`*.scenario.js`)
  *	Extra Credit Tests (`*.extra.test.js`)
  * Student Tests (`*.student.test.js`) - inside `test/test-student`

### Running Tests

By default, all regular tests are run. Use the options below to run different sets of tests:

1. Run all regular tests (default): `$ npm test` or `$ npm test -- -t`
2. Run scenario tests: `$ npm test -- -c` 
3. Run extra credit tests: `$ npm test -- -ec`
4. Run the `non-distribution` tests: `$ npm test -- -nd`
5. Combine options: `$ npm test -- -c -ec -nd -t`

## Usage

To try out the distribution library inside an interactive Node.js session, run:

```sh
$ node
```

Then, load the distribution library:

```js
> let distribution = require("@brown-ds/distribution")();
> distribution.node.start(console.log);
```

Now you have access to the full distribution library. You can start off by serializing some values. 

```js
> s = distribution.util.serialize(1); // '{"type":"number","value":"1"}'
> n = distribution.util.deserialize(s); // 1
```

You can inspect information about the current node (for example its `sid`) by running:

```js
> distribution.local.status.get('sid', console.log); // null 8cf1b (null here is the error value; meaning there is no error)
```

You can also store and retrieve values from the local memory:

```js
> distribution.local.mem.put({name: 'nikos'}, 'key', console.log); // null {name: 'nikos'} (again, null is the error value) 
> distribution.local.mem.get('key', console.log); // null {name: 'nikos'}

> distribution.local.mem.get('wrong-key', console.log); // Error('Key not found') undefined
```

You can also spawn a new node:

```js
> node = { ip: '127.0.0.1', port: 8080 };
> distribution.local.status.spawn(node, console.log);
```

Using the `distribution.all` set of services will allow you to act 
on the full set of nodes created as if they were a single one.

```js
> distribution.all.status.get('sid', console.log); // {} { '8cf1b': '8cf1b', '8cf1c': '8cf1c' } (now, errors are per-node and form an object)
```

You can also send messages to other nodes:

```js
> distribution.local.comm.send(['sid'], {node: node, service: 'status', method: 'get'}, console.log); // null 8cf1c
```

Most methods in the distribution library are asynchronous and take a callback as their last argument.
This callback is invoked when the method completes, with the first argument being an error (if any) and the second argument being the result.
The following runs the sequence of commands described above inside a script (note the nested callbacks):

```js
let distribution = require("@brown-ds/distribution")();
// Now we're only doing a few of the things we did above
const out = (cb) => {
  distribution.local.status.stop(cb); // Shut down the local node
};
distribution.node.start(() => {
  // This will run only after the node has started
  const node = {ip: '127.0.0.1', port: 8765};
  distribution.local.status.spawn(node, (e, v) => {
    if (e) {
      return out(console.log);
    }
    // This will run only after the new node has been spawned
    distribution.all.status.get('sid', (e, v) => {
      // This will run only after we communicated with all nodes and got their sids
      console.log(v); // { '8cf1b': '8cf1b', '8cf1c': '8cf1c' }
      // Shut down the remote node
      distribution.local.comm.send([], {service: 'status', method: 'stop', node: node}, () => {
        // Finally, stop the local node
        out(console.log); // null, {ip: '127.0.0.1', port: 1380}
      });
    });
  });
});
```

# Results and Reflections

> ...

# M1: Serialization / Deserialization
## Summary

The implementation of serialize/deserialize builds on the JSON.stringify() and JSON.parse() methods.
For many of the simplier types such as string, boolean, integer, serialization/deserialization is just added the name of the type and then calling object.toString(). On top of this, the currently implementation support serialization/deserialization of null, undefined, and Date values which just consists of recording the respective type name then placing the apporiate string in the data field. For arrays and objects, serialize is recursively called on every element of the array or property of an object. For errors, a temporary object is created, and then serialize is recurisvely called on the error object so that it is processed like an object. During deserialization, string, boolean, integer, Date, null, and undefined all had striaghtforward implementations that could be called by checking the data.type field. Deserializing followed a similar pattern in arrays and objects, where the method would be recursively called on the array elements/object fields. For errors, the new error object is created, then populated with fields from the .name and the .cause fields.

Reading the documentation, understanding what to do, and writing the tests took the most time, around 5 hours. Writing serialize/deserialize took about 2 hours. Writing a script to test for latency and deploying on AWS took about an hour.


My implementation comprises 3 software components, totaling 310 lines of code. Key challenges included understanding the formal for serialization/deserialization especailly for objects and arrays, and getting experience using REPL to figure out the exact formatting of tests.


## Correctness & Performance Characterization


> Describe how you characterized the correctness and performance of your implementation


*Correctness*: I wrote 5 tests; these tests take 15.094s to execute. This includes objects with string, number, boolean, null, undefined, array, and object types for both serialization and deserialization accuracy, a single object containing every support type, and tests for malformed input.


*Performance*: The latency of various subsystems is described in the `"latency"` portion of package.json. The characteristics of my development machines are summarized in the `"dev"` portion of package.json.

# M2: Actors and Remote Procedure Calls (RPC)


## Summary

> Summarize your implementation, including key challenges you encountered. Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M2 (`hours`) and the lines of code per task.

In Milestone 2, we transition from a standalone system to a distributed Actor model architecture composed of multiple independent nodes. Each node is uniquely identified by its IP and port number, which is hashed to produce a unique node id (NID). Each node also supports three local services: status, which reports information about a particular node, routes, which maps service functions to actual javascript functions that perform the operations, and comm, which is a way for nodes to send messages to each other. In addition to these services, each node also listens for messages from other nodes by running a server in node.js. When a node recieves a message from another node, it first uses string parsing to identify the service and method names, deserializes the arguments, and then runs the requested method if it is registered in routes. It then serializes the output and sends the result back through the callback function. 

By far the most difficult part of the assignment was understanding what needed to be implemented, and how it would all work together at the very start. In retrospect after I understood what I needed to do, the actual implementation was not that bad, but I thought the handout was confusing and took many read throughs and experimenting with the tests in the first step before I understood what to do.


My implementation comprises `6` software components, totaling `602` lines of code. Key challenges included understanding the assignment and what I needed to implement. As mentioned above, it took me a long time to understand what I was tasked with building and how it would fit together. I would say that reading the documentation and writing tests took over half the total time I spent on this checkpoint. I also had some difficulties testing my server implementation with jest, since it was difficult for me to find documentation on how to solve the issue "Jest did not exit one second after the test run has completed. This usually means that there are asynchrnous operations that weren't stopped ..." which occured because I started my server but didn't close it. Eventually I figured out that I just had to write the line distribution.node.server.close() to close the server.


## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation
To verify the correctness of the implementation, I wrote 10 tests, 2 for each service method, and verified that they passed on the reference implementation. To characterize performance, I wrote a script that calculated the mean latency and throughput of 1000 comm operations.

*Correctness*: I wrote `10` tests; these tests take `10.033s` to execute.


*Performance*: I characterized the performance of comm and RPC by sending 1000 service requests in a tight loop. Average throughput and latency is recorded in `package.json`.


## Key Feature

> How would you explain the implementation of `createRPC` to someone who has no background in computer science — i.e., with the minimum jargon possible?

RPCs are an abstraction that let a node to run a function available only on a different node without having to worry about the networking/communication internals. RPCs allow the client node to run a function remotely just as if it were available locally.

RPCs are an abstraction that let a node to run a function available only on a different node without having to worry about the networking/communication internals. RPCs allow the client node to run a function remotely just as if it were available locally.


# M4: Distributed Storage


## Summary

> Summarize your implementation, including key challenges you encountered
To support local in memory storage, a hashmap was created in local/mem to support read and write operations locally. To support local disk storage, a very similar implementation to local storage was used but fs library functions and custom serialization/deserialization functions from M1 were used to write to the file system. Both of these implementations were fairly straightforward. 

To implement distributed in memory storage, hashing is first used to determine which node in a group to make a remote call to. Because different groups could be initialized with different hash functions, local/groups had to be updated to store both the gid and the hash function, which was something I didn't realize initially. In addition, debugging tests due to insufficient error handling on the first pass took most of the time of this milestone. In particular, handling the case where reading from an undefined key took particularly long to debug since reading from configuration.key when configuration is null returns undefined, not null. The error handling in this section took particularly long to debug. The distributed disk storage is almost identical to the in memory storage except that it calls the local/store service instead of local/mem.

Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M4 (`hours`) and the lines of code per task.


## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation


*Correctness* -- number of tests and time they take.
5 tests were written to handle common use cases for local and distributed store both loth in memory and in disk, including creating and putting multiple items across several nodes, and putting with null key. Test suite executes in 2.621s locally.

*Performance* -- insertion and retrieval.
Put and queried 1000 objects across 3 AWS EC2 micro instances with an average latency of 32.3ms for put and 31.9ms for query. Throughput of 31.0 operations/sec for put and 31.4 operations/sec for query.

## Key Feature

> Why is the `reconf` method designed to first identify all the keys to be relocated and then relocate individual objects instead of fetching all the objects immediately and then pushing them to their corresponding locations?

Transfering objects individually instead of processing an entire batch at once allows the system to be much more resilient to faults. If an error occurs while transferring an individual key, engineers are able to still keep track of the state because they know exactly which key failed. When a failure in a batch transfer occurs, we have no idea what keys have been moved to which nodes.


