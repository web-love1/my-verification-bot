const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios'); // ต้องพิมพ์ npm install axios ในหน้าจอคอมก่อนอัปโหลด
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Public Sheets System Online!'));
app.listen(process.env.PORT || 8080);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// --- ใส่ ID ของ Google Sheets ที่นี่ (เอามาจาก URL) ---
const SPREADSHEET_ID = 'AKfycbxoGU04rOPa5Nqe1SbV0IF15GBK0tYhl2skpBtP1yr2rwiykPHXlG-YDbjZB5dpIpacYA'; 

client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId === 'v_modal') {
        await interaction.deferReply({ ephemeral: true });

        const inputName = interaction.fields.getTextInputValue('v_name');
        const inputCode = interaction.fields.getTextInputValue('v_code');
        const discordId = interaction.user.id;

        try {
            // ดึงข้อมูลจาก Google Sheets ในรูปแบบ CSV (อ่านได้เลยไม่ต้องใช้ Key)
            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;
            const response = await axios.get(url);
            const rows = response.data.split('\n').map(row => row.split(','));

            // เช็คข้อมูล: สมมติ DiscordID อยู่คอลัมน์แรก (0) และ Code อยู่คอลัมน์ที่สาม (2)
            const userData = rows.find(row => 
                row[0].trim() === discordId && 
                row[2].trim() === inputCode
            );

            if (userData) {
                await interaction.member.setNickname(inputName).catch(() => null);
                await interaction.editReply(`✅ ยืนยันสำเร็จ! ข้อมูลตรงกับระบบ`);
            } else {
                await interaction.editReply(`❌ ไม่พบรหัส ${inputCode} ที่ผูกกับไอดีคุณ`);
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply("❌ ระบบขัดข้อง (ตรวจสอบว่าได้แชร์ Sheet เป็นสาธารณะหรือยัง)");
        }
    }
});

client.login(process.env.TOKEN);
