/**
 * Seed script for Festivals of India
 * Run with: node scripts/seedFestivals.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Festival seed data
const festivals = [
  {
    name: 'Diwali',
    religion: 'Hindu',
    description: 'Diwali, the Festival of Lights, is one of India\'s most celebrated festivals. It symbolizes the victory of light over darkness, good over evil, and knowledge over ignorance. Homes are adorned with oil lamps (diyas), colorful rangoli, and lights.',
    history: 'Diwali commemorates the return of Lord Rama to Ayodhya after 14 years of exile and his victory over the demon king Ravana. In many parts of India, it also celebrates the goddess Lakshmi, who is believed to visit homes that are clean and brightly lit. The festival has roots in ancient Hindu mythology and has been celebrated for thousands of years.',
    significance: 'Diwali represents the triumph of good over evil and light over darkness. It marks the beginning of a new year in many Hindu calendars and is considered an auspicious time for new beginnings, whether in business, relationships, or personal endeavors. The festival strengthens family bonds and community ties through shared celebrations.',
    how_celebrated: 'Celebrations include:\n• Lighting oil lamps (diyas) and candles throughout the home\n• Creating colorful rangoli designs at entrances\n• Bursting firecrackers (eco-friendly options encouraged)\n• Exchanging gifts and sweets with family and friends\n• Performing Lakshmi Puja for prosperity\n• Wearing new clothes and jewelry\n• Preparing traditional sweets and savories\n• Decorating homes with lights and flowers',
    celebration_regions: 'Pan-India, especially prominent in North India, Gujarat, Maharashtra',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800',
    seo_slug: 'diwali',
    dates: [
      { year: 2026, date: '2026-11-08', tithi: 'Amavasya (New Moon)', notes: 'Main Diwali day' },
      { year: 2027, date: '2027-10-29', tithi: 'Amavasya (New Moon)', notes: 'Main Diwali day' },
      { year: 2028, date: '2028-11-15', tithi: 'Amavasya (New Moon)', notes: 'Main Diwali day' }
    ]
  },
  {
    name: 'Holi',
    religion: 'Hindu',
    description: 'Holi, the Festival of Colors, is a vibrant spring festival celebrated with great enthusiasm across India. It marks the arrival of spring and the triumph of good over evil. People play with colored powders (gulal) and water, dance to music, and share festive foods.',
    history: 'Holi has its origins in Hindu mythology, primarily the story of Prahlad and Hiranyakashipu. The demon king Hiranyakashipu was killed by Lord Vishnu for his persecution of his son Prahlad, a devoted follower of Vishnu. The bonfire on Holika Dahan commemorates this story. The festival also celebrates the divine love of Radha and Krishna.',
    significance: 'Holi signifies the victory of good over evil, the arrival of spring after winter, and the importance of forgiveness. It\'s a time when social barriers are temporarily dissolved, and people of all backgrounds come together to celebrate. The festival promotes unity, joy, and the letting go of past grievances.',
    how_celebrated: 'Celebrations include:\n• Holika Dahan (bonfire) on the eve of Holi\n• Playing with colored powders (gulal) and water guns (pichkaris)\n• Singing and dancing to traditional Holi songs\n• Drinking thandai (a traditional spiced milk drink)\n• Preparing and sharing gujiya, mathri, and other sweets\n• Visiting friends and family\n• Community gatherings and processions',
    celebration_regions: 'Pan-India, especially vibrant in Mathura, Vrindavan, Barsana, and North India',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1576399538411-bcbd6a21b6e7?w=800',
    seo_slug: 'holi',
    dates: [
      { year: 2026, date: '2026-03-17', tithi: 'Purnima (Full Moon)', notes: 'Rangwali Holi (main day of colors)' },
      { year: 2027, date: '2027-03-06', tithi: 'Purnima (Full Moon)', notes: 'Rangwali Holi (main day of colors)' },
      { year: 2028, date: '2028-03-24', tithi: 'Purnima (Full Moon)', notes: 'Rangwali Holi (main day of colors)' }
    ]
  },
  {
    name: 'Navratri',
    religion: 'Hindu',
    description: 'Navratri is a nine-night festival dedicated to the worship of Goddess Durga in her nine forms. The word "Navratri" means "nine nights" in Sanskrit. It is celebrated with devotion, fasting, prayer, and in many regions, vibrant dance forms like Garba and Dandiya.',
    history: 'Navratri celebrates the victory of Goddess Durga over the buffalo demon Mahishasura after a fierce battle that lasted nine days. It symbolizes the triumph of good over evil. The festival has been celebrated for centuries and holds deep spiritual significance in Hindu traditions, particularly in Shaktism.',
    significance: 'Navratri represents the power of the feminine divine and the victory of good over evil. Each day is dedicated to a different form of Goddess Durga, known as the Navadurga. The festival is a time for spiritual reflection, fasting, and devotion. It culminates in Vijayadashami (Dussehra), celebrating the final victory.',
    how_celebrated: 'Celebrations include:\n• Nine nights of worship to different forms of Durga\n• Fasting and vegetarian diet\n• Performing Garba and Dandiya dances (especially in Gujarat)\n• Setting up Golu/Kolu displays (dolls arranged on steps) in South India\n• Daily aarti and prayers\n• Wearing specific colored clothes on each day\n• Kanya Puja (honoring young girls as forms of the goddess)\n• Community celebrations and processions',
    celebration_regions: 'Pan-India, with distinct styles in Gujarat (Garba), West Bengal (Durga Puja), and South India (Golu)',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1601224984218-7b3eebdd4fc1?w=800',
    seo_slug: 'navratri',
    dates: [
      { year: 2026, date: '2026-10-01', tithi: 'Pratipada', notes: 'Shardiya Navratri begins' },
      { year: 2027, date: '2027-09-21', tithi: 'Pratipada', notes: 'Shardiya Navratri begins' },
      { year: 2028, date: '2028-10-09', tithi: 'Pratipada', notes: 'Shardiya Navratri begins' }
    ]
  },
  {
    name: 'Dussehra',
    religion: 'Hindu',
    description: 'Dussehra, also known as Vijayadashami, marks the victory of Lord Rama over the demon king Ravana and the triumph of good over evil. The festival is celebrated on the tenth day after Navratri and features grand effigies of Ravana being burned across the country.',
    history: 'Dussehra commemorates the day Lord Rama defeated and killed Ravana, the ten-headed demon king of Lanka, who had abducted Rama\'s wife Sita. The festival also celebrates Goddess Durga\'s victory over Mahishasura. Both narratives symbolize the eternal triumph of righteousness over evil forces.',
    significance: 'Dussehra symbolizes the victory of dharma (righteousness) over adharma (evil). It reminds us that no matter how powerful evil becomes, good will ultimately prevail. The burning of Ravana\'s effigy represents the destruction of evil within ourselves and society. It\'s considered an auspicious day for new beginnings.',
    how_celebrated: 'Celebrations include:\n• Ramleela performances (theatrical enactments of the Ramayana)\n• Burning of giant effigies of Ravana, Kumbhakaran, and Meghnad\n• Shami tree worship and exchange of leaves\n• Processions and cultural programs\n• Durga Puja visarjan (immersion) in Bengal\n• Special prayers and temple visits\n• Exchange of sweets and gifts\n• Community fairs and melas',
    celebration_regions: 'Pan-India, famous celebrations in Delhi, Varanasi, Mysore, Kullu, and Kolkata',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?w=800',
    seo_slug: 'dussehra',
    dates: [
      { year: 2026, date: '2026-10-09', tithi: 'Dashami', notes: 'Vijayadashami - Ravana Dahan' },
      { year: 2027, date: '2027-09-29', tithi: 'Dashami', notes: 'Vijayadashami - Ravana Dahan' },
      { year: 2028, date: '2028-10-17', tithi: 'Dashami', notes: 'Vijayadashami - Ravana Dahan' }
    ]
  },
  {
    name: 'Makar Sankranti',
    religion: 'Hindu',
    description: 'Makar Sankranti marks the sun\'s transition into the zodiac sign of Capricorn (Makara) and the beginning of longer days. It is one of the few Indian festivals celebrated on a fixed date. The festival is known by different names across India - Pongal in Tamil Nadu, Lohri in Punjab, and Bihu in Assam.',
    history: 'Makar Sankranti has been celebrated for thousands of years, tied to the solar cycle and harvest season. It marks the end of the winter solstice and the beginning of warmer, longer days. The festival has agricultural roots, celebrating the harvest and expressing gratitude for the abundance of crops.',
    significance: 'Makar Sankranti signifies new beginnings, positivity, and the end of negativity. The transition of the sun into Capricorn is considered auspicious. The festival celebrates the harvest season and expresses gratitude for agricultural prosperity. It also marks the beginning of the auspicious period of Uttarayan.',
    how_celebrated: 'Celebrations include:\n• Flying colorful kites (especially in Gujarat and Rajasthan)\n• Taking holy dips in rivers like Ganga, Yamuna, Godavari\n• Preparing and sharing til-gul (sesame and jaggery sweets)\n• Bonfires and community gatherings\n• Pongal dishes in South India\n• Donating to the needy\n• Visiting relatives and exchanging greetings\n• Traditional fairs and cattle shows',
    celebration_regions: 'Pan-India, with unique celebrations in Gujarat (kite flying), Tamil Nadu (Pongal), Punjab (Lohri), Assam (Bihu)',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1547483238-2cbf881a559f?w=800',
    seo_slug: 'makar-sankranti',
    dates: [
      { year: 2026, date: '2026-01-14', tithi: 'Fixed Solar Date', notes: 'Sun enters Capricorn' },
      { year: 2027, date: '2027-01-14', tithi: 'Fixed Solar Date', notes: 'Sun enters Capricorn' },
      { year: 2028, date: '2028-01-15', tithi: 'Fixed Solar Date', notes: 'Sun enters Capricorn' }
    ]
  },
  {
    name: 'Raksha Bandhan',
    religion: 'Hindu',
    description: 'Raksha Bandhan is a festival celebrating the bond between brothers and sisters. Sisters tie a sacred thread (rakhi) on their brothers\' wrists, praying for their well-being, while brothers pledge to protect their sisters. The festival is marked by family gatherings, gifts, and festive meals.',
    history: 'Raksha Bandhan has multiple historical and mythological origins. In Hindu mythology, Goddess Lakshmi tied a rakhi on King Bali\'s wrist. Historically, Rani Karnavati of Chittor sent a rakhi to Mughal Emperor Humayun, seeking his protection. The festival has evolved to celebrate all protective relationships.',
    significance: 'Raksha Bandhan celebrates the pure bond of love and protection between siblings. The word "Raksha" means protection, and "Bandhan" means bond. It reinforces family values, strengthens sibling relationships, and symbolizes the duty of brothers to protect their sisters. In modern times, it celebrates any protective relationship.',
    how_celebrated: 'Celebrations include:\n• Sisters tying colorful rakhis on brothers\' wrists\n• Brothers giving gifts and money (shagun) to sisters\n• Performing aarti and tilak ceremony\n• Sharing sweets and festive meals\n• Family gatherings and reunions\n• Sisters preparing brothers\' favorite dishes\n• Exchange of warm wishes and blessings\n• Gifting clothes, jewelry, or other presents',
    celebration_regions: 'North India, Western India, Nepal; variations like Rakhi Purnima celebrated elsewhere',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1566662158033-20fb18bb0b0b?w=800',
    seo_slug: 'raksha-bandhan',
    dates: [
      { year: 2026, date: '2026-08-12', tithi: 'Purnima (Full Moon)', notes: 'Shravan Purnima' },
      { year: 2027, date: '2027-08-02', tithi: 'Purnima (Full Moon)', notes: 'Shravan Purnima' },
      { year: 2028, date: '2028-08-19', tithi: 'Purnima (Full Moon)', notes: 'Shravan Purnima' }
    ]
  },
  {
    name: 'Ganesh Chaturthi',
    religion: 'Hindu',
    description: 'Ganesh Chaturthi celebrates the birth of Lord Ganesha, the elephant-headed god of wisdom, prosperity, and new beginnings. The festival spans 10 days, during which beautifully crafted Ganesha idols are worshipped in homes and public pandals before being immersed in water.',
    history: 'While Ganesh worship has ancient origins, the public celebration of Ganesh Chaturthi was popularized by Lokmanya Tilak in 1893 during India\'s freedom struggle. He transformed it from a private household festival into a grand public event to unite people against British rule. It has since become one of India\'s most spectacular festivals.',
    significance: 'Lord Ganesha is worshipped as the remover of obstacles (Vighnaharta) and the god of wisdom and new beginnings. The festival signifies the importance of seeking blessings before starting any new venture. It brings communities together and represents the cycle of creation and dissolution through the idol\'s creation and immersion.',
    how_celebrated: 'Celebrations include:\n• Installing Ganesha idols at homes and community pandals\n• Daily prayers, aarti, and offerings\n• Preparing Ganesha\'s favorite sweet - modak\n• Cultural programs and competitions\n• Decorating pandals with elaborate themes\n• Community feasts and prasad distribution\n• Visarjan processions with music and dancing\n• Eco-friendly celebrations with clay idols',
    celebration_regions: 'Maharashtra (especially Mumbai and Pune), Goa, Karnataka, Andhra Pradesh, Tamil Nadu',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1567591370504-80a5154b7131?w=800',
    seo_slug: 'ganesh-chaturthi',
    dates: [
      { year: 2026, date: '2026-08-27', tithi: 'Chaturthi', notes: 'Ganesh Chaturthi begins' },
      { year: 2027, date: '2027-09-15', tithi: 'Chaturthi', notes: 'Ganesh Chaturthi begins' },
      { year: 2028, date: '2028-09-03', tithi: 'Chaturthi', notes: 'Ganesh Chaturthi begins' }
    ]
  },
  {
    name: 'Janmashtami',
    religion: 'Hindu',
    description: 'Janmashtami celebrates the birth of Lord Krishna, the eighth avatar of Lord Vishnu. The festival is observed with fasting, devotional singing, dancing, and dramatic enactments of Krishna\'s life. The highlight is the midnight celebration marking Krishna\'s birth.',
    history: 'Lord Krishna was born in Mathura to Devaki and Vasudeva at midnight on the eighth day (Ashtami) of the dark fortnight in the month of Bhadrapada. His birth occurred under miraculous circumstances, and his father carried him across the Yamuna river to Gokul to protect him from his uncle Kamsa.',
    significance: 'Janmashtami celebrates the divine incarnation of Lord Vishnu as Krishna to establish dharma and destroy evil. Krishna\'s life and teachings, especially the Bhagavad Gita, continue to guide millions. The festival reminds us of divine love, righteousness, and the importance of standing against injustice.',
    how_celebrated: 'Celebrations include:\n• Fasting until midnight (the birth hour)\n• Singing devotional songs and bhajans\n• Dahi Handi competitions (human pyramids to break clay pots)\n• Jhulan (swing decoration for Krishna)\n• Midnight aarti and celebrations\n• Raas Leela performances\n• Decorating temples and homes\n• Preparing 56 varieties of food (Chhappan Bhog)',
    celebration_regions: 'Pan-India, especially Mathura, Vrindavan, Dwarka, and Maharashtra (Dahi Handi)',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1629363136771-c7e6d7ae1b61?w=800',
    seo_slug: 'janmashtami',
    dates: [
      { year: 2026, date: '2026-08-14', tithi: 'Ashtami', notes: 'Krishna Janmashtami' },
      { year: 2027, date: '2027-09-02', tithi: 'Ashtami', notes: 'Krishna Janmashtami' },
      { year: 2028, date: '2028-08-22', tithi: 'Ashtami', notes: 'Krishna Janmashtami' }
    ]
  },
  {
    name: 'Eid ul-Fitr',
    religion: 'Islamic',
    description: 'Eid ul-Fitr, the "Festival of Breaking the Fast," marks the end of Ramadan, the Islamic holy month of fasting. It is a joyous celebration of gratitude, charity, and community, where Muslims come together for special prayers, feasts, and exchange of gifts.',
    history: 'Eid ul-Fitr was first celebrated by Prophet Muhammad after the first Ramadan in Medina. The festival has been observed by Muslims worldwide for over 1400 years. It marks the culmination of a month of spiritual reflection, self-discipline, and devotion through fasting from dawn to sunset.',
    significance: 'Eid ul-Fitr celebrates the spiritual growth achieved during Ramadan and expresses gratitude to Allah for the strength to complete the fast. It emphasizes charity (Zakat al-Fitr must be given before Eid prayers), community bonds, and forgiveness. The festival reminds Muslims of their blessings and duty to help the less fortunate.',
    how_celebrated: 'Celebrations include:\n• Special Eid prayers at mosques or prayer grounds\n• Wearing new clothes and applying perfume\n• Giving Zakat al-Fitr (charity) before prayers\n• Preparing and sharing special dishes like sheer khurma, biryani\n• Visiting family and friends\n• Exchanging gifts (Eidi) especially for children\n• Greeting "Eid Mubarak"\n• Community gatherings and feasts',
    celebration_regions: 'Pan-India, significant celebrations in Lucknow, Hyderabad, Delhi, Mumbai, Kashmir',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1532635262-8a18c10c2c60?w=800',
    seo_slug: 'eid-ul-fitr',
    dates: [
      { year: 2026, date: '2026-03-20', tithi: '1 Shawwal', notes: 'Date depends on moon sighting' },
      { year: 2027, date: '2027-03-10', tithi: '1 Shawwal', notes: 'Date depends on moon sighting' },
      { year: 2028, date: '2028-02-27', tithi: '1 Shawwal', notes: 'Date depends on moon sighting' }
    ]
  },
  {
    name: 'Baisakhi',
    religion: 'Sikh',
    description: 'Baisakhi marks the Sikh New Year and commemorates the formation of the Khalsa Panth by Guru Gobind Singh in 1699. It also celebrates the spring harvest season in Punjab. The festival is marked by religious processions, fairs, and traditional folk dances.',
    history: 'On Baisakhi day in 1699, the tenth Sikh Guru, Guru Gobind Singh, founded the Khalsa, the community of initiated Sikhs, at Anandpur Sahib. This was a pivotal moment in Sikh history, establishing the distinct identity and code of conduct for Sikhs. The day also marks the beginning of the Sikh new year.',
    significance: 'Baisakhi holds immense religious significance for Sikhs as it marks the birth of the Khalsa. It represents courage, sacrifice, and spiritual rebirth. For farmers, it celebrates the harvest of rabi crops and gratitude for agricultural prosperity. The festival symbolizes renewal, both spiritual and seasonal.',
    how_celebrated: 'Celebrations include:\n• Visiting gurdwaras for special prayers and kirtan\n• Nagar Kirtan (religious processions)\n• Performing Bhangra and Gidda dances\n• Community langars (free meals)\n• Fairs and melas especially in Punjab\n• Taking holy dips in sacred rivers\n• Wearing traditional Punjabi attire\n• Celebrating with family feasts',
    celebration_regions: 'Punjab, Haryana, Delhi, and Sikh communities worldwide',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1584376720948-91b90bd8fb9e?w=800',
    seo_slug: 'baisakhi',
    dates: [
      { year: 2026, date: '2026-04-14', tithi: 'Fixed Solar Date', notes: 'Sikh New Year' },
      { year: 2027, date: '2027-04-14', tithi: 'Fixed Solar Date', notes: 'Sikh New Year' },
      { year: 2028, date: '2028-04-13', tithi: 'Fixed Solar Date', notes: 'Sikh New Year' }
    ]
  },
  {
    name: 'Onam',
    religion: 'Hindu',
    description: 'Onam is Kerala\'s biggest festival, celebrating the annual homecoming of the mythical King Mahabali. This 10-day harvest festival showcases Kerala\'s rich cultural heritage through elaborate flower carpets (Pookalam), grand feasts (Onam Sadya), snake boat races, and traditional performances.',
    history: 'Onam celebrates the legend of King Mahabali (Maveli), a benevolent Asura king who ruled Kerala during its golden age. According to mythology, Lord Vishnu, in his Vamana avatar, sent Mahabali to the netherworld but granted him permission to visit his beloved subjects once a year. This annual visit is celebrated as Onam.',
    significance: 'Onam celebrates equality, prosperity, and the golden era of King Mahabali when everyone lived in harmony. It transcends religious boundaries in Kerala, celebrated by Hindus, Christians, and Muslims alike. The festival represents Kerala\'s cultural unity and the spirit of sharing and togetherness.',
    how_celebrated: 'Celebrations include:\n• Creating intricate Pookalam (floral carpet) designs\n• Preparing elaborate Onam Sadya (vegetarian feast on banana leaf)\n• Vallam Kali (snake boat races)\n• Traditional dance performances like Kathakali and Thiruvathira\n• Wearing traditional Kerala attire (Kasavu)\n• Shopping for new clothes and gifts\n• Family gatherings and reunions\n• Cultural programs and competitions',
    celebration_regions: 'Kerala, with celebrations among Malayali communities worldwide',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
    seo_slug: 'onam',
    dates: [
      { year: 2026, date: '2026-09-04', tithi: 'Thiruvonam', notes: 'Main Onam day (Thiruvonam)' },
      { year: 2027, date: '2027-08-25', tithi: 'Thiruvonam', notes: 'Main Onam day (Thiruvonam)' },
      { year: 2028, date: '2028-09-12', tithi: 'Thiruvonam', notes: 'Main Onam day (Thiruvonam)' }
    ]
  },
  {
    name: 'Christmas',
    religion: 'Christian',
    description: 'Christmas celebrates the birth of Jesus Christ and is observed with great joy by India\'s Christian community. Churches hold special midnight masses, homes are decorated with Christmas trees and nativity scenes, and families come together to exchange gifts and share festive meals.',
    history: 'Christmas commemorates the birth of Jesus Christ in Bethlehem over 2000 years ago. In India, the celebration was introduced by European missionaries and colonial rulers. Today, it is celebrated not only by Christians but also enjoyed by people of all faiths, reflecting India\'s secular and inclusive nature.',
    significance: 'Christmas celebrates the birth of Jesus Christ, whom Christians believe to be the Son of God. It represents hope, love, peace, and goodwill. In India, the festival has become a symbol of unity and celebration that transcends religious boundaries, bringing communities together in the spirit of joy.',
    how_celebrated: 'Celebrations include:\n• Attending midnight mass at churches\n• Decorating Christmas trees and homes with lights\n• Setting up nativity scenes (cribs)\n• Carol singing and community gatherings\n• Exchanging gifts with family and friends\n• Preparing special Christmas cakes and meals\n• Santa Claus visits for children\n• Christmas fairs and cultural programs',
    celebration_regions: 'Pan-India, especially in Goa, Kerala, Mumbai, Kolkata, and Northeast India',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=800',
    seo_slug: 'christmas',
    dates: [
      { year: 2026, date: '2026-12-25', tithi: 'Fixed Date', notes: 'Birth of Jesus Christ' },
      { year: 2027, date: '2027-12-25', tithi: 'Fixed Date', notes: 'Birth of Jesus Christ' },
      { year: 2028, date: '2028-12-25', tithi: 'Fixed Date', notes: 'Birth of Jesus Christ' }
    ]
  }
];

async function seedFestivals() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    // Create connection using environment variables
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 30000
    });
    
    console.log('Connected to database!');
    
    // Create festivals table
    console.log('Creating festivals table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS festivals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        religion VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        history TEXT,
        significance TEXT,
        how_celebrated TEXT,
        celebration_regions TEXT,
        festival_type ENUM('FIXED', 'LUNAR') DEFAULT 'LUNAR',
        image_url TEXT,
        seo_slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create festival_dates table
    console.log('Creating festival_dates table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS festival_dates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        festival_id INT NOT NULL,
        year INT NOT NULL,
        date DATE NOT NULL,
        tithi VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_festival_year (festival_id, year),
        FOREIGN KEY (festival_id) REFERENCES festivals(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Tables created successfully!');
    
    // Seed festivals data
    console.log('Seeding festivals data...');
    
    for (const festival of festivals) {
      console.log(`Processing: ${festival.name}`);
      
      // Check if festival already exists
      const [existing] = await connection.execute(
        'SELECT id FROM festivals WHERE seo_slug = ?',
        [festival.seo_slug]
      );
      
      let festivalId;
      
      if (existing.length > 0) {
        festivalId = existing[0].id;
        console.log(`  - Festival exists, updating...`);
        
        // Update existing festival
        await connection.execute(`
          UPDATE festivals SET
            name = ?, religion = ?, description = ?, history = ?,
            significance = ?, how_celebrated = ?, celebration_regions = ?,
            festival_type = ?, image_url = ?
          WHERE id = ?
        `, [
          festival.name, festival.religion, festival.description, festival.history,
          festival.significance, festival.how_celebrated, festival.celebration_regions,
          festival.festival_type, festival.image_url, festivalId
        ]);
      } else {
        console.log(`  - Inserting new festival...`);
        
        // Insert new festival
        const [result] = await connection.execute(`
          INSERT INTO festivals (name, religion, description, history, significance, how_celebrated, celebration_regions, festival_type, image_url, seo_slug)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          festival.name, festival.religion, festival.description, festival.history,
          festival.significance, festival.how_celebrated, festival.celebration_regions,
          festival.festival_type, festival.image_url, festival.seo_slug
        ]);
        
        festivalId = result.insertId;
      }
      
      // Insert/update dates
      for (const dateInfo of festival.dates) {
        const [existingDate] = await connection.execute(
          'SELECT id FROM festival_dates WHERE festival_id = ? AND year = ?',
          [festivalId, dateInfo.year]
        );
        
        if (existingDate.length > 0) {
          await connection.execute(`
            UPDATE festival_dates SET date = ?, tithi = ?, notes = ?
            WHERE festival_id = ? AND year = ?
          `, [dateInfo.date, dateInfo.tithi, dateInfo.notes, festivalId, dateInfo.year]);
        } else {
          await connection.execute(`
            INSERT INTO festival_dates (festival_id, year, date, tithi, notes)
            VALUES (?, ?, ?, ?, ?)
          `, [festivalId, dateInfo.year, dateInfo.date, dateInfo.tithi, dateInfo.notes]);
        }
      }
      
      console.log(`  - Done!`);
    }
    
    console.log('\n=================================');
    console.log('Festivals seeding completed!');
    console.log(`Total festivals: ${festivals.length}`);
    console.log('=================================\n');
    
  } catch (error) {
    console.error('Error seeding festivals:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the seed script
seedFestivals();
