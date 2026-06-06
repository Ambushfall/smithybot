const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getFullRecipe, getFlattenedRecipeChain } = require('../../utils/datamanager');
const data = require("../../normalized-data.json")

// Helper to format the list recursively
function formatMaterials(mats, indent = '') {
    return mats.map(m => {
        let str = `${indent}${m.isCraftable ? '🛠️' : '📦'} ${m.amount}x ${m.name}`;
        if (m.subMaterials.length > 0) {
            str += '\n' + formatMaterials(m.subMaterials, indent + '    ');
        }
        return str;
    }).join('\n');
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('recipe')
        .setDescription('Look up a recipe by its ID#')
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Weapon or Food')
                .setRequired(true)
                .addChoices(
                {
                    name: "Weapons", value: "weapons"
                },
                {
                    name: "Food", value: "food"
                },
            )
        )
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID# of the recipe from the game')
                .setRequired(true)),

    async execute(interaction) {
        const recipeId = interaction.options.getInteger('id');
        const type = interaction.options.getString('type');
        console.log(type);
        const chain = getFlattenedRecipeChain(recipeId, type); // New helper

        if (!chain) return interaction.reply(`Recipe ID# ${recipeId} not found.`);

        const embeds = chain.map((recipe, index) => {
            const embed = new EmbedBuilder()
                .setTitle(`${index === 0 ? 'Main' : 'Sub-item'} Recipe: ${recipe.name}`)
                .setColor(index === 0 ? 0x0099ff : 0x57f287) // Blue for main, Green for sub
                .addFields(
                    { name: 'Job Lvl', value: `${recipe.job_lvl || 0}`, inline: true },
                    { name: 'Chance', value: `${(recipe.chance * 100).toFixed(0)}%`, inline: true },
                    {
                        name: 'Materials Required',
                        value: recipe.materials.map(m => {
                            const item = data.items[m.item_id];
                            return `• ${m.amount}x ${item ? item.name : m.item_id}`;
                        }).join('\n')
                    }
                )
                .setFooter({ text: `ID: ${recipe.id} | Step ${chain.length - index} of ${chain.length}` });

            return embed;
        });

        // Discord allows up to 10 embeds per message
        await interaction.reply({ embeds: embeds.slice(0, 10) });
    }
};