const fs = require('fs')
const got = require('got')
const WebSocket = require('ws')

const token = require('./token')

const userBlackList = [
  'UHDQR2VT3'
]

;
(async () => {
  // https://api.slack.com/methods/conversations.list
  let rawChannels = JSON.parse((await got(`https://slack.com/api/conversations.list?token=${token}`)).body).channels
  let channels = {}
  for (let i = 0; i < rawChannels.length; i++) {
    channels[rawChannels[i].id] = rawChannels[i].name
  }

  // https://api.slack.com/methods/rtm.connect/
  let url = JSON.parse((await got(`https://slack.com/api/rtm.connect?token=${token}`)).body).url
  console.log(`URL: ${url}`)

  const client = new WebSocket(url);
  // https://api.slack.com/rtm
  client.on('open', () => {
    console.log('wss Connected')
  })
  client.on('message', async data => {
    let object = JSON.parse(data)
    if (!userBlackList.includes(object.user)) {
      if (object.type == 'hello') {
        console.log('Hello from Slack')
      }
      if (object.type == 'message' && object.text) {
        let date = new Date()
        let text = object.text
        let channel = channels[object.channel] || object.channel
        console.log(`${channel}: ${text}`)
        fs.appendFileSync(`./records/${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${channel}.txt`, text + '\n')
      }
      if (object.type == 'channel_created' || object.type == 'channel_deleted' || object.type == 'channel_rename') {
        let updateChannels = JSON.parse((await got(`https://slack.com/api/conversations.list?token=${token}`)).body).channels
        for (let i = 0; i < updateChannels.length; i++) {
          channels[updateChannels[i].id] = updateChannels[i].name
        }
        console.log('updateChannels')
      }
    }
  })
  client.on('close', () => {
    console.log('wss Closed')
  })
})()
