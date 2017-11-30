const DiscordRPC = require('discord-rpc'),
      lastfm = require('lastfm'),
      log = require("fancy-log"),
      events = require('events'),
      fs = require('fs');

const keys = require('./keys.json');

const rpc = new DiscordRPC.Client({ transport: keys.rpcTransportType }),
      
      appClient = keys.appClientID,
      largeImageKey = keys.imageKeys.large,
      fm = require('lastfm').LastFmNode;
      lastFm = new fm({ api_key: keys.lastFmKey, secret: keys.lastFmSecret, useragent: 'fmcord v0.0.1' })
      smallImageKey = keys.imageKeys.small;

var songEmitter = new events.EventEmitter(),
    currentSong = {};

if(!keys.lastFmUsername) { log.error("Your last.fm username isn't set! Please set it in your keys.json file."); process.exit(0); }

var trackStream = lastFm.stream(keys.lastFmUsername);


trackStream.on('nowPlaying', song => {
  rpc.setActivity({
    details: `🎵  ${song.name}`,
    state: `👤  ${song.artist["#text"]}`,
		largeImageKey: largeImageKey,
    smallImageKey: smallImageKey,
    largeImageText: `⛓  ${song.url}`,
    smallImageText: `💿  ${song.album["#text"]}`,
		instance: false,
  });

  log.info(`Updated song to: ${song.artist["#text"]} - ${song.name}`);
});



rpc.on('ready', () => {
  log(`Connected to Discord! (${appClient})`);
  trackStream.start();
  
});

rpc.login(appClient).catch(log.error);
