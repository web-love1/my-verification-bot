const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

// --- ระบบทำให้บอทออนไลน์ตลอดเวลา (Keep Alive) ---
const app = express();
app.get('/', (req, res) => res.send('System is Online!'));
app.listen(process.env.PORT || 8080);

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// ดึงไอดีจาก Environment Variable ใน Render
const SPREADSHEET_ID = process.env.SPREADSHEET_ID; 

client.once('ready', () => {
    console.log(`✅ บอทออนไลน์แล้วในชื่อ: ${client.user.tag}`);
});

// --- คำสั่งสร้างปุ่มยืนยันตัวตน ---
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has('Administrator')) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ ยืนยันตัวตนเข้าเซิร์ฟเวอร์')
            .setDescription('กรุณากดปุ่มด้านล่างเพื่อกรอกชื่อและรหัสยืนยันจากในแมพ')
            .setColor('#4285F4');
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('v_start')
                .setLabel('เริ่มยืนยันตัวตน')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// --- ระบบโต้ตอบ (ปุ่ม และ หน้าต่างกรอกข้อมูล) ---
client.on('interactionCreate', async (interaction) => {
    // 1. เมื่อกดปุ่ม "เริ่มยืนยันตัวตน"
    if (interaction.isButton() && interaction.customId === 'v_start') {
        const modal = new ModalBuilder()
            .setCustomId('v_modal')
            .setTitle('ยืนยันตัวตนด้วยข้อมูลในแมพ');

        const nameInput = new TextInputBuilder()
            .setCustomId('v_name')
            .setLabel("ชื่อในเกม (Roblox Name)")
            .setPlaceholder("พิมพ์ชื่อของคุณให้ตรงกับในตาราง")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const codeInput = new TextInputBuilder()
            .setCustomId('v_code')
            .setLabel("รหัส 6 หลัก")
            .setPlaceholder("ตัวอย่าง: 123456")
            .setMinLength(6)
            .setMaxLength(6)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(nameInput);
        const secondRow = new ActionRowBuilder().addComponents(codeInput);

        modal.addComponents(firstRow, secondRow);
        await interaction.showModal(modal);
    }

    // 2. เมื่อกรอกข้อมูลใน Modal เสร็จแล้วกดส่ง
    if (interaction.isModalSubmit() && interaction.customId === 'v_modal') {
        await interaction.deferReply({ ephemeral: true });

        const inputName = interaction.fields.getTextInputValue('v_name').trim();
        const inputCode = interaction.fields.getTextInputValue('v_code').trim();

        try {
            // ดึงข้อมูลจาก Google Sheets (Export เป็น CSV)
            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;
            const response = await axios.get(url);
            
            // แยกข้อมูลออกมาเป็นแถวและคอลัมน์
            const rows = response.data.split('\n').map(row => row.split(','));

            // ค้นหาข้อมูล: 
            // row[0] คือ คอลัมน์ A (ชื่อ)
            // row[2] คือ คอลัมน์ C (รหัส)
            const userData = rows.find(row => 
                row[0]?.trim() === inputName && 
                row[2]?.trim() === inputCode
            );

            if (userData) {
                // ถ้าข้อมูลถูกต้อง
                await interaction.member.setNickname(inputName).catch(() => console.log("เปลี่ยนชื่อไม่ได้ (อาจเพราะยศบอทต่ำกว่า)"));
                
                // แจ้งผลสำเร็จ
                await interaction.editReply(`✅ **ยืนยันตัวตนสำเร็จ!**\nยินดีต้อนรับคุณ **${inputName}** เข้าสู่เซิร์ฟเวอร์ครับ`);
            } else {
                // ถ้าข้อมูลไม่ตรง
                await interaction.editReply(`❌ **ไม่สำเร็จ!** ไม่พบชื่อ **${inputName}** ที่ใช้รหัส **${inputCode}** ในระบบ\nกรุณาตรวจสอบชื่อและรหัสอีกครั้ง (ต้องพิมพ์ตัวใหญ่-เล็กให้ตรงกันเป๊ะ)`);
            }

        } catch (error) {
            console.error("Error fetching sheet:", error);
            await interaction.editReply("❌ **ระบบขัดข้อง!** บอทเข้าถึงข้อมูลใน Sheets ไม่ได้ (กรุณาเช็คว่าตั้งค่าแชร์เป็นสาธารณะหรือยัง)");
        }
    }
});

client.login(process.env.TOKEN);
