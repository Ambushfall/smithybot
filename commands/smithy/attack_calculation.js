
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('attack')
        .setDescription('Calculate attack for the given <**Level**> <**Attack Level**> and <**Rebirth**> values')
        .addNumberOption((option) => option.setName('level')
            .setDescription('What is your level')
            .setRequired(true))
        .addNumberOption((option) => option.setName('attack')
            .setDescription('What is your attack level')
            .setRequired(true))
        .addNumberOption((option) => option.setName('rebirth')
            .setDescription('What is your rebirth level')
            .setRequired(true)),
    async execute(interaction) {
        const level = interaction.options.getNumber('level') ?? 1;
        const attack = interaction.options.getNumber('attack') ?? 1;
        const rebirth = interaction.options.getNumber('rebirth') ?? 0;
        var eCLV = level;
        var eATK = attack;
        var eRBT = rebirth;
        var eBNS = 1 + (parseInt(eRBT / 10) * 0.3);
        var eBATK = Math.floor((eCLV + (eCLV * Math.floor(eCLV / 7))) * (1 + (eATK * 0.01)) * (1 + (eRBT * 0.1)) * eBNS);
        await interaction.reply(`Base Attack: ${eBATK}`);

    },
};