const DiscordRPC = require('discord-rpc'),
      {LastFmNode} = require('lastfm'),
      log = require("fancy-log");

const keys = require('./keys.json');

const rpc = new DiscordRPC.Client({ transport: keys.rpcTransportType }),
      clientId = keys.appClientID,
      lastFm = new LastFmNode({ api_key: keys.lastFmKey, useragent: 'fmcord v0.0.2' });

if(!keys.lastFmUsername) { log.error("Your last.fm username isn't set! Please set it in your keys.json file."); process.exit(0); }
var trackStream = lastFm.stream(keys.lastFmUsername);

trackStream.on('nowPlaying', song => {
  rpc.setActivity({
    details: `🎵  ${song.name}`,
    state: `👤  ${song.artist["#text"]}`,
		largeImageKey: keys.imageKeys.large,
    smallImageKey: keys.imageKeys.small,
    largeImageText: `⛓  ${song.url}`,
    smallImageText: `💿  ${song.album["#text"]}`,
		instance: false,
  });

  log.info(`Updated song to: ${song.artist["#text"]} - ${song.name}`);
});



rpc.on('ready', () => {
  log(`Connected to Discord! (${clientId})`);
  trackStream.start();
});

rpc.login({clientId}).catch(log.error);
