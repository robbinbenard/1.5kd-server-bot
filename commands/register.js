const axios = require('axios')
const { Message, MessageEmbed, Client } = require('discord.js')

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {Array} args 
 * @returns 
 */
module.exports.run = async (client, message, args) => {

    // Check for a valid URL.
    const matches = message.content.match(`https://cod\\.tracker\\.gg/warzone/profile/([A-z]+)/([A-z0-9%]+)`)  

    if (! matches) {
        await message.channel.send('Invalid URL')
        return
    }

    
    // Get the profile data.
    let kdRatio, platform, handle
    try {
        const { data } = await axios.get(`https://api.tracker.gg/api/v2/warzone/standard/profile/${matches[1]}/${matches[2]}`)

        kdRatio = data.data.segments[1].stats.kdRatio.value
        platform = data.data.platformInfo.platformSlug
        handle = data.data.platformInfo.platformUserHandle
    } catch (e) {
        await message.channel.send('Whoops, something went wrong fetching your profile.')
        throw e
    }
    
    
    // Assign the role.
    try {
        const roles = [
            { name: 'Sweats (1.5+kd)', minimumKd: 1.5 },
            { name: 'Mega Sweats (2+kd)', minimumKd: 2.0 },
            { name: 'Hyper Sweats (2.5+kd)', minimumKd: 2.5 },
            { name: 'Ultra Sweats (3+kd)', minimumKd: 3.0 },
        ];

        const roleToAsign = roles.reduce((carry, role) => kdRatio >= role.minimumKd ? role : carry, null)

        if (! roleToAsign) {
            await message.channel.send(`Hey ${message.member.displayName}. Your KD is too low to get a server role.`)
        }

        for (role of roles) {
            const guildRole = message.guild.roles.cache.find(guildRole => guildRole.name == role.name);
            
            if (! guildRole) {
                throw new Error(`Can't find the role for ${role.name}`);
            }

            if (roleToAsign && guildRole.name == roleToAsign.name) {
                await message.member.roles.add(guildRole)

                const embed = new MessageEmbed()
                    .setTitle(`Welcome ${message.author.username}`)
                    .setDescription(`You've been assigned the **${guildRole.name}** role`)
                    .setFooter([
                        `platform: ${platform}`,
                        `handle: ${handle}`,
                        `kd: ${kdRatio}`,
                    ].join("\n"))
                await message.channel.send(embed)
            } else {
                await message.member.roles.remove(guildRole)
            }
        }
    } catch (e) {
        await message.channel.send('Something went wrong assigning a role. Check if the bot has the permission to manage roles.')
        throw e
    }
}