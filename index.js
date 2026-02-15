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

client.login(process.env.TOKEN);
