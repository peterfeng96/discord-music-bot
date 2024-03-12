import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Displays info about the current song."),

  run: async ({ client, interaction }) => {
    // User must be in a voice channel
    if (!interaction.member.voice.channel)
      return interaction.editReply(
        "You need to be in a voice channel to use this command"
      );

    // Get the queue
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue)
      return await interaction.editReply("There are no songs in the queue");
    // Node that actually plays the music
    const node = queue.node;

    const bar = node.createProgressBar();
    const song = queue.currentTrack;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setThumbnail(song.thumbnail)
          .setDescription(
            `Currently playing [${song.title}](${song.url}) - ${song.author}\n` +
              bar
          ),
      ],
    });
  },
};
