import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses the music"),

  run: async ({ client, interaction }) => {
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue)
      return await interaction.editReply("There are no songs in the queue");

    const node = queue.node;

    node.pause();

    await interaction.editReply(
      "Music has been paused. Use '/resume' to resume the music."
    );
  },
};
