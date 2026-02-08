const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const nblocean = require('noblox.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Verification System is Online!'));
app.listen(process.env.PORT || 8080);

// --- การตั้งค่า ---
const TOKEN = "MTQ2MTIyOTk3NDY2ODMxMjY5OQ.G9ycJP.EuCUngKC4YkUAHcR18yZC55-504K0rkTfNILuQ"; 
const OLD_GUILD_ID = "1343792416011980913"; 
const ROLE_GIVE_EVERYONE = "1469940089474777171";
const ROBLOX_MAP_LINK = "https://www.roblox.com/th/games/112284587859840/unnamed"; // <--- ใส่ลิ้งค์แมพของคุณตรงนี้

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

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`✅ บอทออนไลน์แล้ว: ${client.user.tag}`);
});

// คำสั่งติดตั้งปุ่ม
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has('Administrator')) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ ยืนยันตัวตน 2 ชั้น (ดิสคอร์ด + แมพ)')
            .setDescription(`1. เข้าแมพเพื่อรับรหัสยืนยัน 6 หลัก\n2. กดปุ่มด้านล่างเพื่อกรอกข้อมูล\n\n📍 **ลิ้งค์แมพ:** [คลิกเพื่อเข้าแมพ](${ROBLOX_MAP_LINK})`)
            .setColor('#f1c40f')
            .setFooter({ text: 'ระบบจะแสดงข้อมูลเฉพาะคุณเท่านั้นที่เห็น' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('v_start').setLabel('เริ่มยืนยันตัวตน').setStyle(ButtonStyle.Success).setEmoji('🔑')
        );

        await message.delete();
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    // 1. เมื่อกดปุ่ม -> เปิด Modal ให้กรอกชื่อและรหัส 6 หลัก
    if (interaction.isButton() && interaction.customId === 'v_start') {
        const modal = new ModalBuilder().setCustomId('v_modal').setTitle('ยืนยันตัวตนสมาชิก');

        const nameInput = new TextInputBuilder()
            .setCustomId('v_name')
            .setLabel("ชื่อเล่นของคุณ")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const codeInput = new TextInputBuilder()
            .setCustomId('v_code')
            .setLabel("รหัส 6 หลักจากในแมพ")
            .setPlaceholder("123456")
            .setMinLength(6)
            .setMaxLength(6)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(codeInput)
        );

        await interaction.showModal(modal);
        return;
    }

    // 2. เมื่อกดส่งข้อมูล (Submit Modal)
    if (interaction.isModalSubmit() && interaction.customId === 'v_modal') {
        // ใช้ ephemeral: true เพื่อให้ "มีเพียงคุณเท่านั้นที่เห็นข้อความนี้"
        await interaction.deferReply({ ephemeral: true });

        const inputName = interaction.fields.getTextInputValue('v_name');
        const inputCode = interaction.fields.getTextInputValue('v_code');

        try {
            const fetch = require('node-fetch');
            const resRoblox = await fetch(`https://verify.eryn.io/api/user/${interaction.user.id}`).then(r => r.json());
            
            if (resRoblox.status !== "ok") {
                return await interaction.editReply("❌ คุณยังไม่ได้เชื่อมต่อ Bloxlink/Eryn กับดิสคอร์ดนี้");
            }

            const robloxId = resRoblox.robloxId;

            // --- ส่วนการเช็ครหัส 6 หลัก ---
            // หมายเหตุ: ตรงนี้บอทต้องไปดึงข้อมูลจาก API ของแมพคุณเพื่อเช็คว่า inputCode ตรงกับ robloxId ไหม
            // สมมติว่าผ่าน (คุณต้องเขียนระบบเช็คกับ Database เองในอนาคต)
            const isCodeCorrect = true; 

            if (!isCodeCorrect) {
                return await interaction.editReply("❌ รหัส 6 หลักไม่ถูกต้อง กรุณาเช็คในแมพอีกครั้ง");
            }

            // เช็คยศจากเซิร์ฟเก่า
            const oldGuild = client.guilds.cache.get(OLD_GUILD_ID);
            const memberInOld = oldGuild ? await oldGuild.members.fetch(interaction.user.id).catch(() => null) : null;

            let finalPrefix = "";
            let mainRoleId = null;

            if (memberInOld) {
                memberInOld.roles.cache.forEach(role => {
                    if (rankSettings[role.name]) {
                        finalPrefix = rankSettings[role.name].prefix;
                        mainRoleId = rankSettings[role.name].roleId;
                    }
                });
            }

            // แจกยศกลุ่มพันธมิตร
            for (const group of allianceGroups) {
                const rank = await nblocean.getRankInGroup(group.gid, robloxId);
                if (rank > 0) await interaction.member.roles.add(group.rid).catch(() => null);
            }

            // ตั้งชื่อและแจกยศ
            const finalNick = `${finalPrefix}${inputName}`.substring(0, 32);
            await interaction.member.setNickname(finalNick).catch(() => console.log("เปลี่ยนชื่อไม่ได้"));
            await interaction.member.roles.add(ROLE_GIVE_EVERYONE).catch(() => null);
            if (mainRoleId) await interaction.member.roles.add(mainRoleId).catch(() => null);

            await interaction.editReply(`✅ **ยืนยันสำเร็จ!**\nยินดีต้อนรับคุณ **${finalNick}** เข้าสู่เซิร์ฟเวอร์`);

        } catch (error) {
            console.error(error);
            await interaction.editReply("❌ เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่ภายหลัง");
        }
    }
});


client.login(process.env.TOKEN);
