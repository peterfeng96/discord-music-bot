import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { QueryType } from "discord-player";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Searches for song based on provided keywords")
    .addSubcommand((subcommand) =>
      // SONG SUBCOMMAND
      subcommand
        .setName("song")
        .setDescription("Search for a song")
        .addStringOption((option) =>
          option
            .setName("song-artist")
            .setDescription("input song-artist")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      // YOUTUBE PLAYLIST SUBCOMMAND
      subcommand
        .setName("youtube-playlist")
        .setDescription("Loads a youtube playlist from a url")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("the playlist's url")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      // SPOTIFY PLAYLIST SUBCOMMAND
      subcommand
        .setName("spotify-playlist")
        .setDescription("Loads a spotify playlist from a url")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("the playlist's url")
            .setRequired(true)
        )
    ),

  run: async ({ client, interaction }) => {
    // User must be in a voice channel
    if (!interaction.member.voice.channel)
      return interaction.editReply(
        "You need to be in a voice channel to use this command"
      );
    // Create a queue to store songs
    const queue = await client.player.nodes.create(interaction.guildId);
    // Connects bot to the user's current voice channel
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);
    // Node that actually plays the music
    const node = queue.node;

    // Embed - response from bot
    let embed = new EmbedBuilder();

    // SONG SEARCH
    if (interaction.options.getSubcommand() === "song") {
      let keywords = interaction.options.getString("song-artist");
      const result = await client.player.search(keywords, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });
      if (!result.hasTracks()) {
        return interaction.editReply("No results");
      }
      // Add's the first result
      const song = result.tracks[0];
      await queue.addTrack(song);
      // Set embed data
      embed
        .setDescription(
          `**[${song.title}](${song.url})** has been added to the queue.`
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` });
    }
    // YOUTUBE PLAYLIST
    else if (interaction.options.getSubcommand() === "youtube-playlist") {
      let url = interaction.options.getString("url");
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_PLAYLIST,
      });
      if (!result.hasTracks()) {
        return interaction.editReply("No results");
      }
      // Add all tracks from playlist
      const playlist = result.playlist;
      const song = result.tracks[0];
      await queue.addTrack(result.tracks);
      // Set embed data
      if (playlist) {
        embed
          .setDescription(
            `${result.tracks.length} songs from **[${playlist.title}](${playlist.url})** has been added to the queue.`
          )
          .setThumbnail(playlist.thumbnail);
      } else {
        // If user input song url, not youtube URL.
        embed
          .setDescription(
            `URL is not a playlist. **[${song.title}](${song.url})** has been added to the queue.`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` });
      }
    }
    // SPOTIFY PLAYLIST
    else if (interaction.options.getSubcommand() === "spotify-playlist") {
      let url = interaction.options.getString("url");
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.SPOTIFY_PLAYLIST,
      });
      if (!result.hasTracks()) {
        return interaction.editReply("No results");
      }

      // Add all tracks from playlist
      const playlist = result.playlist;
      const song = result.tracks[0];
      await queue.addTrack(result.tracks);
      // Set embed data
      if (playlist) {
        embed
          .setDescription(
            `${result.tracks.length} songs from **[${playlist.title}](${playlist.url})** has been added to the queue.`
          )
          .setThumbnail(playlist.thumbnail);
      } else {
        // If user input song url, not youtube URL.
        embed
          .setDescription(
            `URL is not a playlist. **[${song.title}](${song.url})** has been added to the queue.`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` });
      }
    }

    // If the player has not already started, start
    if (!node.isPlaying()) await node.play();

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
