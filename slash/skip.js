import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song"),

  run: async ({ client, interaction }) => {
    const queue = await client.player.nodes.get(interaction.guildId);
    if (!queue)
      return await interaction.editReply("There are no songs in the queue");
    const node = queue.node;

    let song = queue.currentTrack;

    node.skip();
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${song} has been skipped!`)
          .setThumbnail(song.thumbnail),
      ],
    });
  },
};
