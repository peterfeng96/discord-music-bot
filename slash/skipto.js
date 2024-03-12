import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("skipto")
    .setDescription("Skips to a certain track number")
    .addNumberOption((option) =>
      option
        .setName("tracknumber")
        .setDescription("The track to skip to")
        .setMinValue(1)
        .setRequired(true)
    ),

  run: async ({ client, interaction }) => {
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue)
      return await interaction.editReply("There are no songs in the queue");

    const node = queue.node;

    const trackNum = interaction.options.getNumber("tracknumber");
    if (trackNum > queue.tracks.length || trackNum < 1)
      return await interaction.editReply("Invalid track number");

    node.skipTo(trackNum - 1);

    await interaction.editReply(`Skipped ahead to track ${trackNum}.`);
  },
};
