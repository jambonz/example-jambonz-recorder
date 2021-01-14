const assert = require('assert');
const fs = require('fs');
const fastify = require('fastify')({ logger: true });
fastify.register(require('fastify-websocket'));

assert.ok(process.env.RECORDING_FOLDER, 'env RECORDING_FOLDER is required');

/* return the application to execute */
fastify.get('/', async (request, reply) => {
  return [{
    listen: {
      url: '/audiofeed',
      mixType: 'mono',
      playBeep: true,
      transcribe: {
        transcriptionHook: '/audio-transcribe',
        recognizer: {
          vendor: 'google',
          interim: false,
          dualChannel: false
        }
      }
    }
  }];
})

/* web callback for transcriptions */
fastify.post('/audio-transcribe', async (request, reply) => {
  fastify.log.info({transcript: request.body.speech}, 'got a transcript');
  reply.code(200).send();
});

/* websocket to receive audio */
let idx = 0;
fastify.get('/audiofeed', { websocket: true }, (connection, req) => {
  connection.socket.on('message', msg => {
    if (typeof msg === 'string') {
      connection.wstream = fs.createWriteStream(`${process.env.RECORDING_FOLDER}/recording-${++idx}.l16`);
      fastify.log.info(msg, 'received new connection with metadata');
    }
    else if (connection.wstream) {
      connection.wstream.write(msg);
    }
  });
  connection.socket.on('close', () => {
    fastify.log.info(`socket closed`);
    if (connection.wstream) connection.wstream.close();
  });
});

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
};

start();