import "dotenv/config";
import fs from "fs";

import { Client, Events, GatewayIntentBits, Collection } from "discord.js";
import { Player } from "discord-player";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

// Bot secret token
const TOKEN = process.env.CLIENT_TOKEN;
// Bot client id
const CLIENT_ID = process.env.CLIENT_ID;
// Server/guild id
const GUILD_ID = process.env.GUILD_ID;

// One time command to load commands to server
// To run - 'npm start load'
const LOAD_SLASH = process.argv[2] == "load";

// Client - Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

// Creating instance of discord-player
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWatermark: 1 << 25,
  },
});
// Load extractors
client.player.extractors.loadDefault();
// Collection to hold slash commands
client.slashcommands = new Collection();
// Array to hold slash commands
const commands = [];
// Import slash command files
const slashFiles = fs
  .readdirSync("./slash")
  .filter((file) => file.endsWith(".js"));

for (let file of slashFiles) {
  const slashCommand = await import(`./slash/${file}`);
  client.slashcommands.set(slashCommand.default.data.name, slashCommand);
  if (LOAD_SLASH) commands.push(slashCommand.default.data.toJSON());
}
// One time command to load commands to server
// To run - 'npm start load'
if (LOAD_SLASH) {
  const rest = new REST({ version: "9" }).setToken(TOKEN);
  console.log("Deploying slash commands");
  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
    .then(() => {
      console.log("Successfully loaded.");
      process.exit(0);
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
} else {
  //To run - 'npm start'
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  client.on(Events.InteractionCreate, (interaction) => {
    async function handleCommand() {
      if (!interaction.isCommand()) return;

      const slashcmd = client.slashcommands.get(interaction.commandName);
      if (!slashcmd) interaction.reply("Not a valid command");
      await interaction.deferReply();
      await slashcmd.default.run({ client, interaction });
    }
    handleCommand();
  });
  // LOGIN
  client.login(TOKEN);
}
