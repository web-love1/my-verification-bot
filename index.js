const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// --- SETTINGS ---
const TOKEN = process.env.TOKEN; 
const GAS_URL = process.env.GAS_URL;
const MAIN_GROUP_ID = 35650805;
const EVERYONE_VERIFIED_ROLE = "1428804583471448264";

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
    "[ Administrator map | ผู้ดูแลเเมพ ]": { prefix: "</> | ", roleId: "1428804916020908032" },
    "[ Developer | สมาชิกผู้พัฒนา ]": { prefix: "</> | ", roleId: "1428804916020908032" },
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

client.on('messageCreate', async (message) => {
    if (message.content === '!setup-verify') {
        const embed = new EmbedBuilder()
            .setTitle('ยืนยันตัวตน')
            .setColor(config.EMBED_COLOR)
            .setFooter({ text: config.FOOTER_TEXT });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_modal').setLabel('ยืนยันตัวตน').setStyle(ButtonStyle.Success)
        );
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'open_modal') {
        const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('กรอกข้อมูลยืนยันตัวตน');
        const nameInput = new TextInputBuilder().setCustomId('v_username').setLabel("ชื่อ Roblox").setStyle(TextInputStyle.Short).setRequired(true);
        const codeInput = new TextInputBuilder().setCustomId('v_code').setLabel("รหัส 6 หลัก").setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(codeInput));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
        await interaction.deferReply({ ephemeral: true });
        const inputUsername = interaction.fields.getTextInputValue('v_username');
        const inputCode = interaction.fields.getTextInputValue('v_code');

        try {
            const response = await axios.get(`${GAS_URL}?code=${inputCode}&username=${inputUsername}`);
            if (response.data.status === "success") {
                const robloxName = response.data.username;
                const member = interaction.member;
                
                // ให้ยศเริ่มต้น
                const vRole = interaction.guild.roles.cache.get(config.EVERYONE_VERIFIED_ROLE);
                if (vRole) await member.roles.add(vRole).catch(() => {});

                // ดึงข้อมูลกลุ่ม (ตัวอย่างการดึงข้อมูล Roblox)
                const robloxSearch = await axios.post(`https://users.roblox.com/v1/usernames/users`, { usernames: [robloxName] });
                if (robloxSearch.data.data.length > 0) {
                    const robloxId = robloxSearch.data.data[0].id;
                    // เพิ่ม Logic เปลี่ยนชื่อ/ให้ยศตามกลุ่มที่นี่...
                    if (member.manageable) await member.setNickname(`[Verified] ${robloxName}`).catch(() => {});
                }

                await interaction.editReply(`✅ ยืนยันตัวตนสำเร็จ: **${robloxName}**`);
            } else {
                await interaction.editReply('❌ รหัสหรือชื่อไม่ถูกต้อง');
            }
        } catch (e) {
            await interaction.editReply('❌ ระบบขัดข้อง');
        }
    }
});

client.login(TOKEN);});
