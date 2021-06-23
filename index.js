require('dotenv').config()

const fs = require("fs")
var path = require('path')
const { Client,  Collection} = require('discord.js')

const client = new Client()
client.commands = new Collection()
const prefix = process.env.COMMAND_PREFIX

fs.readdir("./commands/", (err, files) => {
	if (err) {
		console.log(err)
	} else {
		files.forEach((file, i) => {
			const command = require(`./commands/${file}`)
			console.log(file, path.basename(file, '.js'))
			client.commands.set(path.basename(file, '.js'), command)
		})
	} 
})

client.on("message", async message => {
	if (! message.content.startsWith(prefix) || message.author.bot) {
		return
	}
  
	const args = message.content.slice(prefix.length).trim().split(' ')
	const command = args.shift().toLowerCase()
	
	const commandfile = client.commands.get(command)
	
	if (commandfile) {
		commandfile.run(client, message, args)
	}
})

client.login(process.env.CLIENT_TOKEN)