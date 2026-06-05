import { SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const cwd = process.cwd();


export const data = new SlashCommandBuilder()
    .setName('recipes')
    .setDescription('recipe lookup with ID')
    .addStringOption((option) => option.setName('type')
        .setDescription('Weapon or Food recipes')
        .setChoices(
            { name: 'Weapons', value: 'Weapon' },
            { name: 'Foods', value: 'Food' })
        .setRequired(true))
    .addNumberOption((option) => option.setName('id')
        .setDescription('Which weapon ID to look for.')
        .setRequired(true));
export async function execute(interaction) {
    const type = interaction.options.getString('type')
    const id = interaction.options.getNumber('id') ?? 1;
    await interaction.reply(readFileSync(join(cwd, `${type}Recipe`, String(id)), { encoding: "utf-8" }));
}