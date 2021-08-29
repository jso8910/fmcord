const DiscordRPC = require('discord-rpc'),
      { LastFmNode } = require('lastfm'),
      fs = require('fs'),
      log = require("fancy-log");

if(fs.existsSync('keys.json')) {
  fs.renameSync('keys.json', 'config.json');
  log.info('Renamed keys.json to config.json');
}

if(!fs.existsSync('config.json')) {
  fs.copyFileSync('config.example.json', 'config.json')
  log.info('Created config.json. Please enter your username in the value of `lastFmUsername`.');
  return;
}

const {
  appClientID,
  imageKeys,
  rpcTransportType: transport,
  lastFmKey,
  lastFmUsername,
} = require('./config');

const rpc = new DiscordRPC.Client({ transport }),
      clientId = appClientID,
      lastFm = new LastFmNode({ api_key: lastFmKey, useragent: 'fmcord v1.0.0' });

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
    smallImageText: `💿 ${song.album["#text"]}`,
    instance: false,
  });

  log.info(`Updated song to: ${song.artist["#text"]} - ${song.name}`);
});

trackStream.on('error', error => {
    log.error(error)
})

rpc.on('ready', () => {
  log(`Connected to Discord! (${clientId})`);
  trackStream.start();
});

rpc.login({ clientId }).catch(log.error);
