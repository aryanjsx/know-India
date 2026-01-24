/**
 * Comprehensive Seed Script for ALL Festivals of India
 * Includes: Hindu, Islamic, Christian, Sikh, Buddhist, Jain, Tribal, and National festivals
 * Run with: node scripts/seedFestivalsComprehensive.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// ============================================
// COMPREHENSIVE FESTIVAL DATA
// ============================================

const festivals = [
  // ========================================
  // HINDU FESTIVALS - Major
  // ========================================
  {
    name: 'Diwali',
    religion: 'Hindu',
    description: 'Diwali, the Festival of Lights, is India\'s most celebrated festival symbolizing the victory of light over darkness, good over evil, and knowledge over ignorance.',
    history: 'Diwali commemorates Lord Rama\'s return to Ayodhya after 14 years of exile and his victory over Ravana. It also celebrates Goddess Lakshmi, who is believed to visit clean, well-lit homes. In Jain tradition, it marks Lord Mahavira\'s attainment of moksha.',
    significance: 'Diwali represents new beginnings, prosperity, and the triumph of righteousness. It strengthens family bonds and is considered highly auspicious for starting new ventures.',
    how_celebrated: '• Lighting diyas and candles\n• Creating colorful rangoli designs\n• Performing Lakshmi Puja\n• Exchanging gifts and sweets\n• Bursting eco-friendly crackers\n• Wearing new clothes\n• Family gatherings and feasts',
    celebration_regions: 'Pan-India; especially North India, Gujarat, Maharashtra',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800',
    seo_slug: 'diwali',
    dates: [
      { year: 2026, date: '2026-11-08', tithi: 'Amavasya', paksha: 'Krishna Paksha', hindu_month: 'Kartik', notes: 'Main Diwali - Lakshmi Puja' },
      { year: 2027, date: '2027-10-29', tithi: 'Amavasya', paksha: 'Krishna Paksha', hindu_month: 'Kartik', notes: 'Main Diwali - Lakshmi Puja' },
      { year: 2028, date: '2028-11-15', tithi: 'Amavasya', paksha: 'Krishna Paksha', hindu_month: 'Kartik', notes: 'Main Diwali - Lakshmi Puja' }
    ]
  },
  {
    name: 'Holi',
    religion: 'Hindu',
    description: 'Holi, the Festival of Colors, celebrates the arrival of spring and the triumph of good over evil through vibrant colors, music, and community celebrations.',
    history: 'Holi originates from the legend of Prahlad and Hiranyakashipu, and the burning of demoness Holika. It also celebrates the divine love of Radha and Krishna in Braj region.',
    significance: 'Holi symbolizes forgiveness, new beginnings, and social harmony. It temporarily dissolves social barriers, uniting people across castes and communities.',
    how_celebrated: '• Holika Dahan bonfire on the eve\n• Playing with colored powders (gulal)\n• Water balloons and pichkaris\n• Dancing to Holi songs\n• Drinking thandai and bhang\n• Preparing gujiya and sweets\n• Visiting friends and family',
    celebration_regions: 'Pan-India; especially Mathura, Vrindavan, Barsana (Lathmar Holi)',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1576399538411-bcbd6a21b6e7?w=800',
    seo_slug: 'holi',
    dates: [
      { year: 2026, date: '2026-03-17', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Phalguna', notes: 'Rangwali Holi - Day of colors' },
      { year: 2027, date: '2027-03-06', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Phalguna', notes: 'Rangwali Holi - Day of colors' },
      { year: 2028, date: '2028-03-24', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Phalguna', notes: 'Rangwali Holi - Day of colors' }
    ]
  },
  {
    name: 'Navratri',
    religion: 'Hindu',
    description: 'Navratri is a nine-night festival dedicated to Goddess Durga in her nine forms (Navadurga), celebrated with fasting, devotion, and dance.',
    history: 'Navratri celebrates Goddess Durga\'s victory over the buffalo demon Mahishasura after a nine-day battle. Each day honors a different form of the Divine Mother.',
    significance: 'Represents the power of Shakti (feminine divine energy) and victory of good over evil. Each day focuses on different aspects of spiritual growth.',
    how_celebrated: '• Nine nights of Durga worship\n• Fasting and vegetarian food\n• Garba and Dandiya dances\n• Golu/Kolu displays (South India)\n• Kanya Puja on Ashtami/Navami\n• Daily color-coded dress code\n• Community pandal celebrations',
    celebration_regions: 'Pan-India; Gujarat (Garba), West Bengal (Durga Puja), South India (Golu)',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1601224984218-7b3eebdd4fc1?w=800',
    seo_slug: 'navratri',
    dates: [
      { year: 2026, date: '2026-10-01', tithi: 'Pratipada', paksha: 'Shukla Paksha', hindu_month: 'Ashwin', notes: 'Shardiya Navratri begins' },
      { year: 2027, date: '2027-09-21', tithi: 'Pratipada', paksha: 'Shukla Paksha', hindu_month: 'Ashwin', notes: 'Shardiya Navratri begins' },
      { year: 2028, date: '2028-10-09', tithi: 'Pratipada', paksha: 'Shukla Paksha', hindu_month: 'Ashwin', notes: 'Shardiya Navratri begins' }
    ]
  },
  {
    name: 'Dussehra',
    religion: 'Hindu',
    description: 'Dussehra (Vijayadashami) celebrates Lord Rama\'s victory over Ravana and Goddess Durga\'s triumph over Mahishasura, marking the victory of good over evil.',
    history: 'Commemorates Rama killing Ravana on the tenth day after nine days of battle. In Bengal, it marks the immersion of Durga idols after her victory over Mahishasura.',
    significance: 'Symbolizes the victory of dharma over adharma. Considered highly auspicious for new beginnings, purchases, and starting ventures.',
    how_celebrated: '• Ramleela performances\n• Burning Ravana effigies\n• Durga Puja visarjan\n• Shami puja and Shastra Puja\n• Processions and fairs\n• Community celebrations\n• Exchange of gifts',
    celebration_regions: 'Pan-India; famous in Delhi, Varanasi, Mysore, Kullu, Kolkata',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?w=800',
    seo_slug: 'dussehra',
    dates: [
      { year: 2026, date: '2026-10-09', tithi: 'Dashami', paksha: 'Shukla Paksha', hindu_month: 'Ashwin', notes: 'Vijayadashami - Ravana Dahan' },
      { year: 2027, date: '2027-09-29', tithi: 'Dashami', paksha: 'Shukla Paksha', hindu_month: 'Ashwin', notes: 'Vijayadashami - Ravana Dahan' },
      { year: 2028, date: '2028-10-17', tithi: 'Dashami', paksha: 'Shukla Paksha', hindu_month: 'Ashwin', notes: 'Vijayadashami - Ravana Dahan' }
    ]
  },
  {
    name: 'Ganesh Chaturthi',
    religion: 'Hindu',
    description: 'Ganesh Chaturthi celebrates the birth of Lord Ganesha, the elephant-headed god of wisdom, prosperity, and new beginnings.',
    history: 'The festival was popularized as a public celebration by Lokmanya Tilak in 1893 to unite people during India\'s freedom struggle. It has ancient roots in Hindu traditions.',
    significance: 'Lord Ganesha is the remover of obstacles (Vighnaharta) and lord of beginnings. Worshipped before starting any new venture or ceremony.',
    how_celebrated: '• Installing Ganesha idols\n• 10 days of puja and aarti\n• Preparing modak (favorite sweet)\n• Cultural programs\n• Community pandals\n• Visarjan processions\n• Eco-friendly celebrations',
    celebration_regions: 'Maharashtra (especially Mumbai, Pune), Goa, Karnataka, Andhra Pradesh, Tamil Nadu',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1567591370504-80a5154b7131?w=800',
    seo_slug: 'ganesh-chaturthi',
    dates: [
      { year: 2026, date: '2026-08-27', tithi: 'Chaturthi', paksha: 'Shukla Paksha', hindu_month: 'Bhadrapada', notes: 'Ganesh Chaturthi begins' },
      { year: 2027, date: '2027-09-15', tithi: 'Chaturthi', paksha: 'Shukla Paksha', hindu_month: 'Bhadrapada', notes: 'Ganesh Chaturthi begins' },
      { year: 2028, date: '2028-09-03', tithi: 'Chaturthi', paksha: 'Shukla Paksha', hindu_month: 'Bhadrapada', notes: 'Ganesh Chaturthi begins' }
    ]
  },
  {
    name: 'Janmashtami',
    religion: 'Hindu',
    description: 'Krishna Janmashtami celebrates the birth of Lord Krishna, the eighth avatar of Vishnu, at midnight in the prison of Mathura.',
    history: 'Lord Krishna was born to Devaki and Vasudeva in Mathura. His father carried him across the Yamuna to Gokul to save him from his evil uncle Kamsa.',
    significance: 'Celebrates the divine incarnation who gave the Bhagavad Gita and established dharma. Krishna represents love, joy, and divine wisdom.',
    how_celebrated: '• Fasting until midnight\n• Midnight aarti and celebrations\n• Dahi Handi competitions\n• Jhulan (swing) decoration\n• Raas Leela performances\n• 56 varieties of food offering\n• Temple decorations',
    celebration_regions: 'Pan-India; especially Mathura, Vrindavan, Dwarka, and Maharashtra (Dahi Handi)',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1629363136771-c7e6d7ae1b61?w=800',
    seo_slug: 'janmashtami',
    dates: [
      { year: 2026, date: '2026-08-14', tithi: 'Ashtami', paksha: 'Krishna Paksha', hindu_month: 'Bhadrapada', notes: 'Krishna Janmashtami' },
      { year: 2027, date: '2027-09-02', tithi: 'Ashtami', paksha: 'Krishna Paksha', hindu_month: 'Bhadrapada', notes: 'Krishna Janmashtami' },
      { year: 2028, date: '2028-08-22', tithi: 'Ashtami', paksha: 'Krishna Paksha', hindu_month: 'Bhadrapada', notes: 'Krishna Janmashtami' }
    ]
  },
  {
    name: 'Makar Sankranti',
    religion: 'Hindu',
    description: 'Makar Sankranti marks the sun\'s transition into Capricorn (Makara) and the beginning of Uttarayan - longer, warmer days. One of few festivals on a fixed date.',
    history: 'An ancient harvest festival tied to the solar cycle, marking the end of winter solstice. Celebrated for thousands of years as a thanksgiving for the harvest.',
    significance: 'Signifies new beginnings, positivity, and gratitude for agricultural bounty. The beginning of the auspicious Uttarayan period.',
    how_celebrated: '• Flying colorful kites\n• Holy river baths\n• Preparing til-gul (sesame-jaggery)\n• Pongal celebrations (Tamil Nadu)\n• Bonfires and community feasts\n• Charity and donations\n• Traditional fairs',
    celebration_regions: 'Pan-India; Gujarat (kite flying), Tamil Nadu (Pongal), Punjab (Lohri), Assam (Bihu)',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1547483238-2cbf881a559f?w=800',
    seo_slug: 'makar-sankranti',
    dates: [
      { year: 2026, date: '2026-01-14', tithi: 'Solar Transition', paksha: 'N/A', hindu_month: 'Pausha/Magha', notes: 'Sun enters Capricorn' },
      { year: 2027, date: '2027-01-14', tithi: 'Solar Transition', paksha: 'N/A', hindu_month: 'Pausha/Magha', notes: 'Sun enters Capricorn' },
      { year: 2028, date: '2028-01-15', tithi: 'Solar Transition', paksha: 'N/A', hindu_month: 'Pausha/Magha', notes: 'Sun enters Capricorn' }
    ]
  },
  {
    name: 'Raksha Bandhan',
    religion: 'Hindu',
    description: 'Raksha Bandhan celebrates the sacred bond between brothers and sisters through the tying of a protective thread (rakhi).',
    history: 'Has multiple origins including Draupadi tying cloth on Krishna\'s wound, and Rani Karnavati sending rakhi to Emperor Humayun seeking protection.',
    significance: 'Celebrates love, protection, and duty between siblings. Sisters pray for brothers\' well-being; brothers pledge protection.',
    how_celebrated: '• Sisters tie rakhi on brothers\' wrists\n• Aarti and tilak ceremony\n• Brothers give gifts/money\n• Family gatherings\n• Special meals\n• Exchange of sweets\n• Prayers for well-being',
    celebration_regions: 'North India, Western India, Nepal; variations across India',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1566662158033-20fb18bb0b0b?w=800',
    seo_slug: 'raksha-bandhan',
    dates: [
      { year: 2026, date: '2026-08-12', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Shravana', notes: 'Shravan Purnima' },
      { year: 2027, date: '2027-08-02', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Shravana', notes: 'Shravan Purnima' },
      { year: 2028, date: '2028-08-19', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Shravana', notes: 'Shravan Purnima' }
    ]
  },
  // ========================================
  // HINDU FESTIVALS - Regional & Other
  // ========================================
  {
    name: 'Onam',
    religion: 'Hindu',
    description: 'Onam is Kerala\'s biggest festival celebrating the annual return of the legendary King Mahabali, known for Kerala\'s golden age of prosperity.',
    history: 'Celebrates King Mahabali (Maveli), an Asura king who ruled during Kerala\'s golden age. Lord Vishnu as Vamana sent him to the netherworld but allowed annual visits.',
    significance: 'Celebrates equality, prosperity, and cultural unity. Transcends religious boundaries in Kerala, celebrated by all communities.',
    how_celebrated: '• Pookalam (floral carpet) designs\n• Onam Sadya (grand feast on banana leaf)\n• Vallam Kali (boat races)\n• Thiruvathira and Kathakali dances\n• Traditional Kerala attire\n• 10-day celebrations\n• Cultural competitions',
    celebration_regions: 'Kerala, Malayali communities worldwide',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
    seo_slug: 'onam',
    dates: [
      { year: 2026, date: '2026-09-04', tithi: 'Thiruvonam', paksha: 'N/A', hindu_month: 'Chingam', notes: 'Thiruvonam - Main Onam day' },
      { year: 2027, date: '2027-08-25', tithi: 'Thiruvonam', paksha: 'N/A', hindu_month: 'Chingam', notes: 'Thiruvonam - Main Onam day' },
      { year: 2028, date: '2028-09-12', tithi: 'Thiruvonam', paksha: 'N/A', hindu_month: 'Chingam', notes: 'Thiruvonam - Main Onam day' }
    ]
  },
  {
    name: 'Pongal',
    religion: 'Hindu',
    description: 'Pongal is Tamil Nadu\'s four-day harvest festival expressing gratitude to the Sun God and farm animals for agricultural prosperity.',
    history: 'An ancient Dravidian harvest festival predating many Hindu festivals. "Pongal" means "boiling over," symbolizing abundance and prosperity.',
    significance: 'Thanksgiving festival celebrating the harvest season, the sun god (Surya), and cattle that help in farming.',
    how_celebrated: '• Boiling milk rice in new pots\n• Kolam (rangoli) designs\n• Jallikattu (bull-taming sport)\n• Decorating cattle\n• Four days of celebration\n• Traditional attire\n• Community feasts',
    celebration_regions: 'Tamil Nadu, Sri Lanka, Tamil diaspora worldwide',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1610878180933-123728745d22?w=800',
    seo_slug: 'pongal',
    dates: [
      { year: 2026, date: '2026-01-14', tithi: 'Thai 1', paksha: 'N/A', hindu_month: 'Thai', notes: 'Thai Pongal - Main day' },
      { year: 2027, date: '2027-01-14', tithi: 'Thai 1', paksha: 'N/A', hindu_month: 'Thai', notes: 'Thai Pongal - Main day' },
      { year: 2028, date: '2028-01-15', tithi: 'Thai 1', paksha: 'N/A', hindu_month: 'Thai', notes: 'Thai Pongal - Main day' }
    ]
  },
  {
    name: 'Durga Puja',
    religion: 'Hindu',
    description: 'Durga Puja is the grandest festival of Bengal, celebrating Goddess Durga\'s victory over Mahishasura with elaborate pandals and artistic idols.',
    history: 'Marks the annual visit of Goddess Durga to her maternal home on earth. The festival gained prominence in Bengal during the 18th century.',
    significance: 'Celebrates the victory of good over evil and the power of the Divine Mother. A time for family reunions and community celebrations.',
    how_celebrated: '• Elaborate pandal (tent) decorations\n• Artistic Durga idols\n• Dhunuchi (incense) dance\n• Sindoor Khela (vermillion)\n• Dhak (drum) beats\n• New clothes (pujo)\n• Bhog (food offering)\n• Visarjan procession',
    celebration_regions: 'West Bengal, Odisha, Assam, Tripura, Bihar, Jharkhand',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1632747737595-7d4c6f99f3c3?w=800',
    seo_slug: 'durga-puja',
    dates: [
      { year: 2026, date: '2026-10-01', tithi: 'Sashti', paksha: 'Shukla Paksha', hindu_month: 'Ashwin', notes: 'Durga Puja begins' },
      { year: 2027, date: '2027-09-21', tithi: 'Sashti', paksha: 'Shukla Paksha', hindu_month: 'Ashwin', notes: 'Durga Puja begins' },
      { year: 2028, date: '2028-10-09', tithi: 'Sashti', paksha: 'Shukla Paksha', hindu_month: 'Ashwin', notes: 'Durga Puja begins' }
    ]
  },
  {
    name: 'Chhath Puja',
    religion: 'Hindu',
    description: 'Chhath Puja is an ancient Vedic festival dedicated to the Sun God (Surya) and Chhathi Maiya, observed with rigorous fasting and rituals.',
    history: 'One of the most ancient Hindu festivals with Vedic origins. Mentioned in the Rigveda. The only festival that worships the setting sun.',
    significance: 'Dedicated to thanking the Sun God for sustaining life on earth. Known for its strict rituals promoting purity, austerity, and environmental consciousness.',
    how_celebrated: '• 36-hour nirjala (waterless) fast\n• Holy dip in rivers/ponds\n• Offering Arghya to setting sun\n• Offering Arghya to rising sun\n• Traditional prasad (thekua)\n• No onion-garlic food\n• Clean environment around water bodies',
    celebration_regions: 'Bihar, Jharkhand, Uttar Pradesh, Nepal, Bihari diaspora',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=800',
    seo_slug: 'chhath-puja',
    dates: [
      { year: 2026, date: '2026-11-10', tithi: 'Shashti', paksha: 'Shukla Paksha', hindu_month: 'Kartik', notes: 'Main Chhath day' },
      { year: 2027, date: '2027-10-31', tithi: 'Shashti', paksha: 'Shukla Paksha', hindu_month: 'Kartik', notes: 'Main Chhath day' },
      { year: 2028, date: '2028-11-17', tithi: 'Shashti', paksha: 'Shukla Paksha', hindu_month: 'Kartik', notes: 'Main Chhath day' }
    ]
  },
  {
    name: 'Maha Shivaratri',
    religion: 'Hindu',
    description: 'Maha Shivaratri, the "Great Night of Shiva," is a major festival celebrating Lord Shiva with night-long fasting, prayers, and meditation.',
    history: 'Marks the night when Lord Shiva performed the cosmic dance of creation, preservation, and destruction. Also associated with the wedding of Shiva and Parvati.',
    significance: 'Represents overcoming darkness and ignorance. Devotees believe sincere worship on this night grants blessings and spiritual liberation.',
    how_celebrated: '• Night-long fasting and vigil\n• Abhishekam (ritual bathing) of Shiva linga\n• Offering bel leaves, milk, water\n• Chanting Om Namah Shivaya\n• Temple visits\n• Meditation and prayers\n• Breaking fast next morning',
    celebration_regions: 'Pan-India; especially Varanasi, Ujjain, Somnath, and all Jyotirlinga temples',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1609619385002-f40f1df9b5ea?w=800',
    seo_slug: 'maha-shivaratri',
    dates: [
      { year: 2026, date: '2026-02-15', tithi: 'Chaturdashi', paksha: 'Krishna Paksha', hindu_month: 'Phalguna', notes: 'Maha Shivaratri' },
      { year: 2027, date: '2027-03-06', tithi: 'Chaturdashi', paksha: 'Krishna Paksha', hindu_month: 'Phalguna', notes: 'Maha Shivaratri' },
      { year: 2028, date: '2028-02-23', tithi: 'Chaturdashi', paksha: 'Krishna Paksha', hindu_month: 'Phalguna', notes: 'Maha Shivaratri' }
    ]
  },
  {
    name: 'Ram Navami',
    religion: 'Hindu',
    description: 'Ram Navami celebrates the birth of Lord Rama, the seventh avatar of Vishnu, known for his adherence to dharma and virtue.',
    history: 'Lord Rama was born to King Dasharatha and Queen Kausalya in Ayodhya at noon on the ninth day (Navami) of Chaitra month.',
    significance: 'Celebrates the ideal man (Maryada Purushottam) who embodied righteousness, virtue, and dharma. His life teaches moral values.',
    how_celebrated: '• Fasting and temple visits\n• Rama katha recitation\n• Kalyanotsavam (Rama-Sita wedding)\n• Processions with Rama idol\n• Charitable activities\n• Panakam distribution\n• Community feasts',
    celebration_regions: 'Pan-India; especially Ayodhya, South India, Maharashtra',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1604608672516-f1b9b1e5e200?w=800',
    seo_slug: 'ram-navami',
    dates: [
      { year: 2026, date: '2026-04-06', tithi: 'Navami', paksha: 'Shukla Paksha', hindu_month: 'Chaitra', notes: 'Ram Navami' },
      { year: 2027, date: '2027-03-26', tithi: 'Navami', paksha: 'Shukla Paksha', hindu_month: 'Chaitra', notes: 'Ram Navami' },
      { year: 2028, date: '2028-04-14', tithi: 'Navami', paksha: 'Shukla Paksha', hindu_month: 'Chaitra', notes: 'Ram Navami' }
    ]
  },
  {
    name: 'Karwa Chauth',
    religion: 'Hindu',
    description: 'Karwa Chauth is a one-day festival where married women fast from sunrise to moonrise for the longevity and prosperity of their husbands.',
    history: 'An ancient North Indian tradition with roots in various legends, including the story of Queen Veeravati whose devotion saved her husband.',
    significance: 'Symbolizes the bond of marriage, love between spouses, and a wife\'s devotion to her husband\'s well-being.',
    how_celebrated: '• Nirjala (waterless) fast from sunrise\n• Sargi (pre-dawn meal from mother-in-law)\n• Dressing up in bridal attire\n• Applying mehndi\n• Evening puja with karwa\n• Breaking fast after moonrise\n• Seeing moon through sieve',
    celebration_regions: 'North India (Punjab, Haryana, UP, Rajasthan, Gujarat)',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=800',
    seo_slug: 'karwa-chauth',
    dates: [
      { year: 2026, date: '2026-10-25', tithi: 'Chaturthi', paksha: 'Krishna Paksha', hindu_month: 'Kartik', notes: 'Karwa Chauth' },
      { year: 2027, date: '2027-10-14', tithi: 'Chaturthi', paksha: 'Krishna Paksha', hindu_month: 'Kartik', notes: 'Karwa Chauth' },
      { year: 2028, date: '2028-11-02', tithi: 'Chaturthi', paksha: 'Krishna Paksha', hindu_month: 'Kartik', notes: 'Karwa Chauth' }
    ]
  },
  {
    name: 'Vasant Panchami',
    religion: 'Hindu',
    description: 'Vasant Panchami marks the arrival of spring and celebrates Goddess Saraswati, the deity of knowledge, music, and arts.',
    history: 'Associated with the creation of Goddess Saraswati by Lord Brahma. Also marks the preparation for Holi, which comes 40 days later.',
    significance: 'Celebrates knowledge, wisdom, and the arts. Highly auspicious for beginning education (Vidyarambham) for children.',
    how_celebrated: '• Wearing yellow clothes\n• Saraswati Puja in schools\n• Placing books near deity\n• Flying kites (some regions)\n• Preparing yellow sweets\n• Starting children\'s education\n• Cultural programs',
    celebration_regions: 'Pan-India; especially Bengal, Bihar, Punjab, Odisha',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1605364267771-7b9e81c76a5f?w=800',
    seo_slug: 'vasant-panchami',
    dates: [
      { year: 2026, date: '2026-02-03', tithi: 'Panchami', paksha: 'Shukla Paksha', hindu_month: 'Magha', notes: 'Vasant Panchami - Saraswati Puja' },
      { year: 2027, date: '2027-01-23', tithi: 'Panchami', paksha: 'Shukla Paksha', hindu_month: 'Magha', notes: 'Vasant Panchami - Saraswati Puja' },
      { year: 2028, date: '2028-02-11', tithi: 'Panchami', paksha: 'Shukla Paksha', hindu_month: 'Magha', notes: 'Vasant Panchami - Saraswati Puja' }
    ]
  },
  {
    name: 'Guru Purnima',
    religion: 'Hindu',
    description: 'Guru Purnima honors spiritual and academic teachers, commemorating the sage Vyasa who compiled the Vedas and wrote the Mahabharata.',
    history: 'This day is dedicated to Vyasa, considered the greatest guru. In Buddhist tradition, it marks Buddha\'s first sermon at Sarnath.',
    significance: 'Celebrates the guru-shishya (teacher-student) tradition central to Indian culture. A day to honor all teachers and guides.',
    how_celebrated: '• Honoring teachers and gurus\n• Visiting ashrams\n• Pada puja (feet worship)\n• Offering dakshina\n• Spiritual discourses\n• Meditation sessions\n• Academic celebrations',
    celebration_regions: 'Pan-India, Nepal; Buddhist and Jain communities also celebrate',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
    seo_slug: 'guru-purnima',
    dates: [
      { year: 2026, date: '2026-07-11', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Ashadha', notes: 'Vyasa Purnima / Guru Purnima' },
      { year: 2027, date: '2027-07-01', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Ashadha', notes: 'Vyasa Purnima / Guru Purnima' },
      { year: 2028, date: '2028-07-19', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Ashadha', notes: 'Vyasa Purnima / Guru Purnima' }
    ]
  },
  // ========================================
  // ISLAMIC FESTIVALS
  // ========================================
  {
    name: 'Eid ul-Fitr',
    religion: 'Islamic',
    description: 'Eid ul-Fitr, the "Festival of Breaking the Fast," marks the end of Ramadan with prayers, feasting, charity, and community celebrations.',
    history: 'First celebrated by Prophet Muhammad after the first Ramadan. Marks the completion of a month of spiritual growth through fasting and prayer.',
    significance: 'Celebrates spiritual renewal and gratitude to Allah. Emphasizes charity (Zakat al-Fitr), community bonds, and forgiveness.',
    how_celebrated: '• Special Eid prayers at mosque\n• Zakat al-Fitr charity\n• Wearing new clothes\n• Preparing sheer khurma, biryani\n• Visiting family and friends\n• Exchanging gifts (Eidi)\n• Community feasts',
    celebration_regions: 'Pan-India; especially Lucknow, Hyderabad, Delhi, Mumbai, Kashmir',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1532635262-8a18c10c2c60?w=800',
    seo_slug: 'eid-ul-fitr',
    dates: [
      { year: 2026, date: '2026-03-20', tithi: '1 Shawwal', paksha: 'Islamic Calendar', hindu_month: 'Shawwal', notes: 'Date depends on moon sighting' },
      { year: 2027, date: '2027-03-10', tithi: '1 Shawwal', paksha: 'Islamic Calendar', hindu_month: 'Shawwal', notes: 'Date depends on moon sighting' },
      { year: 2028, date: '2028-02-27', tithi: '1 Shawwal', paksha: 'Islamic Calendar', hindu_month: 'Shawwal', notes: 'Date depends on moon sighting' }
    ]
  },
  {
    name: 'Eid ul-Adha',
    religion: 'Islamic',
    description: 'Eid ul-Adha, the "Festival of Sacrifice," commemorates Ibrahim\'s willingness to sacrifice his son in obedience to Allah.',
    history: 'Commemorates Prophet Ibrahim\'s devotion when Allah tested him by asking to sacrifice his son Ismail. Allah provided a ram as substitute.',
    significance: 'Teaches submission to Allah\'s will, sacrifice, and sharing. One-third of the sacrificed animal is distributed to the poor.',
    how_celebrated: '• Special Eid prayers\n• Qurbani (animal sacrifice)\n• Distributing meat to poor\n• Wearing new clothes\n• Family gatherings\n• Visiting relatives\n• Community feasts',
    celebration_regions: 'Pan-India; Muslim communities nationwide',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800',
    seo_slug: 'eid-ul-adha',
    dates: [
      { year: 2026, date: '2026-05-27', tithi: '10 Dhul Hijjah', paksha: 'Islamic Calendar', hindu_month: 'Dhul Hijjah', notes: 'Bakrid - Date depends on moon sighting' },
      { year: 2027, date: '2027-05-17', tithi: '10 Dhul Hijjah', paksha: 'Islamic Calendar', hindu_month: 'Dhul Hijjah', notes: 'Bakrid - Date depends on moon sighting' },
      { year: 2028, date: '2028-05-05', tithi: '10 Dhul Hijjah', paksha: 'Islamic Calendar', hindu_month: 'Dhul Hijjah', notes: 'Bakrid - Date depends on moon sighting' }
    ]
  },
  {
    name: 'Muharram',
    religion: 'Islamic',
    description: 'Muharram marks the Islamic New Year and commemorates the martyrdom of Imam Hussain at the Battle of Karbala.',
    history: 'The month remembers the sacrifice of Imam Hussain, grandson of Prophet Muhammad, who was martyred at Karbala in 680 CE while standing for justice.',
    significance: 'A period of mourning (especially for Shia Muslims) remembering the sacrifice for righteousness. The 10th day (Ashura) is most significant.',
    how_celebrated: '• Mourning and reflection\n• Taziya processions\n• Majlis gatherings\n• Recitation of Hussain\'s story\n• Fasting on Ashura\n• Charitable activities\n• Community gatherings',
    celebration_regions: 'Pan-India; especially Lucknow, Hyderabad, Mumbai',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1541013406133-94ed77ee8ba8?w=800',
    seo_slug: 'muharram',
    dates: [
      { year: 2026, date: '2026-06-26', tithi: '1 Muharram', paksha: 'Islamic Calendar', hindu_month: 'Muharram', notes: 'Islamic New Year begins' },
      { year: 2027, date: '2027-06-16', tithi: '1 Muharram', paksha: 'Islamic Calendar', hindu_month: 'Muharram', notes: 'Islamic New Year begins' },
      { year: 2028, date: '2028-06-04', tithi: '1 Muharram', paksha: 'Islamic Calendar', hindu_month: 'Muharram', notes: 'Islamic New Year begins' }
    ]
  },
  {
    name: 'Milad un-Nabi',
    religion: 'Islamic',
    description: 'Milad un-Nabi (Eid-e-Milad) celebrates the birth anniversary of Prophet Muhammad, observed with prayers, processions, and charity.',
    history: 'Commemorates the birth of Prophet Muhammad in 570 CE in Mecca. The celebration became widespread from the 12th century.',
    significance: 'A day to remember the Prophet\'s teachings of peace, compassion, and righteousness. An occasion for spiritual reflection.',
    how_celebrated: '• Mosque prayers and sermons\n• Processions with lights\n• Reciting Prophet\'s biography\n• Distributing food to needy\n• Decorating mosques\n• Community gatherings\n• Charitable activities',
    celebration_regions: 'Pan-India; Muslim communities nationwide',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800',
    seo_slug: 'milad-un-nabi',
    dates: [
      { year: 2026, date: '2026-09-05', tithi: '12 Rabi al-Awwal', paksha: 'Islamic Calendar', hindu_month: 'Rabi al-Awwal', notes: 'Prophet\'s Birthday' },
      { year: 2027, date: '2027-08-26', tithi: '12 Rabi al-Awwal', paksha: 'Islamic Calendar', hindu_month: 'Rabi al-Awwal', notes: 'Prophet\'s Birthday' },
      { year: 2028, date: '2028-08-14', tithi: '12 Rabi al-Awwal', paksha: 'Islamic Calendar', hindu_month: 'Rabi al-Awwal', notes: 'Prophet\'s Birthday' }
    ]
  },
  // ========================================
  // SIKH FESTIVALS
  // ========================================
  {
    name: 'Baisakhi',
    religion: 'Sikh',
    description: 'Baisakhi marks the Sikh New Year and commemorates the formation of the Khalsa Panth by Guru Gobind Singh in 1699.',
    history: 'On Baisakhi 1699, Guru Gobind Singh Ji founded the Khalsa at Anandpur Sahib, giving Sikhs their distinct identity with the Five Ks.',
    significance: 'Celebrates Sikh identity, courage, and sacrifice. Also marks the spring harvest season in Punjab.',
    how_celebrated: '• Gurdwara visits and prayers\n• Nagar Kirtan processions\n• Bhangra and Gidda dances\n• Community langars\n• Fairs and melas\n• Taking amrit (baptism)\n• Family celebrations',
    celebration_regions: 'Punjab, Haryana, Delhi, and Sikh communities worldwide',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1584376720948-91b90bd8fb9e?w=800',
    seo_slug: 'baisakhi',
    dates: [
      { year: 2026, date: '2026-04-14', tithi: 'Vaisakhi 1', paksha: 'N/A', hindu_month: 'Vaisakha', notes: 'Sikh New Year' },
      { year: 2027, date: '2027-04-14', tithi: 'Vaisakhi 1', paksha: 'N/A', hindu_month: 'Vaisakha', notes: 'Sikh New Year' },
      { year: 2028, date: '2028-04-13', tithi: 'Vaisakhi 1', paksha: 'N/A', hindu_month: 'Vaisakha', notes: 'Sikh New Year' }
    ]
  },
  {
    name: 'Guru Nanak Jayanti',
    religion: 'Sikh',
    description: 'Guru Nanak Jayanti (Gurpurab) celebrates the birth of Guru Nanak Dev Ji, the founder of Sikhism and first of the ten Sikh Gurus.',
    history: 'Guru Nanak was born in 1469 in Talwandi (now Nankana Sahib, Pakistan). He taught equality, service, and devotion to one God.',
    significance: 'Celebrates the teachings of Guru Nanak: equality, honest living, sharing, and remembering God. The most sacred Sikh festival.',
    how_celebrated: '• Akhand Path (continuous reading of Guru Granth Sahib)\n• Prabhat Pheris (morning processions)\n• Nagar Kirtan\n• Langar (community meal)\n• Gurdwara illumination\n• Kirtan and katha\n• Charitable activities',
    celebration_regions: 'Pan-India; especially Punjab, Delhi, and all Gurdwaras worldwide',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800',
    seo_slug: 'guru-nanak-jayanti',
    dates: [
      { year: 2026, date: '2026-11-05', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Kartik', notes: 'Guru Nanak Gurpurab' },
      { year: 2027, date: '2027-11-24', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Kartik', notes: 'Guru Nanak Gurpurab' },
      { year: 2028, date: '2028-11-13', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Kartik', notes: 'Guru Nanak Gurpurab' }
    ]
  },
  {
    name: 'Lohri',
    religion: 'Sikh',
    description: 'Lohri is a Punjabi festival marking the end of winter and celebrating the harvest of sugarcane and other rabi crops.',
    history: 'Traditionally marks the winter solstice in Punjab. Associated with the legend of Dulla Bhatti, a Punjab hero who rescued kidnapped girls.',
    significance: 'Celebrates the harvest season, fertility, and the bonfire that wards off evil spirits and welcomes prosperity.',
    how_celebrated: '• Lighting bonfires\n• Offering rewri, peanuts, popcorn\n• Singing Lohri songs\n• Bhangra and Gidda\n• Special celebrations for newlyweds and newborns\n• Family gatherings\n• Distributing sweets',
    celebration_regions: 'Punjab, Haryana, Himachal Pradesh, Delhi',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1609619385002-f40f1df9b5ea?w=800',
    seo_slug: 'lohri',
    dates: [
      { year: 2026, date: '2026-01-13', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'Pausha', notes: 'Day before Makar Sankranti' },
      { year: 2027, date: '2027-01-13', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'Pausha', notes: 'Day before Makar Sankranti' },
      { year: 2028, date: '2028-01-13', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'Pausha', notes: 'Day before Makar Sankranti' }
    ]
  },
  // ========================================
  // CHRISTIAN FESTIVALS
  // ========================================
  {
    name: 'Christmas',
    religion: 'Christian',
    description: 'Christmas celebrates the birth of Jesus Christ with midnight masses, carol singing, decorations, and family gatherings.',
    history: 'Commemorates the birth of Jesus Christ in Bethlehem over 2000 years ago. Introduced to India by European missionaries.',
    significance: 'Celebrates hope, love, peace, and goodwill. In India, it has become a festival of unity celebrated across communities.',
    how_celebrated: '• Midnight mass at churches\n• Christmas tree decorations\n• Nativity scene displays\n• Carol singing\n• Exchanging gifts\n• Christmas cakes and meals\n• Santa Claus for children\n• Community celebrations',
    celebration_regions: 'Pan-India; especially Goa, Kerala, Mumbai, Kolkata, Northeast India',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=800',
    seo_slug: 'christmas',
    dates: [
      { year: 2026, date: '2026-12-25', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'December', notes: 'Birth of Jesus Christ' },
      { year: 2027, date: '2027-12-25', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'December', notes: 'Birth of Jesus Christ' },
      { year: 2028, date: '2028-12-25', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'December', notes: 'Birth of Jesus Christ' }
    ]
  },
  {
    name: 'Good Friday',
    religion: 'Christian',
    description: 'Good Friday commemorates the crucifixion of Jesus Christ, observed with fasting, prayers, and solemn services.',
    history: 'Marks the day Jesus was crucified on Calvary. The term "Good" refers to the salvation and hope that arose from the sacrifice.',
    significance: 'A day of mourning, reflection, and gratitude for Christ\'s sacrifice for humanity\'s redemption.',
    how_celebrated: '• Special church services\n• Veneration of the Cross\n• Stations of the Cross\n• Fasting and abstinence\n• Silent prayer and meditation\n• Reading the Passion\n• Charitable acts',
    celebration_regions: 'Pan-India; Christian communities',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1555654421-a03a1a6fd0f0?w=800',
    seo_slug: 'good-friday',
    dates: [
      { year: 2026, date: '2026-04-03', tithi: 'Friday before Easter', paksha: 'N/A', hindu_month: 'April', notes: 'Crucifixion of Jesus' },
      { year: 2027, date: '2027-03-26', tithi: 'Friday before Easter', paksha: 'N/A', hindu_month: 'March', notes: 'Crucifixion of Jesus' },
      { year: 2028, date: '2028-04-14', tithi: 'Friday before Easter', paksha: 'N/A', hindu_month: 'April', notes: 'Crucifixion of Jesus' }
    ]
  },
  {
    name: 'Easter',
    religion: 'Christian',
    description: 'Easter celebrates the resurrection of Jesus Christ from the dead, the most important feast in the Christian calendar.',
    history: 'Commemorates Christ\'s resurrection on the third day after his crucifixion, fulfilling biblical prophecy.',
    significance: 'Celebrates hope, new life, and the promise of eternal life through Christ\'s victory over death.',
    how_celebrated: '• Sunrise services\n• Special Easter mass\n• Easter egg hunts\n• Decorating Easter eggs\n• Family gatherings\n• Easter feasts\n• Wearing new clothes\n• Church choir performances',
    celebration_regions: 'Pan-India; Christian communities',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1521967906867-14ec9d64bee8?w=800',
    seo_slug: 'easter',
    dates: [
      { year: 2026, date: '2026-04-05', tithi: 'First Sunday after Paschal Full Moon', paksha: 'N/A', hindu_month: 'April', notes: 'Resurrection Sunday' },
      { year: 2027, date: '2027-03-28', tithi: 'First Sunday after Paschal Full Moon', paksha: 'N/A', hindu_month: 'March', notes: 'Resurrection Sunday' },
      { year: 2028, date: '2028-04-16', tithi: 'First Sunday after Paschal Full Moon', paksha: 'N/A', hindu_month: 'April', notes: 'Resurrection Sunday' }
    ]
  },
  // ========================================
  // BUDDHIST FESTIVALS
  // ========================================
  {
    name: 'Buddha Purnima',
    religion: 'Buddhist',
    description: 'Buddha Purnima (Vesak) celebrates the birth, enlightenment, and death (Parinirvana) of Gautama Buddha on the same day.',
    history: 'Prince Siddhartha was born in Lumbini (563 BCE), attained enlightenment at Bodh Gaya, and passed away at Kushinagar - all on the Vaishakha full moon.',
    significance: 'The most sacred Buddhist festival celebrating the life and teachings of Buddha. A day for meditation, reflection, and compassion.',
    how_celebrated: '• Meditation and prayer\n• Visiting Buddhist temples\n• Bathing Buddha statues\n• Offering flowers and incense\n• Releasing caged birds\n• Charitable activities\n• Reading Buddhist scriptures\n• Processions',
    celebration_regions: 'Pan-India; especially Bodh Gaya, Sarnath, Ladakh, Sikkim, Northeast India',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800',
    seo_slug: 'buddha-purnima',
    dates: [
      { year: 2026, date: '2026-05-12', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Vaishakha', notes: 'Buddha Jayanti / Vesak' },
      { year: 2027, date: '2027-05-02', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Vaishakha', notes: 'Buddha Jayanti / Vesak' },
      { year: 2028, date: '2028-05-20', tithi: 'Purnima', paksha: 'Shukla Paksha', hindu_month: 'Vaishakha', notes: 'Buddha Jayanti / Vesak' }
    ]
  },
  {
    name: 'Losar',
    religion: 'Buddhist',
    description: 'Losar is the Tibetan and Buddhist New Year festival celebrated with rituals, offerings, and cultural performances.',
    history: 'Pre-Buddhist Bon tradition adopted into Tibetan Buddhism. Celebrates the new year according to the Tibetan lunar calendar.',
    significance: 'A time for spiritual cleansing, renewal, and celebrating family bonds. Symbolizes victory of good over evil.',
    how_celebrated: '• Three days of celebration\n• Cleaning homes thoroughly\n• Preparing special foods (guthuk, khapse)\n• Monastery visits\n• Cham dances by monks\n• Offering prayers\n• Family reunions\n• Gift exchanges',
    celebration_regions: 'Ladakh, Sikkim, Arunachal Pradesh, Himachal Pradesh, Tibetan communities',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=800',
    seo_slug: 'losar',
    dates: [
      { year: 2026, date: '2026-02-17', tithi: 'Tibetan New Year', paksha: 'N/A', hindu_month: 'Magha', notes: 'Fire Horse Year begins' },
      { year: 2027, date: '2027-03-07', tithi: 'Tibetan New Year', paksha: 'N/A', hindu_month: 'Phalguna', notes: 'Fire Sheep Year begins' },
      { year: 2028, date: '2028-02-26', tithi: 'Tibetan New Year', paksha: 'N/A', hindu_month: 'Phalguna', notes: 'Earth Monkey Year begins' }
    ]
  },
  // ========================================
  // JAIN FESTIVALS
  // ========================================
  {
    name: 'Mahavir Jayanti',
    religion: 'Jain',
    description: 'Mahavir Jayanti celebrates the birth of Lord Mahavira, the 24th and last Tirthankara of Jainism who propagated ahimsa (non-violence).',
    history: 'Mahavira was born as Prince Vardhamana in 599 BCE in Bihar. He attained enlightenment after 12 years of intense meditation.',
    significance: 'Celebrates the life and teachings of Mahavira: non-violence, truth, non-stealing, celibacy, and non-possessiveness.',
    how_celebrated: '• Temple visits and prayers\n• Abhisheka (ritual bath) of Mahavira idol\n• Processions (rath yatra)\n• Reciting Mahavira\'s teachings\n• Charitable activities\n• Fasting\n• Meditation',
    celebration_regions: 'Pan-India; especially Gujarat, Rajasthan, Maharashtra, Karnataka',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
    seo_slug: 'mahavir-jayanti',
    dates: [
      { year: 2026, date: '2026-04-02', tithi: 'Trayodashi', paksha: 'Shukla Paksha', hindu_month: 'Chaitra', notes: 'Birth of Lord Mahavira' },
      { year: 2027, date: '2027-03-22', tithi: 'Trayodashi', paksha: 'Shukla Paksha', hindu_month: 'Chaitra', notes: 'Birth of Lord Mahavira' },
      { year: 2028, date: '2028-04-09', tithi: 'Trayodashi', paksha: 'Shukla Paksha', hindu_month: 'Chaitra', notes: 'Birth of Lord Mahavira' }
    ]
  },
  {
    name: 'Paryushana',
    religion: 'Jain',
    description: 'Paryushana is the most important annual Jain festival of fasting, introspection, and seeking forgiveness.',
    history: 'An ancient Jain tradition where monks stay in one place during monsoon to avoid harming organisms. Lay people observe intensive religious practices.',
    significance: 'A period of spiritual purification, self-discipline, and seeking forgiveness from all beings. Culminates in Samvatsari.',
    how_celebrated: '• 8-10 days of observance\n• Intensive fasting\n• Reading Jain scriptures\n• Meditation and reflection\n• Seeking and granting forgiveness\n• Samvatsari (final day)\n• Pratikraman rituals',
    celebration_regions: 'Pan-India; Jain communities, especially Gujarat, Rajasthan, Maharashtra',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
    seo_slug: 'paryushana',
    dates: [
      { year: 2026, date: '2026-08-22', tithi: 'Bhadrapada Shukla 5-13', paksha: 'Shukla Paksha', hindu_month: 'Bhadrapada', notes: 'Shwetambar Paryushana begins' },
      { year: 2027, date: '2027-09-10', tithi: 'Bhadrapada Shukla 5-13', paksha: 'Shukla Paksha', hindu_month: 'Bhadrapada', notes: 'Shwetambar Paryushana begins' },
      { year: 2028, date: '2028-08-29', tithi: 'Bhadrapada Shukla 5-13', paksha: 'Shukla Paksha', hindu_month: 'Bhadrapada', notes: 'Shwetambar Paryushana begins' }
    ]
  },
  // ========================================
  // NATIONAL FESTIVALS
  // ========================================
  {
    name: 'Republic Day',
    religion: 'National',
    description: 'Republic Day celebrates the adoption of India\'s Constitution on January 26, 1950, marking India\'s transition to a sovereign republic.',
    history: 'The Constitution was adopted on November 26, 1949, but came into effect on January 26, 1950, chosen to honor the 1930 Declaration of Independence.',
    significance: 'Honors India\'s constitutional values: justice, liberty, equality, and fraternity. Celebrates unity in diversity.',
    how_celebrated: '• Grand parade at Rajpath, Delhi\n• Flag hoisting ceremonies\n• State tableaux\n• Military displays\n• Cultural performances\n• Beating Retreat ceremony\n• National awards',
    celebration_regions: 'Pan-India; main celebrations in New Delhi',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800',
    seo_slug: 'republic-day',
    dates: [
      { year: 2026, date: '2026-01-26', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'January', notes: '77th Republic Day' },
      { year: 2027, date: '2027-01-26', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'January', notes: '78th Republic Day' },
      { year: 2028, date: '2028-01-26', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'January', notes: '79th Republic Day' }
    ]
  },
  {
    name: 'Independence Day',
    religion: 'National',
    description: 'Independence Day celebrates India\'s freedom from British rule on August 15, 1947, honoring the sacrifices of freedom fighters.',
    history: 'At midnight on August 15, 1947, India became independent. Jawaharlal Nehru delivered the famous "Tryst with Destiny" speech.',
    significance: 'Honors freedom fighters\' sacrifices and celebrates national sovereignty. A day to reflect on India\'s progress and challenges.',
    how_celebrated: '• PM\'s speech at Red Fort\n• Flag hoisting nationwide\n• Patriotic songs and programs\n• Cultural events\n• Kite flying (in some regions)\n• National anthem\n• Honoring freedom fighters',
    celebration_regions: 'Pan-India; main celebrations at Red Fort, Delhi',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800',
    seo_slug: 'independence-day',
    dates: [
      { year: 2026, date: '2026-08-15', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'August', notes: '80th Independence Day' },
      { year: 2027, date: '2027-08-15', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'August', notes: '81st Independence Day' },
      { year: 2028, date: '2028-08-15', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'August', notes: '82nd Independence Day' }
    ]
  },
  {
    name: 'Gandhi Jayanti',
    religion: 'National',
    description: 'Gandhi Jayanti commemorates the birth of Mahatma Gandhi, the Father of the Nation, who led India\'s independence movement through non-violence.',
    history: 'Mohandas Karamchand Gandhi was born on October 2, 1869, in Porbandar, Gujarat. He pioneered Satyagraha - resistance through non-violent civil disobedience.',
    significance: 'Celebrates Gandhi\'s principles of truth, non-violence, and simple living. Declared International Day of Non-Violence by UN.',
    how_celebrated: '• Prayer meetings at Raj Ghat\n• Cleanliness drives\n• Spinning charkha\n• Singing Gandhi\'s favorite bhajans\n• School programs\n• Promoting khadi\n• Charitable activities',
    celebration_regions: 'Pan-India; main event at Raj Ghat, Delhi',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800',
    seo_slug: 'gandhi-jayanti',
    dates: [
      { year: 2026, date: '2026-10-02', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'October', notes: '157th Birth Anniversary' },
      { year: 2027, date: '2027-10-02', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'October', notes: '158th Birth Anniversary' },
      { year: 2028, date: '2028-10-02', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'October', notes: '159th Birth Anniversary' }
    ]
  },
  // ========================================
  // TRIBAL & REGIONAL FESTIVALS
  // ========================================
  {
    name: 'Bihu',
    religion: 'Hindu',
    description: 'Bihu is Assam\'s most celebrated festival with three seasonal celebrations - Bohag Bihu (spring), Kati Bihu (autumn), and Magh Bihu (winter harvest).',
    history: 'An ancient agricultural festival of the Assamese people, celebrating the Assamese New Year and harvest seasons.',
    significance: 'Celebrates nature\'s bounty, community bonds, and Assamese cultural identity. A festival of joy, dance, and feasting.',
    how_celebrated: '• Bihu dance performances\n• Traditional songs (Bihu geet)\n• Community feasts\n• Wearing traditional Mekhela Chador\n• Husori (house-to-house singing)\n• Preparing Pitha (rice cakes)\n• Bonfires (Meji)',
    celebration_regions: 'Assam, Assamese communities worldwide',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
    seo_slug: 'bihu',
    dates: [
      { year: 2026, date: '2026-04-14', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'Chaitra/Vaisakha', notes: 'Bohag Bihu - Assamese New Year' },
      { year: 2027, date: '2027-04-14', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'Chaitra/Vaisakha', notes: 'Bohag Bihu - Assamese New Year' },
      { year: 2028, date: '2028-04-14', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'Chaitra/Vaisakha', notes: 'Bohag Bihu - Assamese New Year' }
    ]
  },
  {
    name: 'Hornbill Festival',
    religion: 'Tribal',
    description: 'The Hornbill Festival is Nagaland\'s "Festival of Festivals," showcasing the culture, traditions, and heritage of all Naga tribes.',
    history: 'Started in 2000 by the Nagaland government to revive and protect Naga heritage. Named after the Hornbill bird, sacred to the Nagas.',
    significance: 'Promotes inter-tribal interaction, preserves Naga heritage, and showcases diverse tribal cultures to the world.',
    how_celebrated: '• Traditional Naga dances\n• War cries and folk songs\n• Indigenous games\n• Naga cuisine\n• Handicraft exhibitions\n• Traditional dress displays\n• Cultural competitions',
    celebration_regions: 'Nagaland (Kisama Heritage Village near Kohima)',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1597696929736-6d13bed8e6a8?w=800',
    seo_slug: 'hornbill-festival',
    dates: [
      { year: 2026, date: '2026-12-01', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'December', notes: 'December 1-10' },
      { year: 2027, date: '2027-12-01', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'December', notes: 'December 1-10' },
      { year: 2028, date: '2028-12-01', tithi: 'Fixed Date', paksha: 'N/A', hindu_month: 'December', notes: 'December 1-10' }
    ]
  },
  {
    name: 'Ugadi',
    religion: 'Hindu',
    description: 'Ugadi (Gudi Padwa in Maharashtra) marks the Telugu and Kannada New Year, celebrated with special rituals and the famous Ugadi Pachadi.',
    history: 'Marks the beginning of a new Hindu lunar calendar year. "Ugadi" derives from "Yuga" (era) + "Adi" (beginning).',
    significance: 'Symbolizes new beginnings, prosperity, and the cycle of time. The Pachadi represents life\'s mix of experiences.',
    how_celebrated: '• Preparing Ugadi Pachadi (6-taste dish)\n• Hoisting Gudi (in Maharashtra)\n• Wearing new clothes\n• Temple visits\n• Panchanga Shravanam (reading almanac)\n• Decorating homes with mango leaves\n• Special meals',
    celebration_regions: 'Andhra Pradesh, Telangana, Karnataka, Maharashtra (as Gudi Padwa)',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    seo_slug: 'ugadi',
    dates: [
      { year: 2026, date: '2026-03-29', tithi: 'Pratipada', paksha: 'Shukla Paksha', hindu_month: 'Chaitra', notes: 'Telugu/Kannada New Year' },
      { year: 2027, date: '2027-03-18', tithi: 'Pratipada', paksha: 'Shukla Paksha', hindu_month: 'Chaitra', notes: 'Telugu/Kannada New Year' },
      { year: 2028, date: '2028-04-05', tithi: 'Pratipada', paksha: 'Shukla Paksha', hindu_month: 'Chaitra', notes: 'Telugu/Kannada New Year' }
    ]
  },
  {
    name: 'Vishu',
    religion: 'Hindu',
    description: 'Vishu is the Malayalam New Year festival celebrated in Kerala with Vishukkani (auspicious first sight) and Vishukkaineettam (gifts).',
    history: 'An ancient Kerala festival marking the astronomical new year when the sun enters Mesha Rashi (Aries).',
    significance: 'Symbolizes prosperity and new beginnings. The first sight (Kani) on Vishu morning determines the year\'s fortune.',
    how_celebrated: '• Arranging Vishukkani (auspicious arrangement)\n• First sight ritual at dawn\n• Vishukkaineettam (giving money to young)\n• Wearing new clothes (Puthukodi)\n• Sadya feast\n• Bursting crackers\n• Temple visits',
    celebration_regions: 'Kerala, Tulu Nadu (Karnataka)',
    festival_type: 'FIXED',
    image_url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
    seo_slug: 'vishu',
    dates: [
      { year: 2026, date: '2026-04-14', tithi: 'Mesha Sankranti', paksha: 'N/A', hindu_month: 'Medam', notes: 'Malayalam New Year' },
      { year: 2027, date: '2027-04-14', tithi: 'Mesha Sankranti', paksha: 'N/A', hindu_month: 'Medam', notes: 'Malayalam New Year' },
      { year: 2028, date: '2028-04-13', tithi: 'Mesha Sankranti', paksha: 'N/A', hindu_month: 'Medam', notes: 'Malayalam New Year' }
    ]
  },
  {
    name: 'Rath Yatra',
    religion: 'Hindu',
    description: 'Rath Yatra is the famous chariot festival of Lord Jagannath in Puri, where huge chariots carry the deities through the streets.',
    history: 'One of the oldest Hindu festivals, mentioned in Brahma Purana. The annual journey of Lord Jagannath from his temple to Gundicha temple.',
    significance: 'Symbolizes the Lord\'s journey to his aunt\'s house. The English word "Juggernaut" derives from Jagannath\'s chariot.',
    how_celebrated: '• Pulling massive wooden chariots\n• Millions of devotees participate\n• Chanting "Jai Jagannath"\n• Special darshan opportunities\n• Nine-day festival\n• Return journey (Bahuda Yatra)\n• Traditional offerings',
    celebration_regions: 'Puri (Odisha), and ISKCON temples worldwide',
    festival_type: 'LUNAR',
    image_url: 'https://images.unsplash.com/photo-1597696929736-6d13bed8e6a8?w=800',
    seo_slug: 'rath-yatra',
    dates: [
      { year: 2026, date: '2026-06-25', tithi: 'Dwitiya', paksha: 'Shukla Paksha', hindu_month: 'Ashadha', notes: 'Jagannath Rath Yatra' },
      { year: 2027, date: '2027-07-14', tithi: 'Dwitiya', paksha: 'Shukla Paksha', hindu_month: 'Ashadha', notes: 'Jagannath Rath Yatra' },
      { year: 2028, date: '2028-07-03', tithi: 'Dwitiya', paksha: 'Shukla Paksha', hindu_month: 'Ashadha', notes: 'Jagannath Rath Yatra' }
    ]
  }
];

// ============================================
// SEED SCRIPT
// ============================================

async function seedFestivals() {
  let connection;
  
  try {
    console.log('🎉 Comprehensive Festivals Seeding Script');
    console.log('=========================================\n');
    console.log('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 30000
    });
    
    console.log('✓ Connected to database!\n');
    
    // Create/update festivals table
    console.log('Creating/updating festivals table...');
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
        gallery_images JSON,
        seo_slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create/update festival_dates table
    console.log('Creating/updating festival_dates table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS festival_dates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        festival_id INT NOT NULL,
        year INT NOT NULL,
        date DATE NOT NULL,
        tithi VARCHAR(100),
        paksha VARCHAR(50),
        hindu_month VARCHAR(100),
        notes TEXT,
        regional_variations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_festival_year (festival_id, year),
        FOREIGN KEY (festival_id) REFERENCES festivals(id) ON DELETE CASCADE
      )
    `);
    
    // Add new columns if they don't exist
    const alterQueries = [
      'ALTER TABLE festivals ADD COLUMN gallery_images JSON',
      'ALTER TABLE festival_dates ADD COLUMN paksha VARCHAR(50)',
      'ALTER TABLE festival_dates ADD COLUMN hindu_month VARCHAR(100)',
      'ALTER TABLE festival_dates ADD COLUMN regional_variations TEXT'
    ];
    
    for (const query of alterQueries) {
      try {
        await connection.execute(query);
      } catch (e) {
        // Column likely already exists
      }
    }
    
    console.log('✓ Tables ready!\n');
    
    // Seed festivals
    console.log(`Seeding ${festivals.length} festivals...\n`);
    let inserted = 0;
    let updated = 0;
    
    for (const festival of festivals) {
      process.stdout.write(`  ${festival.name}... `);
      
      // Check if festival exists
      const [existing] = await connection.execute(
        'SELECT id FROM festivals WHERE seo_slug = ?',
        [festival.seo_slug]
      );
      
      let festivalId;
      
      if (existing.length > 0) {
        festivalId = existing[0].id;
        
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
        
        updated++;
        process.stdout.write('updated\n');
      } else {
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
        inserted++;
        process.stdout.write('inserted\n');
      }
      
      // Upsert dates
      for (const dateInfo of festival.dates) {
        const [existingDate] = await connection.execute(
          'SELECT id FROM festival_dates WHERE festival_id = ? AND year = ?',
          [festivalId, dateInfo.year]
        );
        
        if (existingDate.length > 0) {
          await connection.execute(`
            UPDATE festival_dates SET 
              date = ?, tithi = ?, paksha = ?, hindu_month = ?, notes = ?
            WHERE festival_id = ? AND year = ?
          `, [
            dateInfo.date, dateInfo.tithi, dateInfo.paksha, 
            dateInfo.hindu_month, dateInfo.notes, festivalId, dateInfo.year
          ]);
        } else {
          await connection.execute(`
            INSERT INTO festival_dates (festival_id, year, date, tithi, paksha, hindu_month, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            festivalId, dateInfo.year, dateInfo.date, dateInfo.tithi,
            dateInfo.paksha, dateInfo.hindu_month, dateInfo.notes
          ]);
        }
      }
    }
    
    console.log('\n=========================================');
    console.log('🎊 SEEDING COMPLETE!');
    console.log('=========================================');
    console.log(`Total festivals: ${festivals.length}`);
    console.log(`  New: ${inserted}`);
    console.log(`  Updated: ${updated}`);
    console.log('=========================================\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run
seedFestivals();
