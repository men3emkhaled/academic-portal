const pino = require('pino');

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const isTest = env === 'test';

let transport;
if (isDev) {
  const hasPinoPretty = (() => {
    try {
      require.resolve('pino-pretty');
      return true;
    } catch {
      return false;
    }
  })();

  if (hasPinoPretty) {
    transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };
  }
}

const logger = pino({
  level: isTest ? 'silent' : (process.env.LOG_LEVEL || (isDev ? 'debug' : 'info')),
  transport,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password', 'body.token'],
    censor: '[REDACTED]',
  },
});

module.exports = logger;
