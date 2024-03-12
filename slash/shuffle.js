import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the queue"),

  run: async ({ client, interaction }) => {
    const queue = client.player.nodes.get(interaction.guildId);

    if (!queue)
      return await interaction.editReply("There are no songs in the queue");

    queue.enableShuffle();
    await interaction.editReply("Shuffle play enabled.");
  },
};
