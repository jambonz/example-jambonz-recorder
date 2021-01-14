# example-jambonz-recorder

This is a simple example of a jambonz application that records an incoming call and generates real-time transcripts during the call.  An example use case would be an outdial from a conference that is intended to be a recording leg.

## Installing and running the app

```
npm install
RECORDING_FOLDER=~/tmp node app.js
```

The application uses [fastify](https://www.fastify.io/) to create a simple web server listening on port 3000.  

It responds to a GET / by returning a json payload including a single verb, listen.

It responds to a POST /audio-transcribe by logging the provided transcription.

It responds to a websocket connection on /audiofeed by recording the audio to a file in the recording folder with a filetype of '.l16'.  The file contains a recording of the call in linear 16 format (i.e. 16-bit pcm) at 8khz sample rate, with no header (i.e. raw data).