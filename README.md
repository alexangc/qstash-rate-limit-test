# qStash's rate limit test

A simple publish/receive example of
[qStash](https://upstash.com/blog/qstash-announcement) with Vercel functions. To
receive http calls locally I've used [Ngrok](https://ngrok.com/).

## Caveats

As described in the
[official docs](https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms#sliding-window),
the sliding window algorithm is only an approximation. This means that depending
on the distribution of the requests, we can cross the threshold locally.

For example, the typically outcome of a batch of published messages would be:

```shell
Publishing to https://12ae-91-174-247-130.ngrok-free.app/api/receive
Done publishing messages.
2024-08-13T11:59:22.739Z { id: 'message-1' } Processing ... { retried: '0', remaining: 1 }
2024-08-13T11:59:22.755Z { id: 'message-4' } Processing ... { retried: '0', remaining: 0 }
2024-08-13T11:59:25.158Z { id: 'message-3' } BOUNCING { retried: '0', remaining: 0 }
2024-08-13T11:59:25.722Z { id: 'message-5' } BOUNCING { retried: '0', remaining: 0 }
2024-08-13T11:59:27.315Z { id: 'message-2' } BOUNCING { retried: '0', remaining: 0 }
2024-08-13T11:59:27.745Z { id: 'message-1' } Processed
2024-08-13T11:59:27.762Z { id: 'message-4' } Processed
2024-08-13T11:59:40.801Z { id: 'message-3' } Processing ... { retried: '1', remaining: 1 }
2024-08-13T11:59:41.728Z { id: 'message-5' } Processing ... { retried: '1', remaining: 0 }
2024-08-13T11:59:44.407Z { id: 'message-2' } BOUNCING { retried: '1', remaining: 0 }
2024-08-13T11:59:45.805Z { id: 'message-3' } Processed
2024-08-13T11:59:46.733Z { id: 'message-5' } Processed
```

However, it can also be:

```shell
Publishing to https://12ae-91-174-247-130.ngrok-free.app/api/receive
Done publishing messages.
2024-08-13T12:01:24.581Z { id: 'message-2' } Processing ... { retried: '0', remaining: 1 }
2024-08-13T12:01:24.662Z { id: 'message-4' } Processing ... { retried: '0', remaining: 0 }
2024-08-13T12:01:24.960Z { id: 'message-3' } BOUNCING { retried: '0', remaining: 0 }
2024-08-13T12:01:27.806Z { id: 'message-5' } BOUNCING { retried: '0', remaining: 0 }
2024-08-13T12:01:28.244Z { id: 'message-1' } BOUNCING { retried: '0', remaining: 0 }
2024-08-13T12:01:29.590Z { id: 'message-2' } Processed
2024-08-13T12:01:29.670Z { id: 'message-4' } Processed
2024-08-13T12:01:40.138Z { id: 'message-3' } Processing ... { retried: '1', remaining: 1 }
2024-08-13T12:01:43.069Z { id: 'message-5' } Processing ... { retried: '1', remaining: 1 }
2024-08-13T12:01:44.597Z { id: 'message-1' } Processing ... { retried: '1', remaining: 0 }
2024-08-13T12:01:45.148Z { id: 'message-3' } Processed
2024-08-13T12:01:48.073Z { id: 'message-5' } Processed
2024-08-13T12:01:49.603Z { id: 'message-1' } Processed
```

In the latter, we can see that 3 messages are processed on retry, even-though
they arrived in a 5 seconds window. The only way to be rigorously safe, when
using a third party and trying to avoid their rate limit, would therefore be to
divide their rate limit by half to define our own.

## Misc

- Vercel's functions: https://vercel.com/docs/functions/functions-api-reference
- `vercel.json`: https://vercel.com/docs/projects/project-configuration
- Upstash rate limit's sliding window algorithm:
  https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms#sliding-window
- Standalone minimal example of `@upstash/ratelimit`:
  https://github.com/alexangc/test-qstash-rate-limit-standalone
