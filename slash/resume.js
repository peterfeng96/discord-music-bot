import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resumes the music"),

  run: async ({ client, interaction }) => {
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue)
      return await interaction.editReply("There are no songs in the queue");

    const node = queue.node;

    node.resume();
    await interaction.editReply("Music has been resumed.");
  },
};
