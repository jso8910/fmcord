const DiscordRPC = require('discord-rpc'),
      {LastFmNode} = require('lastfm'),
      log = require("fancy-log");

const {
  appClientID,
  imageKeys,
  rpcTransportType,
  lastFmKey,
  lastFmUsername,
} = require('./config');

const rpc = new DiscordRPC.Client({ transport: rpcTransportType }),
      clientId = appClientID,
      lastFm = new LastFmNode({ api_key: lastFmKey, useragent: 'fmcord v0.0.2' });

if(!lastFmUsername) {
  log.error("Your last.fm username isn't set! Please set it in your config.json file.");
  process.exit(1);
}

const trackStream = lastFm.stream(lastFmUsername);


trackStream.on('nowPlaying', song => {
  if(!song) return;
  rpc.setActivity({
    details: `🎵  ${song.name}`,
    state: `👤  ${song.artist["#text"]}`,
    largeImageKey: imageKeys.large,
    smallImageKey: imageKeys.small,
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
