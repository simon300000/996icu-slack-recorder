const got = require('got')
const WebSocket = require('ws')

const token = require('./token');

;
(async () => {
  let url = JSON.parse((await got('https://slack.com/api/rtm.connect?token=' + token)).body).url
  // https://api.slack.com/methods/rtm.connect/
  console.log(`URL: ${url}`)
  const client = new WebSocket(url);

  client.on('open', () => {
    console.log('wss Connected')
  })
  client.on('message', data => {
    let object = JSON.parse(data)
    if (object.type == 'hello') {
      console.log('Hello from Slack')
    }
    if (object.type == 'message') {
      console.log(`${object.user}在${object.channel}说: ${object.text}`)
    }
  })
  client.on('close', () => {
    console.log('wss Closed')
  })
})()
