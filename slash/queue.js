import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("displays the current song queue")
    .addNumberOption((option) =>
      option
        .setName("page")
        .setDescription("Page number of the queue")
        .setMinValue(1)
    ),
  run: async ({ client, interaction }) => {
    const queue = await client.player.nodes.get(interaction.guildId);
    if (!queue || !queue.isPlaying()) {
      return await interaction.editReply("There are no songs in the queue");
    }

    const totalPages = Math.ceil(queue.tracks.data.length / 10) || 1;
    const page = (interaction.options.getNumber("page") || 1) - 1;

    if (page > totalPages)
      return await interaction.editReply(
        `Invalid page. There are only a total of ${totalPages} pages of songs.`
      );

    const queueString = queue.tracks.data
      .slice(page * 10, page * 10 + 10)
      .map((song, idx) => {
        return `**${page * 10 + idx + 1}**. ${song.title} | ${song.duration}`;
      })
      .join("\n");
    const currentSong = queue.currentTrack;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**Currently playing:** ${
              currentSong
                ? currentSong.title + " | " + currentSong.duration
                : "None"
            }` + `\n\n**Queue**\n ${queueString}`
          )
          .setFooter({ text: `Page ${page + 1} of ${totalPages}.` })
          .setThumbnail(currentSong.thumbnail),
      ],
    });
  },
};
