const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, 
    StringSelectMenuBuilder, ChannelType, PermissionFlagsBits 
} = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot is Live!'));
app.listen(process.env.PORT || 8080);

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// --- [ ส่วนที่ 1: ตั้งค่าไอดีต่างๆ ] ---
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const STAFF_ROLE_ID = '1445029891329490944'; // [!] แก้ไข: ไอดี Role ที่จะให้เห็นห้องตั๋ว
const TICKET_CATEGORY_ID = '1472558951747817594'; // [!] แก้ไข: ไอดี Category ที่จะให้ห้องตั๋วไปอยู่
const GUILD_ID = '1343792416011980913'; // 3. ใส่ไอดีเซิร์ฟเวอร์ของคุณ (เพื่อให้คำสั่ง / ขึ้นไวขึ้น)

client.once('ready', async () => {
    console.log(`✅ บอทออนไลน์: ${client.user.tag}`);
    
    // ลงทะเบียน Slash Command
    const commands = [
        {
            name: 'setup-ticket',
            description: 'ตั้งค่าข้อความสำหรับเปิด Ticket',
        },
        {
            name: 'setup-verify',
            description: 'ตั้งค่าข้อความยืนยันตัวตน',
        }
    ];
    
    await client.application.commands.set(commands);
});

// --- [ ส่วนที่ 2: ระบบจัดการ Interaction (ปุ่ม/เมนู/Modal) ] ---
client.on('interactionCreate', async (interaction) => {

    // 1. คำสั่งสร้างระบบ Ticket
    if (interaction.commandName === 'setup-ticket') {
        const embed = new EmbedBuilder()
            .setTitle('🎫 ศูนย์ช่วยเหลือ (Support Ticket)')
            .setDescription('เลือกหัวข้อที่ต้องการแจ้งเรื่องด้านล่าง ทีมงานจะรีบตอบกลับครับ')
            .setColor('#5865F2');

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('เลือกหัวข้อที่ต้องการจะติดต่อ')
            .addOptions([
                { label: 'แจ้งปัญหา/บัค', value: 'bug', emoji: '🐛' },
                { label: 'ติดต่อสอบถาม', value: 'support', emoji: '💬' },
                { label: 'ติดต่อส่งเอกสาร', value: 'billing', emoji: '📃' },
            ]);

        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
    }

    // 2. เมื่อคนกดเลือกหัวข้อ Ticket
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        await interaction.deferReply({ ephemeral: true });

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            ],
        });

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 ตั๋วสำหรับ: ${interaction.values[0]}`)
            .setDescription(`สวัสดีครับ ${interaction.user} กรุณาพิมพ์รายละเอียดทิ้งไว้\nทีมงาน <@&${STAFF_ROLE_ID}> จะรีบมาช่วยเหลือครับ`)
            .setColor('#2ecc71');

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [ticketEmbed], components: [closeBtn] });
        await interaction.editReply(`สร้างช่องตั๋วแล้วที่ ${channel}`);
    }

    // 3. ปุ่มปิด Ticket
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply('กำลังปิดห้องนี้ใน 5 วินาที...');
        setTimeout(() => interaction.channel.delete(), 5000);
    }

    // 4. คำสั่งสร้างระบบยืนยันตัวตน (Google Sheets)
    if (interaction.commandName === 'setup-verify') {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ ยืนยันตัวตน (Verify)')
            .setDescription('กดปุ่มด้านล่างเพื่อยืนยันตัวตนด้วยรหัสจากในเกม')
            .setColor('#2ecc71');
        const btn = new ButtonBuilder().setCustomId('v_start').setLabel('เริ่มยืนยัน').setStyle(ButtonStyle.Success);
        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(btn)] });
    }

    // [!] ระบบ Verification (v_start และ v_modal) ให้ใช้โค้ดเดิมที่คุณมีต่อท้ายตรงนี้ได้เลยครับ
});

const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const nblocean = require('noblox.js');
const axios = require('axios');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ใส่ URL จาก Google Apps Script ที่คุณทำในขั้นตอนที่แล้ว
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwvxrGAPKnBV58GPkKHnYX1kgs3EHJu-9fu8ZTZcxtbvYzBKKHwhgS3YX5H1tDpwYuqCA/exec"; 
const BASE_ROLE_ID = "1428804583471448264";
const GAME_ID = "01152026_1";

// ตารางยศ (คงเดิมตามที่คุณตั้งค่าไว้)
// รายการกลุ่มพันธมิตร 32 กลุ่ม
const allianceGroups = [
    { gid: 36092768, rid: "1428804759732883586" }, { gid: 36092799, rid: "1428804629201686700" },
    { gid: 36092348, rid: "1428804623749353603" }, { gid: 36092314, rid: "1428804618657333440" },
    { gid: 36092780, rid: "1428804829664383006" }, { gid: 35912825, rid: "1428804714488922163" },
    { gid: 36079757, rid: "1428804608565973223" }, { gid: 36079801, rid: "1428804644183871588" },
    { gid: 36042771, rid: "1428804634155417712" }, { gid: 35850671, rid: "1428804797884141568" },
    { gid: 35887361, rid: "1428804854964424745" }, { gid: 35858440, rid: "1428804699544485958" },
    { gid: 35853818, rid: "1428804844822466762" }, { gid: 35850934, rid: "1428804613175377981" },
    { gid: 35850786, rid: "1428804684537266276" }, { gid: 35850680, rid: "1428804834739621979" },
    { gid: 35850651, rid: "1428804744758956174" }, { gid: 35850689, rid: "1428804774769332236" },
    { gid: 35850660, rid: "1428804739784773834" }, { gid: 35850694, rid: "1428804694637150208" },
    { gid: 35840551, rid: "1428804839772520448" }, { gid: 35834110, rid: "1428804689465446500" },
    { gid: 35830419, rid: "1428804588450091163" }, { gid: 35783970, rid: "1428804669634908240" },
    { gid: 35783904, rid: "1428804859972419825" }, { gid: 35783711, rid: "1428804639179931700" },
    { gid: 35674578, rid: "1428804724550926577" }, { gid: 35459450, rid: "1428804769895415958" },
    { gid: 35459351, rid: "1428804780511465593" }, { gid: 35687746, rid: "1428804598642249748" },
    { gid: 35734424, rid: "1428804679596511262" }, { gid: 35459390, rid: "1428804849851437068" }
];

// รายการยศที่ใช้เช็คชื่อในดิสเก่า
const rankSettings = {
    "[FOU] Founder | ผู้ก่อตั้ง": { prefix: "", roleId: "1469940093941715066" },
    "[ Administrator map | ผู้ดูแลเเมพ ]": { prefix: "</> | ", roleId: "1469940087402791056" },
    "[ Developer | สมาชิกผู้พัฒนา ]": { prefix: "</> | ", roleId: "1469940087402791056" },
    "[ Chief of the Defence Forces | ผู้บัญชาการทหารสูงสุด ]": { prefix: "OF-10, FIM, CDF | ", roleId: "1469940085842772099" },
    "[ Deputy Chief of Defence Force | รองผู้บัญชาการทหารสูงสุด ]": { prefix: "OF-10, FIM, DCDF | ", roleId: "1469940085842772099" },
    "[ Commander in Chief | ผู้บัญชาการทหารบก ]": { prefix: "OF-10, FIM, CIC | ", roleId: "1469940085842772099" },
    "[ Deputy Commander in Chief | รองผู้บัญชาการทหารบก ]": { prefix: "OF-10, FIM, DCIC | ", roleId: "1469940085842772099" },
    "[ His Majesty The King | พระมหากษัตริย์ ]": { prefix: "HMK | ", roleId: "1469940085842772099" },
    "[ Her Majesty Queen | พระบรมราชินี ]": { prefix: "HMQ | ", roleId: "1469940085842772099" },
    "[ Crown Prince | สมเด็จพระบรมโอรสาธิราช ]": { prefix: "CP | ", roleId: "1469940085842772099" },
    "[ His Royal Highness | เจ้าฟ้า ]": { prefix: "HRH | ", roleId: "1469940084437553347" },
    "[ Her Highness Princess | พระองค์เจ้า ]": { prefix: "HHP | ", roleId: "1469940084437553347" },
    "[ Field Marshal | จอมพล ]": { prefix: "OF-10, FIM | ", roleId: "1469940084437553347" },
    "[ Mom Rajawong | หม่อมราชวงศ์ ]": { prefix: "MR | ", roleId: "1469940084437553347" },
    "[ Privy Councilor | องคมนตรี ]": { prefix: "PC | ", roleId: "1469940084437553347" },
    "[ Prime Minister | นายกรัฐมนตรี ]": { prefix: "PM | ", roleId: "1469940084437553347" },
    "[ Deputy Prime Minister | รองนายกรัฐมนตรี ]": { prefix: "DPM | ", roleId: "1469940084437553347" },
    "[ Minister of Defence | รัฐมนตรีว่าการกระทรวงกลาโหม ]": { prefix: "IM, OF-9, GEN | ", roleId: "1469940084437553347" },
    "[ Chief of staff | เสนาธิการทหารบก ]": { prefix: "OF-9, GEN, COS | ", roleId: "1469940084437553347" },
    "[ OF-9] General | พลเอก": { prefix: "OF-9, GEN | ", roleId: "1469940084437553347" },
    "[ OF-8] Lieutenant General | พลโท": { prefix: "OF-8, LTGEN | ", roleId: "1469940048828043375" },
    "[ OF-7] Major General | พลตรี": { prefix: "OF-7, MAJGEN | ", roleId: "1469940081652535460" },
    "[ OF-5] Colonel | พันเอก": { prefix: "OF-5, COL | ", roleId: "1469940081652535460" },
    "[ OF-4] Lieutenant Colonei | พันโท": { prefix: "OF-4, LTC | ", roleId: "1469940081652535460" },
    "[ OF-3] Major | พันตรี": { prefix: "OF-3, MAJ | ", roleId: "1469940078733168641" },
    "[ OF-2] Captain | ร้อยเอก": { prefix: "OF-2, CAPT | ", roleId: "1469940080180465799" },
    "[ OF-1B] 1st Lieutenant | ร้อยโท": { prefix: "OF-1b, 1LT | ", roleId: "1469940080180465799" },
    "[ OF-1A] 2nd Lieutenant | ร้อยตรี": { prefix: "OF-1a, 2LT | ", roleId: "1469940082797449269" },
    "[OF-(D)] Army Cadet Officers | นักเรียนนายร้อย": { prefix: "OF-D, ACO | ", roleId: "1469940082797449269" },
    "[ OR-8] Sergeant Major | จ่าสิบเอก": { prefix: "OR-8, SM1 | ", roleId: "1469940077357568155" },
    "[ OR-7] Sergeant Major 2nd | จ่าสิบโท": { prefix: "OR-7, SM2 | ", roleId: "1469940075784700168" },
    "[ OR-6] Sergeant Major 3rd | จ่าสิบตรี": { prefix: "OR-6, SM3 | ", roleId: "1469940048828043375" },
    "[ OR-5] Sergeant | สิบเอก": { prefix: "OR-5, SGT | ", roleId: "1469940048828043375" },
    "[ OR-4] Corporal | สิบโท": { prefix: "OR-4, SGT | ", roleId: "1469940048828043375" },
    "[ OR-3] Lance Corporal | สิบตรี": { prefix: "OR-3, CPL | ", roleId: "1469940048828043375" },
    "[OR-1] Private | พลทหาร": { prefix: "OR-1, PVT | ", roleId: "1469940048828043375" }
};

client.once('ready', () => {
    console.log(`✅ บอทตัวอย่างพร้อมทำงาน: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has('Administrator')) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ ยืนยันตัวตนด้วยรหัสในเกม')
            .setDescription('1. เข้าแมพเพื่อรับรหัส 6 หลัก\n2. นำรหัสมากรอกในปุ่มด้านล่างนี้ได้เลย (ไม่ต้องใส่ใน Bio)')
            .setColor('#00ff00');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('v_start')
                .setLabel('เริ่มยืนยันตัวตน')
                .setStyle(ButtonStyle.Success)
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'v_start') {
        const modal = new ModalBuilder().setCustomId('v_modal').setTitle('กรอกรหัสจากในเกม');
        const nameInput = new TextInputBuilder().setCustomId('r_name').setLabel("ชื่อ Roblox").setStyle(TextInputStyle.Short).setRequired(true);
        const codeInput = new TextInputBuilder().setCustomId('v_code').setLabel("รหัส 6 หลักที่ได้ในแมพ").setStyle(TextInputStyle.Short).setRequired(true);
        
        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(codeInput));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'v_modal') {
        try {
            await interaction.deferReply({ ephemeral: true });
            const robloxName = interaction.fields.getTextInputValue('r_name');
            const typedCode = interaction.fields.getTextInputValue('v_code');

            // 🔍 ตรวจสอบรหัสจาก Google Sheets
            const response = await axios.get(`${GOOGLE_SCRIPT_URL}?username=${robloxName}`);
            const correctCodeFromGame = response.data;

            if (correctCodeFromGame !== "Not Found" && typedCode.trim() === correctCodeFromGame.toString().trim()) {
                // ✅ รหัสตรงกันเป๊ะ
                const userId = await nblocean.getIdFromUsername(robloxName);
                const rankName = await nblocean.getRankNameInGroup(config.groupId, userId);
                const setting = rankSettings[rankName];

                // ให้ยศ
                await interaction.member.roles.add(BASE_ROLE_ID).catch(() => null);
                if (setting && setting.roles) {
                    for (const rid of setting.roles) {
                        await interaction.member.roles.add(rid).catch(() => null);
                    }
                }

                // เปลี่ยนชื่อ
                const prefix = setting ? setting.prefix : "";
                const finalNick = prefix ? `${prefix} | ${robloxName}` : robloxName;
                await interaction.member.setNickname(finalNick.substring(0, 32)).catch(() => null);

                await interaction.editReply({ content: `✅ ยืนยันสำเร็จ! รหัส ${typedCode} ถูกต้อง คุณคือ ${rankName}` });
            } else {
                // ❌ รหัสไม่ตรง หรือหาชื่อไม่เจอ
                const deepLink = `roblox://experiences/start?placeId=${GAME_ID}`;
                const failRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('🎮 เข้าแมพไปเอารหัสใหม่').setStyle(ButtonStyle.Link).setURL(deepLink)
                );
                await interaction.editReply({ 
                    content: `❌ รหัสไม่ถูกต้อง! หรือคุณยังไม่ได้เข้าแมพเพื่อรับรหัสสำหรับชื่อ **${robloxName}**`,
                    components: [failRow]
                });
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล' });
        }
    }
});

client.login(config.token);


