// From ui-ux-pro-max (MIT, github.com/nextlevelbuilder/ui-ux-pro-max-skill),
// data/colors.csv and data/products.csv. Design notes per product type. Generated; edit the source data.

export type Product = {
  type: string // 'SaaS (General)'
  keywords: string
  style: string // recommended visual style
  colors: string // what the palette is about
  notes: string // key considerations
}

export const products: Record<string, Product> = {
  'saas-general': {
    type: 'SaaS (General)',
    keywords: 'app, b2b, cloud, general, saas, software, subscription',
    style:
      'Glassmorphism + Flat Design; also Soft UI Evolution , Minimalism & Swiss Style',
    colors: 'Trust blue + accent contrast',
    notes: 'Balance modern feel with clarity. Focus on CTAs.',
  },
  'micro-saas': {
    type: 'Micro SaaS',
    keywords:
      'indie, micro-saas, niche, solo, bootstrap, micro, side-project, solopreneur, small-team, indie-hacker, product-hunt',
    style:
      'Flat Design + Vibrant & Block-based; also Motion-Driven , Micro-interactions',
    colors: 'Vibrant primary + white space',
    notes: 'Keep simple, show product quickly. Speed is key.',
  },
  'e-commerce': {
    type: 'E-commerce',
    keywords:
      'buy, commerce, e, ecommerce, products, retail, sell, shop, store',
    style: 'Vibrant & Block-based; also Aurora UI , Motion-Driven',
    colors: 'Brand primary + success green',
    notes: 'Engagement & conversions. High visual hierarchy.',
  },
  'e-commerce-luxury': {
    type: 'E-commerce Luxury',
    keywords:
      'buy, commerce, e, ecommerce, elegant, exclusive, high-end, luxury, premium, products, retail, sell, shop, store',
    style: 'Liquid Glass + Glassmorphism; also 3D & Hyperrealism , Aurora UI',
    colors: 'Premium colors + minimal accent',
    notes: 'Elegance & sophistication. Premium materials.',
  },
  'b2b-service': {
    type: 'B2B Service',
    keywords:
      'b2b, enterprise, consulting, professional, solution, contract, corporate, strategy, advisory, roi, deliverable, whitepaper',
    style:
      'Accessible & Ethical + Minimalism & Swiss Style; also Bento Box Grid , Micro-interactions',
    colors: 'Professional blue + neutral grey',
    notes: 'Credibility essential. Clear ROI messaging.',
  },
  'financial-dashboard': {
    type: 'Financial Dashboard',
    keywords:
      'portfolio, trading, pnl, budget, revenue, expense, cashflow, balance-sheet, investment, bank, accounting, fintech',
    style:
      'Dark Mode (OLED) + Data-Dense Dashboard; also Minimalism & Swiss Style , Accessible & Ethical',
    colors: 'Dark bg + red/green alerts + trust blue',
    notes: 'High contrast, real-time updates, accuracy paramount.',
  },
  'analytics-dashboard': {
    type: 'Analytics Dashboard',
    keywords:
      'kpi, metric, funnel, conversion, cohort, retention, segment, attribution, ab-test, dashboard-data, business-intelligence',
    style:
      'Data-Dense Dashboard + Heat Map & Heatmap Style; also Minimalism & Swiss Style , Dark Mode (OLED)',
    colors: 'Cool\u2192Hot gradients + neutral grey',
    notes: 'Clarity > aesthetics. Color-coded data priority.',
  },
  'healthcare-app': {
    type: 'Healthcare App',
    keywords: 'app, clinic, health, healthcare, medical, patient',
    style:
      'Neumorphism + Accessible & Ethical; also Soft UI Evolution , Claymorphism',
    colors: 'Calm blue + health green + trust',
    notes: 'Accessibility mandatory. Calming aesthetic.',
  },
  'educational-app': {
    type: 'Educational App',
    keywords: 'app, course, education, educational, learning, school, training',
    style:
      'Claymorphism + Micro-interactions; also Vibrant & Block-based , Flat Design',
    colors: 'Playful colors + clear hierarchy',
    notes: 'Engagement & ease of use. Age-appropriate design.',
  },
  'creative-agency': {
    type: 'Creative Agency',
    keywords:
      'branding, identity, portfolio, logo, visual, rebrand, creative-director, campaign, awards, award-winning, showreel',
    style:
      'Brutalism + Motion-Driven; also Retro-Futurism , Editorial Grid / Magazine',
    colors: 'Bold primaries + artistic freedom',
    notes: 'Differentiation key. Wow-factor necessary.',
  },
  'portfolio-personal': {
    type: 'Portfolio/Personal',
    keywords: 'creative, personal, portfolio, projects, showcase, work',
    style:
      'Motion-Driven + Minimalism & Swiss Style; also Brutalism , Aurora UI',
    colors: 'Brand primary + artistic interpretation',
    notes: 'Showcase work. Personality shine through.',
  },
  gaming: {
    type: 'Gaming',
    keywords: 'entertainment, esports, game, gaming, play',
    style:
      '3D & Hyperrealism + Retro-Futurism; also Motion-Driven , Vibrant & Block-based',
    colors: 'Vibrant + neon + immersive colors',
    notes: 'Immersion priority. Performance critical.',
  },
  'government-public-service': {
    type: 'Government/Public Service',
    keywords:
      'government, civic, municipal, federal, citizen, public, administration, permit, tax, voter, transparency, regulation',
    style:
      'Accessible & Ethical + Minimalism & Swiss Style; also Flat Design , Inclusive Design',
    colors: 'Professional blue + high contrast',
    notes: 'WCAG AAA mandatory. Trust paramount.',
  },
  'fintech-crypto': {
    type: 'Fintech/Crypto',
    keywords:
      'banking, blockchain, crypto, defi, finance, fintech, money, nft, payment, web3',
    style:
      'Glassmorphism + Dark Mode (OLED); also Retro-Futurism , Motion-Driven',
    colors: 'Dark tech colors + trust + vibrant accents',
    notes: 'Security perception. Real-time data critical.',
  },
  'social-media-app': {
    type: 'Social Media App',
    keywords:
      'app, community, content, entertainment, media, network, sharing, social, streaming, users, video',
    style:
      'Vibrant & Block-based + Motion-Driven; also Aurora UI , Micro-interactions',
    colors: 'Vibrant + engagement colors',
    notes: 'Engagement & retention. Addictive design ethics.',
  },
  'productivity-tool': {
    type: 'Productivity Tool',
    keywords: 'collaboration, productivity, project, task, tool, workflow',
    style:
      'Flat Design + Micro-interactions; also Minimalism & Swiss Style , Soft UI Evolution',
    colors: 'Clear hierarchy + functional colors',
    notes: 'Ease of use. Speed & efficiency focus.',
  },
  'design-system-component-library': {
    type: 'Design System/Component Library',
    keywords: 'component, design, library, system',
    style:
      'Minimalism & Swiss Style + Accessible & Ethical; also Flat Design , Zero Interface',
    colors: 'Clear hierarchy + code-like structure',
    notes: 'Consistency. Developer-first approach.',
  },
  'ai-chatbot-platform': {
    type: 'AI/Chatbot Platform',
    keywords:
      'ai, artificial-intelligence, automation, chatbot, machine-learning, ml, platform',
    style:
      'AI-Native UI + Minimalism & Swiss Style; also Zero Interface , Glassmorphism',
    colors: 'Neutral + AI Purple (#6366F1)',
    notes:
      'Conversational UI. Streaming text. Context awareness. Minimal chrome.',
  },
  'nft-web3-platform': {
    type: 'NFT/Web3 Platform',
    keywords: 'nft, platform, web',
    style: 'Cyberpunk UI + Glassmorphism; also Aurora UI , 3D & Hyperrealism',
    colors: 'Dark + Neon + Gold (#FFD700)',
    notes:
      'Wallet integration. Transaction feedback. Gas fees display. Dark mode essential.',
  },
  'creator-economy-platform': {
    type: 'Creator Economy Platform',
    keywords: 'creator, economy, platform',
    style:
      'Vibrant & Block-based + Bento Box Grid; also Motion-Driven , Aurora UI',
    colors: 'Vibrant + Brand colors',
    notes:
      'Creator profiles. Monetization display. Engagement metrics. Social proof.',
  },
  'remote-work-collaboration-tool': {
    type: 'Remote Work/Collaboration Tool',
    keywords: 'collaboration, remote, tool, work',
    style:
      'Soft UI Evolution + Minimalism & Swiss Style; also Glassmorphism , Micro-interactions',
    colors: 'Calm Blue + Neutral grey',
    notes:
      'Real-time collaboration. Status indicators. Video integration. Notification management.',
  },
  'mental-health-app': {
    type: 'Mental Health App',
    keywords: 'app, health, mental',
    style:
      'Neumorphism + Accessible & Ethical; also Claymorphism , Soft UI Evolution',
    colors: 'Calm Pastels + Trust colors',
    notes:
      'Calming aesthetics. Privacy-first. Crisis resources. Progress tracking. Accessibility mandatory.',
  },
  'pet-tech-app': {
    type: 'Pet Tech App',
    keywords: 'app, pet, tech',
    style:
      'Claymorphism + Vibrant & Block-based; also Micro-interactions , Flat Design',
    colors: 'Playful + Warm colors',
    notes:
      'Pet profiles. Health tracking. Playful UI. Photo galleries. Vet integration.',
  },
  'smart-home-iot-dashboard': {
    type: 'Smart Home/IoT Dashboard',
    keywords: 'admin, analytics, dashboard, data, home, iot, panel, smart',
    style:
      'Glassmorphism + Dark Mode (OLED); also Minimalism & Swiss Style , AI-Native UI',
    colors: 'Dark + Status indicator colors',
    notes:
      'Device status. Real-time controls. Energy monitoring. Automation rules. Quick actions.',
  },
  'ev-charging-ecosystem': {
    type: 'EV/Charging Ecosystem',
    keywords: 'charging, ecosystem, ev',
    style:
      'Minimalism & Swiss Style + Aurora UI; also Glassmorphism , Organic Biophilic',
    colors: 'Electric Blue (#009CD1) + Green',
    notes:
      'Charging station maps. Range estimation. Cost calculation. Environmental impact.',
  },
  'subscription-box-service': {
    type: 'Subscription Box Service',
    keywords:
      'subscription, box, recurring, membership, unboxing, curated, plan, monthly, surprise, product-box',
    style:
      'Vibrant & Block-based + Motion-Driven; also Claymorphism , Aurora UI',
    colors: 'Brand + Excitement colors',
    notes:
      'Unboxing experience. Personalization quiz. Subscription management. Product reveals.',
  },
  'podcast-platform': {
    type: 'Podcast Platform',
    keywords: 'platform, podcast',
    style:
      'Dark Mode (OLED) + Minimalism & Swiss Style; also Motion-Driven , Vibrant & Block-based',
    colors: 'Dark + Audio waveform accents',
    notes:
      'Audio player UX. Episode discovery. Creator tools. Analytics for podcasters.',
  },
  'dating-app': {
    type: 'Dating App',
    keywords: 'app, dating',
    style:
      'Vibrant & Block-based + Motion-Driven; also Aurora UI , Glassmorphism',
    colors: 'Warm + Romantic (Pink/Red gradients)',
    notes:
      'Profile cards. Swipe interactions. Match animations. Safety features. Video chat.',
  },
  'micro-credentials-badges-platform': {
    type: 'Micro-Credentials/Badges Platform',
    keywords: 'badges, credentials, micro, platform',
    style:
      'Minimalism & Swiss Style + Flat Design; also Accessible & Ethical , Swiss Modernism 2.0',
    colors: 'Trust Blue + Gold (#FFD700)',
    notes:
      'Credential verification. Badge display. Progress tracking. Issuer trust. LinkedIn integration.',
  },
  'knowledge-base-documentation': {
    type: 'Knowledge Base/Documentation',
    keywords: 'base, documentation, knowledge',
    style:
      'Minimalism & Swiss Style + Accessible & Ethical; also Swiss Modernism 2.0 , Flat Design',
    colors: 'Clean hierarchy + minimal color',
    notes:
      'Search-first. Clear navigation. Code highlighting. Version switching. Feedback system.',
  },
  'hyperlocal-services': {
    type: 'Hyperlocal Services',
    keywords:
      'hyperlocal, local, neighborhood, nearby, community, nearby, zip, map, local-business, geo-target, city',
    style:
      'Minimalism & Swiss Style + Vibrant & Block-based; also Micro-interactions , Flat Design',
    colors: 'Location markers + Trust colors',
    notes:
      'Map integration. Service categories. Provider profiles. Booking system. Reviews.',
  },
  'beauty-spa-wellness-service': {
    type: 'Beauty/Spa/Wellness Service',
    keywords:
      'spa, beauty, salon, wellness, treatment, relaxation, massage, skincare, facial, aesthetic, self-care, pamper',
    style:
      'Soft UI Evolution + Neumorphism; also Glassmorphism , Minimalism & Swiss Style',
    colors: 'Soft pastels (Pink #FFB6C1 Sage #90EE90) + Cream + Gold accents',
    notes:
      'Calming aesthetic. Booking system. Service menu. Before/after gallery. Testimonials. Relaxing imagery.',
  },
  'luxury-premium-brand': {
    type: 'Luxury/Premium Brand',
    keywords: 'brand, elegant, exclusive, high-end, luxury, premium',
    style:
      'Liquid Glass + Glassmorphism; also Minimalism & Swiss Style , 3D & Hyperrealism',
    colors: 'Black + Gold (#FFD700) + White + Minimal accent',
    notes:
      'Elegance paramount. Premium imagery. Storytelling. High-quality visuals. Exclusive feel.',
  },
  'restaurant-food-service': {
    type: 'Restaurant/Food Service',
    keywords:
      'restaurant, menu, order, food, dining, reservation, delivery, cuisine, chef, table, takeaway, eatery',
    style:
      'Vibrant & Block-based + Motion-Driven; also Claymorphism , Flat Design',
    colors: 'Warm colors (Orange Red Brown) + appetizing imagery',
    notes:
      'Menu display. Online ordering. Reservation system. Food photography. Location/hours prominent.',
  },
  'fitness-gym-app': {
    type: 'Fitness/Gym App',
    keywords: 'app, exercise, fitness, gym, health, workout',
    style:
      'Vibrant & Block-based + Dark Mode (OLED); also Motion-Driven , Neumorphism',
    colors: 'Energetic (Orange #FF6B35 Electric Blue) + Dark bg',
    notes:
      'Progress tracking. Workout plans. Community features. Achievements. Motivational design.',
  },
  'real-estate-property': {
    type: 'Real Estate/Property',
    keywords: 'buy, estate, housing, property, real, real-estate, rent',
    style:
      'Glassmorphism + Minimalism & Swiss Style; also Motion-Driven , 3D & Hyperrealism',
    colors: 'Trust Blue (#0077B6) + Gold accents + White',
    notes:
      'Property listings. Virtual tours. Map integration. Agent profiles. Mortgage calculator. High-quality imagery.',
  },
  'travel-tourism-agency': {
    type: 'Travel/Tourism Agency',
    keywords:
      'travel, tourism, vacation, flight, hotel, destination, adventure, cruise, safari, backpacking, guided-tour, holiday-package',
    style:
      'Aurora UI + Motion-Driven; also Vibrant & Block-based , Glassmorphism',
    colors: 'Vibrant destination colors + Sky Blue + Warm accents',
    notes:
      'Destination showcase. Booking system. Itinerary builder. Reviews. Inspiration galleries. Mobile-first.',
  },
  'hotel-hospitality': {
    type: 'Hotel/Hospitality',
    keywords: 'hospitality, hotel',
    style:
      'Liquid Glass + Minimalism & Swiss Style; also Glassmorphism , Soft UI Evolution',
    colors: 'Warm neutrals + Gold (#D4AF37) + Brand accent',
    notes:
      'Room booking. Amenities showcase. Location maps. Guest reviews. Seasonal pricing. Luxury imagery.',
  },
  'wedding-event-planning': {
    type: 'Wedding/Event Planning',
    keywords:
      'conference, event, meetup, planning, registration, ticket, wedding',
    style: 'Soft UI Evolution + Aurora UI; also Glassmorphism , Motion-Driven',
    colors: 'Soft Pink (#FFD6E0) + Gold + Cream + Sage',
    notes:
      'Portfolio gallery. Vendor directory. Planning tools. Timeline. Budget tracker. Romantic aesthetic.',
  },
  'legal-services': {
    type: 'Legal Services',
    keywords:
      'law, attorney, legal, case, compliance, contract, court, firm, counsel, litigation, practice-area, jurisdiction',
    style:
      'Accessible & Ethical + Minimalism & Swiss Style; also Accessible & Ethical , Swiss Modernism 2.0',
    colors: 'Navy Blue (#1E3A5F) + Gold + White',
    notes:
      'Credibility paramount. Practice areas. Attorney profiles. Case results. Contact forms. Professional imagery.',
  },
  'insurance-platform': {
    type: 'Insurance Platform',
    keywords: 'insurance, platform',
    style:
      'Minimalism & Swiss Style + Flat Design; also Accessible & Ethical , Minimalism & Swiss Style',
    colors: 'Trust Blue (#0066CC) + Green (security) + Neutral',
    notes:
      'Quote calculator. Policy comparison. Claims process. Trust signals. Clear pricing. Security badges.',
  },
  'banking-traditional-finance': {
    type: 'Banking/Traditional Finance',
    keywords: 'banking, finance, traditional',
    style:
      'Minimalism & Swiss Style + Accessible & Ethical; also Swiss Modernism 2.0 , Dark Mode (OLED)',
    colors: 'Navy (#0A1628) + Trust Blue + Gold accents',
    notes:
      'Security-first. Account overview. Transaction history. Mobile banking. Accessibility critical. Trust paramount.',
  },
  'online-course-e-learning': {
    type: 'Online Course/E-learning',
    keywords: 'course, e, learning, online',
    style:
      'Claymorphism + Vibrant & Block-based; also Motion-Driven , Flat Design',
    colors: 'Vibrant learning colors + Progress green',
    notes:
      'Course catalog. Progress tracking. Video player. Quizzes. Certificates. Community forums. Gamification.',
  },
  'non-profit-charity': {
    type: 'Non-profit/Charity',
    keywords: 'charity, non, profit',
    style:
      'Accessible & Ethical + Organic Biophilic; also Minimalism & Swiss Style , Editorial Grid / Magazine',
    colors: 'Cause-related colors + Trust + Warm',
    notes:
      'Impact stories. Donation flow. Transparency reports. Volunteer signup. Event calendar. Emotional connection.',
  },
  'music-streaming': {
    type: 'Music Streaming',
    keywords: 'music, streaming',
    style:
      'Dark Mode (OLED) + Vibrant & Block-based; also Motion-Driven , Aurora UI',
    colors: 'Dark (#121212) + Vibrant accents + Album art colors',
    notes:
      'Audio player. Playlist management. Artist pages. Personalization. Social features. Waveform visualizations.',
  },
  'video-streaming-ott': {
    type: 'Video Streaming/OTT',
    keywords: 'ott, streaming, video',
    style:
      'Dark Mode (OLED) + Motion-Driven; also Glassmorphism , Vibrant & Block-based',
    colors: 'Dark bg + Content poster colors + Brand accent',
    notes:
      'Video player. Content discovery. Watchlist. Continue watching. Personalized recommendations. Thumbnail-heavy.',
  },
  'job-board-recruitment': {
    type: 'Job Board/Recruitment',
    keywords: 'board, job, recruitment',
    style:
      'Flat Design + Minimalism & Swiss Style; also Vibrant & Block-based , Accessible & Ethical',
    colors: 'Professional Blue + Success Green + Neutral',
    notes:
      'Job listings. Search/filter. Company profiles. Application tracking. Resume upload. Salary insights.',
  },
  'marketplace-p2p': {
    type: 'Marketplace (P2P)',
    keywords: 'buyers, listings, marketplace, p, platform, sellers',
    style:
      'Vibrant & Block-based + Flat Design; also Micro-interactions , Bento Box Grid',
    colors: 'Trust colors + Category colors + Success green',
    notes:
      'Seller/buyer profiles. Listings. Reviews/ratings. Secure payment. Messaging. Search/filter. Trust badges.',
  },
  'logistics-delivery': {
    type: 'Logistics/Delivery',
    keywords: 'delivery, logistics',
    style:
      'Minimalism & Swiss Style + Flat Design; also Dark Mode (OLED) , Micro-interactions',
    colors: 'Blue (#2563EB) + Orange (tracking) + Green (delivered)',
    notes:
      'Real-time tracking. Delivery scheduling. Route optimization. Driver management. Status updates. Map integration.',
  },
  'agriculture-farm-tech': {
    type: 'Agriculture/Farm Tech',
    keywords: 'agriculture, farm, tech',
    style:
      'Organic Biophilic + Flat Design; also Minimalism & Swiss Style , Accessible & Ethical',
    colors: 'Earth Green (#4A7C23) + Brown + Sky Blue',
    notes:
      'Crop monitoring. Weather data. IoT sensors. Yield tracking. Market prices. Sustainable imagery.',
  },
  'construction-architecture': {
    type: 'Construction/Architecture',
    keywords: 'architecture, construction',
    style:
      'Minimalism & Swiss Style + 3D & Hyperrealism; also Brutalism , Swiss Modernism 2.0',
    colors: 'Grey (#4A4A4A) + Orange (safety) + Blueprint Blue',
    notes:
      'Project portfolio. 3D renders. Timeline. Material specs. Team collaboration. Blueprint aesthetic.',
  },
  'automotive-car-dealership': {
    type: 'Automotive/Car Dealership',
    keywords: 'automotive, car, dealership',
    style:
      'Motion-Driven + 3D & Hyperrealism; also Dark Mode (OLED) , Glassmorphism',
    colors: 'Brand colors + Metallic accents + Dark/Light',
    notes:
      'Vehicle showcase. 360\u00b0 views. Comparison tools. Financing calculator. Test drive booking. High-quality imagery.',
  },
  'photography-studio': {
    type: 'Photography Studio',
    keywords: 'photography, studio',
    style:
      'Motion-Driven + Minimalism & Swiss Style; also Aurora UI , Glassmorphism',
    colors: 'Black + White + Minimal accent',
    notes:
      'Portfolio gallery. Before/after. Service packages. Booking system. Client galleries. Full-bleed imagery.',
  },
  'coworking-space': {
    type: 'Coworking Space',
    keywords: 'coworking, space',
    style:
      'Vibrant & Block-based + Glassmorphism; also Minimalism & Swiss Style , Motion-Driven',
    colors: 'Energetic colors + Wood tones + Brand accent',
    notes:
      'Space tour. Membership plans. Booking system. Amenities. Community events. Virtual tour.',
  },
  'home-services-plumber-electrician': {
    type: 'Home Services (Plumber/Electrician)',
    keywords:
      'plumber, electrician, hvac, handyman, repair, maintenance, home, emergency, leak, wiring, inspection, licensed',
    style:
      'Flat Design + Accessible & Ethical; also Minimalism & Swiss Style , Accessible & Ethical',
    colors: 'Trust Blue + Safety Orange + Professional grey',
    notes:
      'Service list. Emergency contact. Booking. Price transparency. Certifications. Local trust signals.',
  },
  'childcare-daycare': {
    type: 'Childcare/Daycare',
    keywords: 'childcare, daycare',
    style:
      'Claymorphism + Vibrant & Block-based; also Soft UI Evolution , Accessible & Ethical',
    colors: 'Playful pastels + Safe colors + Warm accents',
    notes:
      'Programs. Staff profiles. Safety certifications. Parent portal. Activity updates. Cheerful imagery.',
  },
  'senior-care-elderly': {
    type: 'Senior Care/Elderly',
    keywords: 'care, elderly, senior',
    style:
      'Accessible & Ethical + Soft UI Evolution; also Minimalism & Swiss Style , Neumorphism',
    colors: 'Calm Blue + Warm neutrals + Large text',
    notes:
      'Care services. Staff qualifications. Facility tour. Family portal. Large touch targets. High contrast. Accessibility-first.',
  },
  'medical-clinic': {
    type: 'Medical Clinic',
    keywords: 'clinic, medical',
    style:
      'Accessible & Ethical + Minimalism & Swiss Style; also Neumorphism , Soft UI Evolution',
    colors: 'Medical Blue (#0077B6) + Trust White + Calm Green',
    notes:
      'Services. Doctor profiles. Online booking. Patient portal. Insurance info. HIPAA compliant. Trust signals.',
  },
  'pharmacy-drug-store': {
    type: 'Pharmacy/Drug Store',
    keywords: 'drug, pharmacy, store',
    style:
      'Flat Design + Accessible & Ethical; also Minimalism & Swiss Style , Soft UI Evolution',
    colors: 'Pharmacy Green + Trust Blue + Clean White',
    notes:
      'Product catalog. Prescription upload. Refill reminders. Health info. Store locator. Safety certifications.',
  },
  'dental-practice': {
    type: 'Dental Practice',
    keywords: 'dental, practice',
    style:
      'Soft UI Evolution + Minimalism & Swiss Style; also Accessible & Ethical , Inclusive Design',
    colors: 'Fresh Blue + White + Smile Yellow accent',
    notes:
      'Services. Dentist profiles. Before/after. Online booking. Insurance. Patient testimonials. Friendly imagery.',
  },
  'veterinary-clinic': {
    type: 'Veterinary Clinic',
    keywords: 'clinic, veterinary',
    style:
      'Claymorphism + Accessible & Ethical; also Soft UI Evolution , Flat Design',
    colors: 'Caring Blue + Pet-friendly colors + Warm accents',
    notes:
      'Pet services. Vet profiles. Online booking. Pet portal. Emergency info. Friendly animal imagery.',
  },
  'florist-plant-shop': {
    type: 'Florist/Plant Shop',
    keywords: 'florist, plant, shop',
    style:
      'Organic Biophilic + Vibrant & Block-based; also Aurora UI , Motion-Driven',
    colors: 'Natural Green + Floral pinks/purples + Earth tones',
    notes:
      'Product catalog. Occasion categories. Delivery scheduling. Care guides. Seasonal collections. Beautiful imagery.',
  },
  'bakery-cafe': {
    type: 'Bakery/Cafe',
    keywords: 'bakery, cafe',
    style:
      'Vibrant & Block-based + Soft UI Evolution; also Claymorphism , Motion-Driven',
    colors: 'Warm Brown + Cream + Appetizing accents',
    notes:
      'Menu display. Online ordering. Location/hours. Catering. Seasonal specials. Appetizing photography.',
  },
  'brewery-winery': {
    type: 'Brewery/Winery',
    keywords: 'brewery, winery',
    style:
      'Motion-Driven + Vintage Analog / Retro Film; also Dark Mode (OLED) , Organic Biophilic',
    colors: 'Deep amber/burgundy + Gold + Craft aesthetic',
    notes:
      'Product showcase. Story/heritage. Tasting notes. Events. Club membership. Artisanal imagery.',
  },
  airline: {
    type: 'Airline',
    keywords: 'airline, aviation, flight, travel, booking, airport, flying',
    style:
      'Minimalism & Swiss Style + Glassmorphism; also Motion-Driven , Accessible & Ethical',
    colors: 'Sky Blue + Brand colors + Trust accents',
    notes:
      'Flight search. Booking. Check-in. Boarding pass. Loyalty program. Route maps. Mobile-first.',
  },
  'news-media-platform': {
    type: 'News/Media Platform',
    keywords: 'content, entertainment, media, news, platform, streaming, video',
    style:
      'Minimalism & Swiss Style + Flat Design; also Dark Mode (OLED) , Accessible & Ethical',
    colors: 'Brand colors + High contrast + Category colors',
    notes:
      'Article layout. Breaking news. Categories. Search. Subscription. Mobile reading. Fast loading.',
  },
  'magazine-blog': {
    type: 'Magazine/Blog',
    keywords: 'articles, blog, content, magazine, posts, writing',
    style:
      'Swiss Modernism 2.0 + Motion-Driven; also Minimalism & Swiss Style , Aurora UI',
    colors: 'Editorial colors + Brand primary + Clean white',
    notes:
      'Article showcase. Category navigation. Author profiles. Newsletter signup. Related content. Typography-focused.',
  },
  'freelancer-platform': {
    type: 'Freelancer Platform',
    keywords: 'freelancer, platform',
    style:
      'Flat Design + Minimalism & Swiss Style; also Vibrant & Block-based , Micro-interactions',
    colors: 'Professional Blue + Success Green + Neutral',
    notes:
      'Profile creation. Portfolio. Skill matching. Messaging. Payment. Reviews. Project management.',
  },
  'marketing-agency': {
    type: 'Marketing Agency',
    keywords:
      'campaign, ads, growth, roi, seo, sem, ppc, social-media, conversion-funnel, ab-test, attribution, performance-marketing',
    style: 'Brutalism + Motion-Driven; also Vibrant & Block-based , Aurora UI',
    colors: 'Bold brand colors + Creative freedom',
    notes:
      'Portfolio. Case studies. Services. Team. Creative showcase. Results-focused. Bold aesthetic.',
  },
  'event-management': {
    type: 'Event Management',
    keywords: 'conference, event, management, meetup, registration, ticket',
    style:
      'Vibrant & Block-based + Motion-Driven; also Glassmorphism , Aurora UI',
    colors: 'Event theme colors + Excitement accents',
    notes:
      'Event showcase. Registration. Agenda. Speakers. Sponsors. Ticket sales. Countdown timer.',
  },
  'membership-community': {
    type: 'Membership/Community',
    keywords: 'community, membership',
    style:
      'Vibrant & Block-based + Soft UI Evolution; also Bento Box Grid , Micro-interactions',
    colors: 'Community brand colors + Engagement accents',
    notes:
      'Member benefits. Pricing tiers. Community showcase. Events. Member directory. Exclusive content.',
  },
  'newsletter-platform': {
    type: 'Newsletter Platform',
    keywords: 'newsletter, platform',
    style:
      'Minimalism & Swiss Style + Flat Design; also Swiss Modernism 2.0 , Accessible & Ethical',
    colors: 'Brand primary + Clean white + CTA accent',
    notes:
      'Subscribe form. Archive. About. Social proof. Sample content. Simple conversion.',
  },
  'digital-products-downloads': {
    type: 'Digital Products/Downloads',
    keywords: 'digital, downloads, products',
    style:
      'Vibrant & Block-based + Motion-Driven; also Glassmorphism , Bento Box Grid',
    colors: 'Product category colors + Brand + Success green',
    notes:
      'Product showcase. Preview. Pricing. Instant delivery. License management. Customer reviews.',
  },
  'church-religious-organization': {
    type: 'Church/Religious Organization',
    keywords: 'church, organization, religious',
    style:
      'Accessible & Ethical + Soft UI Evolution; also Minimalism & Swiss Style , Inclusive Design',
    colors: 'Warm Gold + Deep Purple/Blue + White',
    notes:
      'Service times. Events. Sermons. Community. Giving. Location. Welcoming imagery.',
  },
  'sports-team-club': {
    type: 'Sports Team/Club',
    keywords: 'club, sports, team',
    style:
      'Vibrant & Block-based + Motion-Driven; also Dark Mode (OLED) , 3D & Hyperrealism',
    colors: 'Team colors + Energetic accents',
    notes:
      'Schedule. Roster. News. Tickets. Merchandise. Fan engagement. Action imagery.',
  },
  'museum-gallery': {
    type: 'Museum/Gallery',
    keywords: 'gallery, museum',
    style:
      'Minimalism & Swiss Style + Motion-Driven; also Swiss Modernism 2.0 , 3D & Hyperrealism',
    colors: 'Art-appropriate neutrals + Exhibition accents',
    notes:
      'Exhibitions. Collections. Tickets. Events. Virtual tours. Educational content. Art-focused design.',
  },
  'theater-cinema': {
    type: 'Theater/Cinema',
    keywords: 'cinema, theater',
    style:
      'Dark Mode (OLED) + Motion-Driven; also Vibrant & Block-based , Glassmorphism',
    colors: 'Dark + Spotlight accents + Gold',
    notes:
      'Showtimes. Seat selection. Trailers. Coming soon. Membership. Dramatic imagery.',
  },
  'language-learning-app': {
    type: 'Language Learning App',
    keywords: 'app, language, learning',
    style:
      'Claymorphism + Vibrant & Block-based; also Micro-interactions , Flat Design',
    colors: 'Playful colors + Progress indicators + Country flags',
    notes:
      'Lesson structure. Progress tracking. Gamification. Speaking practice. Community. Achievement badges.',
  },
  'coding-bootcamp': {
    type: 'Coding Bootcamp',
    keywords: 'bootcamp, coding',
    style:
      'Dark Mode (OLED) + Minimalism & Swiss Style; also Cyberpunk UI , Flat Design',
    colors: 'Code editor colors + Brand + Success green',
    notes:
      'Curriculum. Projects. Career outcomes. Alumni. Pricing. Application. Terminal aesthetic.',
  },
  'cybersecurity-platform': {
    type: 'Cybersecurity Platform',
    keywords: 'cyber, security, platform',
    style:
      'Cyberpunk UI + Dark Mode (OLED); also Neubrutalism , Minimalism & Swiss Style',
    colors: 'Matrix Green + Deep Black + Terminal feel',
    notes: 'Data density. Threat visualization. Dark mode default.',
  },
  'developer-tool-ide': {
    type: 'Developer Tool / IDE',
    keywords: 'dev, developer, tool, ide',
    style:
      'Dark Mode (OLED) + Minimalism & Swiss Style; also Flat Design , Bento Box Grid',
    colors: 'Dark syntax theme colors + Blue focus',
    notes: 'Keyboard shortcuts. Syntax highlighting. Fast performance.',
  },
  'biotech-life-sciences': {
    type: 'Biotech / Life Sciences',
    keywords: 'biotech, biology, science',
    style:
      'Glassmorphism + Biomimetic / Organic 2.0; also Minimalism & Swiss Style , Organic Biophilic',
    colors: 'Sterile White + DNA Blue + Life Green',
    notes: 'Data accuracy. Cleanliness. Complex data viz.',
  },
  'space-tech-aerospace': {
    type: 'Space Tech / Aerospace',
    keywords: 'aerospace, space, tech',
    style:
      'HUD / Sci-Fi FUI + Dark Mode (OLED); also Glassmorphism , 3D & Hyperrealism',
    colors: 'Deep Space Black + Star White + Metallic',
    notes: 'High-tech feel. Precision. Telemetry data.',
  },
  'architecture-interior': {
    type: 'Architecture / Interior',
    keywords: 'architecture, design, interior',
    style:
      'Exaggerated Minimalism + 3D & Hyperrealism; also Swiss Modernism 2.0 , Parallax Storytelling',
    colors: 'Monochrome + Gold Accent + High Imagery',
    notes: 'High-res images. Typography. Space.',
  },
  'quantum-computing-interface': {
    type: 'Quantum Computing Interface',
    keywords: 'quantum, computing, physics, qubit, future, science',
    style:
      'HUD / Sci-Fi FUI + Dark Mode (OLED); also Glassmorphism , Spatial UI (VisionOS)',
    colors: 'Quantum Blue #00FFFF + Deep Black + Interference patterns',
    notes:
      'Visualize complexity. Qubit states. Probability clouds. High-tech trust.',
  },
  'biohacking-longevity-app': {
    type: 'Biohacking / Longevity App',
    keywords: 'biohacking, health, longevity, tracking, wellness, science',
    style:
      'Biomimetic / Organic 2.0; also Minimalism & Swiss Style , Dark Mode (OLED)',
    colors: 'Cellular Pink/Red + DNA Blue + Clean White',
    notes:
      'Personal data privacy. Scientific credibility. Biological visualizations.',
  },
  'autonomous-drone-fleet-manager': {
    type: 'Autonomous Drone Fleet Manager',
    keywords: 'drone, autonomous, fleet, aerial, logistics, robotics',
    style:
      'HUD / Sci-Fi FUI; also Real-Time Monitoring , Spatial UI (VisionOS)',
    colors: 'Tactical Green #00FF00 + Alert Red + Map Dark',
    notes:
      'Real-time telemetry. 3D spatial awareness. Latency indicators. Safety alerts.',
  },
  'generative-art-platform': {
    type: 'Generative Art Platform',
    keywords: 'art, generative, ai, creative, platform, gallery',
    style:
      'Minimalism & Swiss Style + Gen Z Chaos / Maximalism; also Bento Box Grid , Dark Mode (OLED)',
    colors: 'Neutral #F5F5F5 (Canvas) + User Content',
    notes: 'Content is king. Fast loading. Creator attribution. Minting flow.',
  },
  'spatial-computing-os-app': {
    type: 'Spatial Computing OS / App',
    keywords: 'spatial, vr, ar, vision, os, immersive, mixed-reality',
    style: 'Spatial UI (VisionOS); also Glassmorphism , 3D & Hyperrealism',
    colors: 'Frosted Glass + System Colors + Depth',
    notes: 'Gaze/Pinch interaction. Depth hierarchy. Environment awareness.',
  },
  'sustainable-energy-climate-tech': {
    type: 'Sustainable Energy / Climate Tech',
    keywords: 'climate, energy, sustainable, green, tech, carbon',
    style:
      'Organic Biophilic + E-Ink / Paper; also Data-Dense Dashboard , Swiss Modernism 2.0',
    colors: 'Earth Green + Sky Blue + Solar Yellow',
    notes: 'Data transparency. Impact visualization. Low-carbon web design.',
  },
  'personal-finance-tracker': {
    type: 'Personal Finance Tracker',
    keywords:
      'budget, expense, money, finance, spending, savings, tracker, personal, wallet',
    style:
      'Glassmorphism + Dark Mode (OLED); also Minimalism & Swiss Style , Flat Design',
    colors: 'Calm blue + success green + alert red + chart accents',
    notes:
      'Category pie/donut charts. Monthly trend lines. Budget progress bars. Transaction list with swipe actions. Receipt camera. Currency formatting. Recurring entries.',
  },
  'chat-messaging-app': {
    type: 'Chat & Messaging App',
    keywords:
      'chat, message, messenger, im, realtime, conversation, inbox, dm, whatsapp, telegram',
    style:
      'Minimalism & Swiss Style + Micro-interactions; also Glassmorphism , Flat Design',
    colors: 'Brand primary + bubble contrast (sender/receiver) + typing grey',
    notes:
      'Bubble UI (left/right alignment). Typing indicators. Read receipts (\u2713\u2713). Image/file preview. Emoji reactions. Group avatars. Online status dots. Swipe-to-reply.',
  },
  'notes-writing-app': {
    type: 'Notes & Writing App',
    keywords:
      'notes, memo, writing, editor, notebook, markdown, journal, notion, obsidian',
    style:
      'Minimalism & Swiss Style + Flat Design; also Swiss Modernism 2.0 , Soft UI Evolution',
    colors: 'Clean white/cream + minimal accent + editor syntax colors',
    notes:
      'WYSIWYG or Markdown toggle. Folder/tag organization. Full-text search. Cloud sync. Typography-first. Distraction-free zen mode. Slash-command palette.',
  },
  'habit-tracker': {
    type: 'Habit Tracker',
    keywords:
      'habit, streak, routine, daily, tracker, goals, consistency, discipline',
    style:
      'Claymorphism + Vibrant & Block-based; also Micro-interactions , Flat Design',
    colors:
      'Streak warm (amber/orange) + progress green + motivational accents',
    notes:
      'Streak calendar heatmap. Daily check-in interaction. Gamification (badges/levels/fire). Reminder push. Progress ring charts. Weekly/monthly stats. Motivational micro-copy.',
  },
  'food-delivery-on-demand': {
    type: 'Food Delivery / On-Demand',
    keywords:
      'delivery, food, order, uber-eats, doordash, takeout, on-demand, courier',
    style:
      'Vibrant & Block-based + Motion-Driven; also Glassmorphism , Flat Design',
    colors: 'Appetizing warm (orange/red) + trust blue + map accent',
    notes:
      'Restaurant cards with ratings. Menu category horizontal scroll. Cart bottom sheet. Real-time map tracking + driver ETA. Order status stepper. Rating post-delivery.',
  },
  'ride-hailing-transportation': {
    type: 'Ride Hailing / Transportation',
    keywords: 'ride, taxi, uber, lyft, transport, carpool, driver, trip, fare',
    style:
      'Minimalism & Swiss Style + Glassmorphism; also Dark Mode (OLED) , Motion-Driven',
    colors: 'Brand primary + map neutral + status indicator colors',
    notes:
      'Map-centric full-screen UI. Pickup/dropoff pins + route polyline. Driver card (photo/rating/vehicle). Fare estimate. Trip timer. Safety SOS button. Payment sheet.',
  },
  'recipe-cooking-app': {
    type: 'Recipe & Cooking App',
    keywords:
      'recipe, cooking, food, kitchen, cookbook, meal, ingredient, chef',
    style:
      'Claymorphism + Vibrant & Block-based; also Soft UI Evolution , Organic Biophilic',
    colors: 'Warm food tones (terracotta/sage/cream) + appetizing imagery',
    notes:
      'Step-by-step with checkable instructions. Ingredient list with serving adjuster. Built-in timer per step. Cooking mode (screen-awake + large text). Save/bookmark. Share.',
  },
  'meditation-mindfulness': {
    type: 'Meditation & Mindfulness',
    keywords:
      'meditation, mindfulness, calm, breathe, wellness, relaxation, sleep, headspace',
    style: 'Neumorphism + Soft UI Evolution; also Aurora UI , Glassmorphism',
    colors:
      'Ultra-calm pastels (lavender/sage/sky) + breathing animation gradient',
    notes:
      'Breathing circle animation. Session duration picker. Ambient sound mixer. Streak/consistency tracking. Guided audio player. Sleep timer. Minimal chrome. Slow easing transitions only.',
  },
  'weather-app': {
    type: 'Weather App',
    keywords:
      'weather, forecast, temperature, climate, rain, sun, location, humidity',
    style:
      'Glassmorphism + Aurora UI; also Motion-Driven , Minimalism & Swiss Style',
    colors:
      'Atmospheric gradients (sky blue \u2192 sunset \u2192 storm grey) + temp scale',
    notes:
      'Location auto-detect. Hourly horizontal scroll + daily/weekly list. Animated weather icons. Air quality index. UV/wind/humidity chips. Radar map overlay. Widget-friendly layout.',
  },
  'diary-journal-app': {
    type: 'Diary & Journal App',
    keywords:
      'diary, journal, personal, daily, reflection, mood, gratitude, writing',
    style:
      'Soft UI Evolution + Minimalism & Swiss Style; also Neumorphism , Sketch Hand-Drawn (Mobile)',
    colors: 'Warm paper tones (cream/linen) + muted ink + mood-coded accents',
    notes:
      'Calendar month-view entry. Mood tag selector (emoji/color). Photo/voice attachment. Writing prompts. Privacy lock (FaceID/PIN). Search across entries. Export to PDF.',
  },
  'crm-client-management': {
    type: 'CRM & Client Management',
    keywords:
      'crm, client, customer, sales, pipeline, contact, lead, deal, hubspot',
    style:
      'Flat Design + Minimalism & Swiss Style; also Soft UI Evolution , Micro-interactions',
    colors: 'Professional blue + pipeline stage colors + closed-won green',
    notes:
      'Contact card list with avatar. Pipeline kanban board. Activity timeline. Quick-log (call/email/meeting). Deal amount + probability. Tag/segment filter. Mobile quick-actions.',
  },
  'inventory-stock-management': {
    type: 'Inventory & Stock Management',
    keywords:
      'inventory, stock, warehouse, product, barcode, supply, sku, management',
    style:
      'Flat Design + Minimalism & Swiss Style; also Dark Mode (OLED) , Accessible & Ethical',
    colors:
      'Functional neutral + status traffic-light (green/amber/red) + scanner accent',
    notes:
      'Product list/grid with thumbnails. Barcode/QR scanner. Stock level badges. Low-stock alert banner. Category/location filter. Batch edit. Reorder trigger. Audit log.',
  },
  'flashcard-study-tool': {
    type: 'Flashcard & Study Tool',
    keywords:
      'flashcard, quiz, study, spaced-repetition, anki, learn, memory, exam',
    style:
      'Claymorphism + Micro-interactions; also Vibrant & Block-based , Flat Design',
    colors: 'Playful primary + correct green + incorrect red + progress blue',
    notes:
      '3D card flip animation. Spaced repetition algorithm. Deck browser. Session progress bar. Streak tracking. Timed quiz mode. Share/import decks. Rich text + image cards.',
  },
  'booking-appointment-app': {
    type: 'Booking & Appointment App',
    keywords:
      'booking, appointment, schedule, calendar, reservation, slot, service',
    style:
      'Soft UI Evolution + Flat Design; also Minimalism & Swiss Style , Micro-interactions',
    colors: 'Trust blue + available green + booked grey + confirm accent',
    notes:
      'Calendar strip or month picker. Available time-slot grid. Service + staff selector. Confirmation summary. Reminder push. Reschedule/cancel flow. Two-sided (provider \u2194 client).',
  },
  'invoice-billing-tool': {
    type: 'Invoice & Billing Tool',
    keywords:
      'invoice, billing, payment, receipt, freelance, estimate, quote, accounting',
    style:
      'Minimalism & Swiss Style + Flat Design; also Swiss Modernism 2.0 , Accessible & Ethical',
    colors: 'Professional navy + paid green + overdue red + neutral grey',
    notes:
      'Invoice template with line items. Tax/discount calculation. Status badges (Draft/Sent/Paid/Overdue). PDF export + share. Payment link generation. Client address book. Recurring invoices.',
  },
  'grocery-shopping-list': {
    type: 'Grocery & Shopping List',
    keywords:
      'grocery, shopping, list, supermarket, checklist, pantry, meal-plan, buy',
    style:
      'Flat Design + Vibrant & Block-based; also Claymorphism , Micro-interactions',
    colors: 'Fresh green + food-category colors + checkmark accent',
    notes:
      'Category-grouped list. Tap-to-check interaction (with strikethrough). Quantity stepper. Share list with family. Store aisle sorting. Barcode scan to add. Frequently bought suggestions.',
  },
  'timer-pomodoro': {
    type: 'Timer & Pomodoro',
    keywords:
      'timer, pomodoro, countdown, stopwatch, focus, clock, productivity, interval',
    style:
      'Minimalism & Swiss Style + Neumorphism; also Dark Mode (OLED) , Micro-interactions',
    colors: 'High-contrast on dark + focus red/amber + break green',
    notes:
      'Large centered countdown digits. Circular progress ring. Session/break auto-switch. Session history log. Custom interval settings. Sound + haptic alerts. Focus stats chart.',
  },
  'parenting-baby-tracker': {
    type: 'Parenting & Baby Tracker',
    keywords:
      'baby, parenting, child, feeding, sleep, diaper, milestone, family, newborn',
    style:
      'Claymorphism + Soft UI Evolution; also Vibrant & Block-based , Accessible & Ethical',
    colors: 'Soft pastels (baby pink/sky blue/mint/peach) + warm accents',
    notes:
      'Feed/sleep/diaper quick-log buttons. Growth percentile chart. Milestone timeline with photos. Multiple child profiles. Partner invite + shared access. Pediatric reference. One-handed operation.',
  },
  'scanner-document-manager': {
    type: 'Scanner & Document Manager',
    keywords:
      'scanner, document, ocr, pdf, scan, camera, file, archive, digitize',
    style:
      'Minimalism & Swiss Style + Flat Design; also Dark Mode (OLED) , Accessible & Ethical',
    colors: 'Clean white + camera viewfinder accent + file-type color coding',
    notes:
      'Camera capture with auto-edge detection. Crop/rotate/enhance. OCR text extraction overlay. PDF multi-page creation. Folder tree organization. Cloud sync. Share/export. Batch scan mode.',
  },
  'calendar-scheduling-app': {
    type: 'Calendar & Scheduling App',
    keywords:
      'calendar, scheduling, planner, agenda, events, reminder, appointment, organize, date, sync',
    style:
      'Flat Design + Micro-interactions; also Minimalism & Swiss Style , Soft UI Evolution',
    colors: 'Clean blue + event category accent colors + success green',
    notes:
      'Event color coding. Week/month/day views. Recurring events. Conflict detection. Multi-calendar sync.',
  },
  'password-manager': {
    type: 'Password Manager',
    keywords:
      'password, security, vault, credentials, login, secure, encrypt, keychain, 2fa, biometric',
    style:
      'Minimalism & Swiss Style + Accessible & Ethical; also Dark Mode (OLED) , Swiss Modernism 2.0',
    colors: 'Trust blue + security green + dark neutral',
    notes:
      'Security-first. Zero-knowledge architecture. Biometric unlock. Breach alert dashboard. Password generator.',
  },
  'expense-splitter-bill-split': {
    type: 'Expense Splitter / Bill Split',
    keywords:
      'split, expense, bill, aa, share, friends, group, settle, debt, payment, owe',
    style:
      'Flat Design + Vibrant & Block-based; also Minimalism & Swiss Style , Micro-interactions',
    colors: 'Success green + alert red + neutral grey + avatar accent colors',
    notes:
      'Group expense tracking. Debt simplification algorithm. Payment reminders. Multi-currency. Receipt photo import.',
  },
  'voice-recorder-memo': {
    type: 'Voice Recorder & Memo',
    keywords:
      'voice, recorder, memo, audio, transcription, dictate, recording, microphone, note, otter',
    style:
      'Minimalism & Swiss Style + AI-Native UI; also Flat Design , Dark Mode (OLED)',
    colors: 'Clean white + recording red + waveform accent',
    notes:
      'Waveform display. Background recording. Auto-transcription (AI). Tag/organize. Cloud sync.',
  },
  'bookmark-read-later': {
    type: 'Bookmark & Read-Later',
    keywords:
      'bookmark, read-later, save, article, pocket, link, reading, archive, collection, raindrop',
    style:
      'Minimalism & Swiss Style + Flat Design; also Editorial Grid / Magazine , Swiss Modernism 2.0',
    colors: 'Paper warm white + ink neutral + minimal accent + tag colors',
    notes:
      'Fast save via share sheet. Article distraction-free view. Tags and collections. Offline sync. Reading progress.',
  },
  'translator-app': {
    type: 'Translator App',
    keywords:
      'translate, language, text, voice, ocr, dictionary, multilingual, real-time, detect, deepl',
    style:
      'Flat Design + AI-Native UI; also Minimalism & Swiss Style , Micro-interactions',
    colors: 'Global blue + neutral grey + language flag accent',
    notes:
      'Real-time camera translation (OCR). Voice input and output. Offline mode. Conversation mode. Phrasebook.',
  },
  'calculator-unit-converter': {
    type: 'Calculator & Unit Converter',
    keywords:
      'calculator, converter, unit, math, currency, measurement, scientific, formula, percentage',
    style:
      'Neumorphism + Minimalism & Swiss Style; also Flat Design , Dark Mode (OLED)',
    colors: 'Dark functional + orange operation keys + clear button hierarchy',
    notes:
      'Scientific mode toggle. Live currency rates. Calculation history. Widget support. Gesture input.',
  },
  'alarm-world-clock': {
    type: 'Alarm & World Clock',
    keywords:
      'alarm, clock, world, timezone, timer, wake, sleep, schedule, reminder, bedtime',
    style:
      'Dark Mode (OLED) + Minimalism & Swiss Style; also Neumorphism , Flat Design',
    colors: 'Deep dark + ambient glow accent + timezone gradient',
    notes:
      'Gentle wake (gradual volume). Timezone visualizer. Sleep tracking integration. Smart alarm skip. Bedtime mode.',
  },
  'file-manager-transfer': {
    type: 'File Manager & Transfer',
    keywords:
      'file, manager, transfer, folder, document, storage, cloud, share, organize, compress',
    style:
      'Flat Design + Minimalism & Swiss Style; also Accessible & Ethical , Dark Mode (OLED)',
    colors:
      'Functional neutral + file type color coding (PDF orange, doc blue, image purple)',
    notes:
      'Folder tree navigation. File type preview. Wireless P2P transfer. Cloud integration. Compress and extract.',
  },
  'email-client': {
    type: 'Email Client',
    keywords:
      'email, mail, inbox, compose, thread, newsletter, filter, reply, gmail, spark, superhuman',
    style:
      'Flat Design + Minimalism & Swiss Style; also Micro-interactions , Soft UI Evolution',
    colors: 'Clean white + brand primary + priority red + snooze amber',
    notes:
      'Unified inbox. Swipe actions (archive/delete/snooze). Priority sorting. Smart reply. Unsubscribe tool.',
  },
  'casual-puzzle-game': {
    type: 'Casual Puzzle Game',
    keywords:
      'puzzle, casual, match, brain, game, relaxing, level, tiles, logic, block, three',
    style:
      'Claymorphism + Vibrant & Block-based; also Micro-interactions , Motion-Driven',
    colors:
      'Cheerful pastels + progression gradient + reward gold + bright accent',
    notes:
      'Satisfying match/clear animations. Progressive difficulty. Daily challenges. No-skip tutorials. Offline play.',
  },
  'trivia-quiz-game': {
    type: 'Trivia & Quiz Game',
    keywords:
      'trivia, quiz, knowledge, question, answer, challenge, leaderboard, fact, brain, compete',
    style:
      'Vibrant & Block-based + Micro-interactions; also Claymorphism , Flat Design',
    colors: 'Energetic blue + correct green + incorrect red + leaderboard gold',
    notes:
      'Timer pressure UX. Category selection. Streak system. Real-time multiplayer. Daily quiz mode.',
  },
  'card-board-game': {
    type: 'Card & Board Game',
    keywords:
      'card, board, chess, checkers, poker, strategy, turn-based, multiplayer, classic, tabletop',
    style:
      '3D & Hyperrealism + Flat Design; also Motion-Driven , Dark Mode (OLED)',
    colors: 'Game-theme felt green + dark wood + card back patterns',
    notes:
      'Real-time or async multiplayer. Game state sync. Tutorial mode. Match history. ELO rating system.',
  },
  'idle-clicker-game': {
    type: 'Idle & Clicker Game',
    keywords:
      'idle, clicker, incremental, passive, cookie, adventure, progress, offline, collect, prestige',
    style:
      'Vibrant & Block-based + Motion-Driven; also Claymorphism , 3D & Hyperrealism',
    colors: 'Coin gold + upgrade blue + prestige purple + progress green',
    notes:
      'Offline progress calculation. Satisfying number animations. Upgrade tree clarity. Prestige system. Optional ads.',
  },
  'word-crossword-game': {
    type: 'Word & Crossword Game',
    keywords:
      'word, crossword, wordle, spelling, vocabulary, letters, grid, puzzle, dictionary, daily',
    style:
      'Minimalism & Swiss Style + Flat Design; also Swiss Modernism 2.0 , Micro-interactions',
    colors: 'Clean white + warm letter tiles + success green + shake red',
    notes:
      'Daily challenge with shareable results. Physical keyboard feel. Difficulty levels. Dictionary hints. Streak stats.',
  },
  'arcade-retro-game': {
    type: 'Arcade & Retro Game',
    keywords:
      'arcade, retro, 8bit, action, shoot, runner, tap, reflex, endless, pixel, classic, score',
    style:
      'Pixel Art + Retro-Futurism; also Vibrant & Block-based , Motion-Driven',
    colors: 'Neon on black + pixel palette + score gold + danger red',
    notes:
      'Instant play with no login. Game Center leaderboards. Haptic feedback on collision. Offline. Controller support.',
  },
  'photo-editor-filters': {
    type: 'Photo Editor & Filters',
    keywords:
      'photo, edit, filter, vsco, snapseed, enhance, crop, retouch, adjust, luts, preset, adjust',
    style:
      'Minimalism & Swiss Style + Dark Mode (OLED); also Motion-Driven , Flat Design',
    colors:
      'Dark editor background + vibrant filter preview strip + tool icon accent',
    notes:
      'Non-destructive editing. Filter preview carousel. Histogram. RAW support. Batch export. Social share direct.',
  },
  'short-video-editor': {
    type: 'Short Video Editor',
    keywords:
      'video, edit, capcut, inshot, clip, reel, tiktok, trim, effects, transitions, music, timeline',
    style:
      'Dark Mode (OLED) + Motion-Driven; also Vibrant & Block-based , Glassmorphism',
    colors:
      'Dark background + timeline track accent colors + effect preview vivid',
    notes:
      'Multi-track timeline. Licensed music library. Text overlays. Auto-captions. Export 9:16 / 16:9 / 1:1.',
  },
  'drawing-sketching-canvas': {
    type: 'Drawing & Sketching Canvas',
    keywords:
      'drawing, sketch, procreate, canvas, paint, illustration, digital, brush, layers, art, stylus',
    style:
      'Minimalism & Swiss Style + Dark Mode (OLED); also Anti-Polish / Raw Aesthetic , Motion-Driven',
    colors: 'Neutral canvas + full-spectrum color picker + tool panel dark',
    notes:
      'Pressure sensitivity. Infinite canvas (pan/zoom). Layer management. Undo history. Export PNG/PSD/SVG.',
  },
  'music-creation-beat-maker': {
    type: 'Music Creation & Beat Maker',
    keywords:
      'music, beat, daw, garageband, create, loop, sample, instrument, track, compose, record, midi',
    style:
      'Dark Mode (OLED) + Motion-Driven; also Cyberpunk UI , Glassmorphism',
    colors:
      'Dark studio background + track colors rainbow + waveform accent + BPM pulse',
    notes:
      'Touch piano and drum pad. Loop browser. MIDI support. Export MP3/WAV. Low-latency audio engine.',
  },
  'meme-sticker-maker': {
    type: 'Meme & Sticker Maker',
    keywords:
      'meme, sticker, maker, funny, caption, template, edit, share, viral, emoji, creator, reaction',
    style:
      'Vibrant & Block-based + Flat Design; also Gen Z Chaos / Maximalism , Claymorphism',
    colors:
      'Bold primary + comedic yellow + viral red + high saturation accent',
    notes:
      'Template library. Caption text overlay. Font variety. Reaction sticker packs. Share to all platforms. Fast creation.',
  },
  'ai-photo-avatar-generator': {
    type: 'AI Photo & Avatar Generator',
    keywords:
      'ai, photo, avatar, lensa, portrait, generate, selfie, style, filter, prisma, art',
    style:
      'AI-Native UI + Aurora UI; also Glassmorphism , Minimalism & Swiss Style',
    colors: 'AI purple + aurora gradients + before/after neutral',
    notes:
      'Style selection. Multiple output variations. Privacy policy prominent. Fast generation. Credits/subscription system.',
  },
  'link-in-bio-page-builder': {
    type: 'Link-in-Bio Page Builder',
    keywords:
      'bio, link, linktree, personal, page, creator, social, portfolio, profile, landing, custom',
    style:
      'Vibrant & Block-based + Bento Box Grid; also Minimalism & Swiss Style , Glassmorphism',
    colors: 'Brand-customizable + accent link color + clean white canvas',
    notes:
      'Drag-drop builder. Theme templates. Click analytics. Custom domain. Social icon integration. QR code export.',
  },
  'wardrobe-outfit-planner': {
    type: 'Wardrobe & Outfit Planner',
    keywords:
      'wardrobe, outfit, fashion, clothes, closet, style, wear, plan, capsule, ootd, lookbook',
    style:
      'Minimalism & Swiss Style + Motion-Driven; also Aurora UI , Soft UI Evolution',
    colors: 'Clean fashion neutral + full clothes color palette + accent',
    notes:
      'Photo catalog of clothes. AI outfit suggestions. Calendar integration. Capsule wardrobe. Season filtering.',
  },
  'plant-care-tracker': {
    type: 'Plant Care Tracker',
    keywords:
      'plant, care, water, garden, tracker, reminder, species, photo, grow, health, planta',
    style:
      'Organic Biophilic + Soft UI Evolution; also Claymorphism , Flat Design',
    colors: 'Nature greens + earth brown + sunny yellow reminder + water blue',
    notes:
      'Plant database with care guides. Watering reminders. Growth photo timeline. AI health diagnosis. Collection sharing.',
  },
  'book-reading-tracker': {
    type: 'Book & Reading Tracker',
    keywords:
      'book, reading, tracker, goodreads, library, shelf, progress, review, notes, goal, literature',
    style:
      'Swiss Modernism 2.0 + Minimalism & Swiss Style; also E-Ink / Paper , Soft UI Evolution',
    colors:
      'Warm paper white + ink brown + reading progress green + book cover colors',
    notes:
      'Barcode scan to add. Progress percentage. Annual reading goal. Notes and quotes. Friends activity. Genre stats.',
  },
  'couple-relationship-app': {
    type: 'Couple & Relationship App',
    keywords:
      'couple, relationship, partner, love, date, anniversary, memory, shared, intimate, between',
    style: 'Aurora UI + Soft UI Evolution; also Claymorphism , Glassmorphism',
    colors: 'Warm romantic pink/rose + soft gradient + memory photo tones',
    notes:
      'Shared timeline. Anniversary countdowns. Secret chat. Photo albums. Love language quiz. Date night ideas.',
  },
  'family-calendar-chores': {
    type: 'Family Calendar & Chores',
    keywords:
      'family, calendar, chores, tasks, household, shared, kids, schedule, cozi, organize, member',
    style:
      'Flat Design + Claymorphism; also Accessible & Ethical , Vibrant & Block-based',
    colors: 'Warm playful + member color coding + chore completion green',
    notes:
      'Member color coding. Chore assignment rotation. Recurring events. Shared shopping list. Allowance tracking.',
  },
  'mood-tracker': {
    type: 'Mood Tracker',
    keywords:
      'mood, emotion, feeling, mental, daily, journal, wellbeing, check-in, log, track, daylio',
    style:
      'Soft UI Evolution + Minimalism & Swiss Style; also Aurora UI , Neumorphism',
    colors:
      'Emotion gradient (blue sad to yellow happy) + pastel per mood + insight accent',
    notes:
      'One-tap daily check-in. Emotion wheel selector. Mood calendar heatmap. Pattern insights. Export and share.',
  },
  'gift-wishlist': {
    type: 'Gift & Wishlist',
    keywords:
      'gift, wishlist, present, birthday, occasion, registry, idea, shop, list, share, surprise',
    style:
      'Vibrant & Block-based + Soft UI Evolution; also Claymorphism , Flat Design',
    colors:
      'Celebration warm pink/gold/red + category colors + surprise accent',
    notes:
      'Add from any URL. Price range filter. Reserved-by-others system. Occasion calendar. Collaborative list. Surprise mode.',
  },
  'running-cycling-gps': {
    type: 'Running & Cycling GPS',
    keywords:
      'running, cycling, gps, strava, track, route, speed, distance, cadence, pace, workout, sport',
    style:
      'Dark Mode (OLED) + Vibrant & Block-based; also Motion-Driven , Glassmorphism',
    colors: 'Energetic orange + map accent + pace zones (green/yellow/red)',
    notes:
      'Live GPS tracking. Route map. Auto-pause detection. Segment leaderboards. Training zones. Social feed. Garmin sync.',
  },
  'yoga-stretching-guide': {
    type: 'Yoga & Stretching Guide',
    keywords:
      'yoga, stretch, flexibility, pose, asana, guided, session, calm, routine, wellness, down-dog',
    style:
      'Organic Biophilic + Soft UI Evolution; also Neumorphism , Minimalism & Swiss Style',
    colors:
      'Earth calming sage/terracotta/cream + breathing gradient + warm accent',
    notes:
      'Pose library with illustrations. Guided sessions with audio. Breathing exercises. Progress calendar. Beginner to advanced.',
  },
  'sleep-tracker': {
    type: 'Sleep Tracker',
    keywords:
      'sleep, tracker, alarm, cycle, quality, snore, analysis, rem, deep, smart, wake, insomnia',
    style:
      'Dark Mode (OLED) + Neumorphism; also Glassmorphism , Minimalism & Swiss Style',
    colors:
      'Deep midnight blue + stars/moon accent + sleep quality gradient (poor red to great green)',
    notes:
      'Sleep cycle detection. Smart alarm wakes at light sleep. Snore detection. Weekly trends. Apple Health integration.',
  },
  'calorie-nutrition-counter': {
    type: 'Calorie & Nutrition Counter',
    keywords:
      'calorie, nutrition, food, diet, macro, protein, carb, fat, log, fitness, myfitnesspal',
    style:
      'Flat Design + Vibrant & Block-based; also Minimalism & Swiss Style , Claymorphism',
    colors:
      'Healthy green + macro colors (protein blue, carb orange, fat yellow) + progress circle',
    notes:
      'Barcode scanner food log. Large database. Macro goals. Restaurant lookup. Recipe builder. AI photo food logging.',
  },
  'period-cycle-tracker': {
    type: 'Period & Cycle Tracker',
    keywords:
      'period, cycle, menstrual, fertility, ovulation, pms, log, women, health, flo, clue, hormone',
    style:
      'Soft UI Evolution + Aurora UI; also Accessible & Ethical , Claymorphism',
    colors: 'Rose/blush + lavender + fertility green + soft calendar tones',
    notes:
      'Cycle prediction. Symptom logging. Fertility window. Personalized insights. Privacy-first. Partner sharing option.',
  },
  'medication-pill-reminder': {
    type: 'Medication & Pill Reminder',
    keywords:
      'medication, pill, reminder, dose, schedule, prescription, drug, health, medisafe, refill',
    style:
      'Accessible & Ethical + Flat Design; also Minimalism & Swiss Style , Soft UI Evolution',
    colors: 'Medical trust blue + missed alert red + taken green + clean white',
    notes:
      'Multi-medication schedule. Caregiver sharing. Refill reminders. Drug interaction warnings. Large touch targets.',
  },
  'water-hydration-reminder': {
    type: 'Water & Hydration Reminder',
    keywords:
      'water, hydration, drink, reminder, daily, tracker, glasses, intake, health, cup, aqua',
    style:
      'Claymorphism + Vibrant & Block-based; also Flat Design , Micro-interactions',
    colors: 'Refreshing blue + water wave animation + goal progress accent',
    notes:
      'Tap to log quickly. Animated fill visualization. Custom reminders. Goal by weight/weather. Streak system. Widget.',
  },
  'fasting-intermittent-timer': {
    type: 'Fasting & Intermittent Timer',
    keywords:
      'fasting, intermittent, 16:8, timer, fast, eating, window, keto, diet, zero, weight, protocol',
    style:
      'Minimalism & Swiss Style + Dark Mode (OLED); also Neumorphism , Flat Design',
    colors: 'Fasting deep blue/purple + eating window green + timeline neutral',
    notes:
      'Protocol selector (16:8, 18:6, OMAD). Circular countdown timer. Fasting history log. Tips during fast. Electrolytes.',
  },
  'anonymous-community-confession': {
    type: 'Anonymous Community / Confession',
    keywords:
      'anonymous, community, confess, whisper, secret, vent, share, safe, private, social, yikyak',
    style:
      'Dark Mode (OLED) + Minimalism & Swiss Style; also Glassmorphism , Soft UI Evolution',
    colors:
      'Dark protective + subtle gradient + upvote green + empathy warm accent',
    notes:
      'Anonymous posting with moderation. Safety reporting. Reaction system. Trending topics. Mental health resources link.',
  },
  'local-events-discovery': {
    type: 'Local Events & Discovery',
    keywords:
      'local, events, discovery, meetup, nearby, social, city, activities, calendar, community, explore',
    style:
      'Vibrant & Block-based + Motion-Driven; also Glassmorphism , Flat Design',
    colors:
      'City vibrant + event category colors + map accent + date highlight',
    notes:
      'Location-based discovery. Category filters. RSVP flow. Map view. Friend attendance. Organizer tools. Reminders.',
  },
  'study-together-virtual-coworking': {
    type: 'Study Together / Virtual Coworking',
    keywords:
      'study, focus, cowork, pomodoro, virtual, together, session, accountability, live, stream, room',
    style:
      'Minimalism & Swiss Style + Soft UI Evolution; also Flat Design , Dark Mode (OLED)',
    colors:
      'Calm focus blue + session progress indicator + ambient warm neutrals',
    notes:
      'Live study rooms with video/avatar presence. Shared focus timer. Ambient music. Goals sharing. Streak accountability.',
  },
  'coding-challenge-practice': {
    type: 'Coding Challenge & Practice',
    keywords:
      'coding, leetcode, challenge, algorithm, practice, programming, competitive, skill, interview, problem',
    style:
      'Dark Mode (OLED) + Cyberpunk UI; also Minimalism & Swiss Style , Flat Design',
    colors:
      'Code editor dark + success green + difficulty gradient (easy green / medium amber / hard red)',
    notes:
      'Code editor with syntax highlight. Multiple languages. Hint system. Solution explanation. Company tags. Contest mode.',
  },
  'kids-learning-abc-math': {
    type: 'Kids Learning (ABC & Math)',
    keywords:
      'kids, children, learning, abc, math, phonics, numbers, education, games, preschool, early',
    style:
      'Claymorphism + Vibrant & Block-based; also Micro-interactions , Flat Design',
    colors:
      'Bright primary + child-safe pastels + reward gold + interactive accent',
    notes:
      'Age-appropriate UI for 2-8. No ads. No dark patterns. Curriculum aligned. Parent progress reports. Reward system.',
  },
  'music-instrument-learning': {
    type: 'Music Instrument Learning',
    keywords:
      'music, instrument, piano, guitar, learn, lesson, tutorial, notes, play, chord, practice, simply',
    style:
      'Vibrant & Block-based + Motion-Driven; also Dark Mode (OLED) , Soft UI Evolution',
    colors:
      'Musical warm deep red/brown + note color system + skill progress bar',
    notes:
      'Interactive instrument on-screen. Sheet music display. Song library. Slow-tempo practice. Recording and playback. Teacher mode.',
  },
  'parking-finder': {
    type: 'Parking Finder',
    keywords:
      'parking, spot, finder, map, pay, meter, garage, location, car, reserve, spothero',
    style:
      'Minimalism & Swiss Style + Glassmorphism; also Flat Design , Micro-interactions',
    colors: 'Trust blue + available green + occupied red + map neutral',
    notes:
      'Real-time availability. In-app navigation. Payment integration. Parking timer alert. Favorite spots. Street vs garage.',
  },
  'public-transit-guide': {
    type: 'Public Transit Guide',
    keywords:
      'transit, bus, metro, subway, train, route, schedule, map, city, commute, trip, citymapper',
    style:
      'Flat Design + Accessible & Ethical; also Minimalism & Swiss Style , Motion-Driven',
    colors:
      'Transit brand line colors + real-time indicator green/red + map neutral',
    notes:
      'Real-time arrivals. Offline maps. Disruption alerts. Multi-modal routing. Fare calculation. Accessibility features.',
  },
  'road-trip-planner': {
    type: 'Road Trip Planner',
    keywords:
      'road, trip, drive, route, planner, travel, stop, map, adventure, scenic, car, wanderlog',
    style:
      'Aurora UI + Organic Biophilic; also Motion-Driven , Vibrant & Block-based',
    colors:
      'Adventure warm sunset orange + map teal + stop markers + road neutral',
    notes:
      'Route planning with stops. Point-of-interest discovery. Gas/food/hotel along route. Offline maps. Trip sharing.',
  },
  'vpn-privacy-tool': {
    type: 'VPN & Privacy Tool',
    keywords:
      'vpn, privacy, secure, anonymous, encrypt, proxy, ip, protect, shield, network, nordvpn',
    style:
      'Minimalism & Swiss Style + Dark Mode (OLED); also Cyberpunk UI , Accessible & Ethical',
    colors:
      'Dark shield blue + connected green + disconnected red + trust accent',
    notes:
      'One-tap connect. Server selection by country. No-log policy prominent. Speed indicator. Kill switch. Protocol choice.',
  },
  'emergency-sos-safety': {
    type: 'Emergency SOS & Safety',
    keywords:
      'emergency, sos, safety, alert, location, help, danger, crisis, first-aid, guard, bsafe',
    style:
      'Accessible & Ethical + Flat Design; also Dark Mode (OLED) , Minimalism & Swiss Style',
    colors: 'Alert red + safety blue + location green + high contrast critical',
    notes:
      'One-tap SOS. Emergency contacts auto-notify. Live location sharing. Fake call feature. Safe walk mode. Local emergency numbers.',
  },
  'wallpaper-theme-app': {
    type: 'Wallpaper & Theme App',
    keywords:
      'wallpaper, theme, background, customize, aesthetic, home-screen, lock-screen, widget, design, zedge',
    style:
      'Vibrant & Block-based + Aurora UI; also Glassmorphism , Motion-Driven',
    colors: 'Content-driven + trending aesthetic palettes + download accent',
    notes:
      'Category browsing. Preview on device. Daily wallpaper auto-set. Widget matching. Creator uploads. Resolution auto-fit.',
  },
  'white-noise-ambient-sound': {
    type: 'White Noise & Ambient Sound',
    keywords:
      'white noise, ambient, sound, sleep, focus, rain, nature, relax, concentration, background, noisli',
    style:
      'Minimalism & Swiss Style + Dark Mode (OLED); also Neumorphism , Organic Biophilic',
    colors:
      'Calming dark + ambient texture visual + subtle sound wave + sleep blue',
    notes:
      'Sound mixer with multiple simultaneous layers. Sleep timer with fade. Custom soundscapes. Offline. Background audio.',
  },
  'home-decoration-interior-design': {
    type: 'Home Decoration & Interior Design',
    keywords:
      'home, interior, decor, design, furniture, room, renovation, ar, plan, inspire, 3d, houzz',
    style:
      'Minimalism & Swiss Style + 3D Product Preview; also Organic Biophilic , Aurora UI',
    colors: 'Neutral interior palette + material texture accent + AR blue',
    notes:
      'AR room visualization. Style quiz. Product catalog with purchase links. 3D room planner. Mood board. Before/after.',
  },
  'academic-journal-scholarly-publishing': {
    type: 'Academic Journal / Scholarly Publishing',
    keywords:
      'academic, journal, paper, research, peer-review, open-access, scholarly, publication, citation, manuscript, issn, doi',
    style:
      'Swiss Modernism 2.0 + Minimalism & Swiss Style; also Editorial Grid / Magazine , Accessible & Ethical',
    colors: 'Trust navy + White + Citation blue + Serif accents',
    notes:
      'Prioritize readability (serif body text). Clear article hierarchy. Abstract/DOI prominence. WCAG AAA. Minimal visual noise. Trust signals: ISSN, indexing badges.',
  },
  'api-developer-portal': {
    type: 'API Developer Portal',
    keywords:
      'api, developer, documentation, sdk, endpoint, integration, rest, graphql, webhook, reference, getting-started, auth',
    style:
      'Accessible & Ethical + Minimalism & Swiss Style; also Glassmorphism , Dark Mode (OLED)',
    colors: 'Dark code theme + Brand accent + Syntax colors',
    notes:
      'Endpoint discoverability. Copy-paste code samples. Auth flow clarity. Version switching. Interactive playground. Rate limit visibility.',
  },
  'forum-discussion-board': {
    type: 'Forum / Discussion Board',
    keywords:
      'forum, discussion, thread, post, reply, community, comment, moderation, subreddit, stackexchange, topic',
    style:
      'Dark Mode (OLED) + Minimalism & Swiss Style; also Flat Design , Vibrant & Block-based',
    colors:
      'Dark neutral + topic accent colors + unread indicator + reputation badge',
    notes:
      'Thread list with pagination. Rich text editor. Quote/mention system. Upvote/downvote. User badges. Moderation tools.',
  },
  'directory-listing-site': {
    type: 'Directory / Listing Site',
    keywords:
      'directory, listing, classifieds, catalogue, business-directory, yellow-pages, venue, find, search, filter, map',
    style:
      'Flat Design + Vibrant & Block-based; also Minimalism & Swiss Style , Bento Box Grid',
    colors: 'Neutral bg + category color chips + map accent + verified badge',
    notes:
      'Category tree. Multi-filter sidebar. Map/list toggle. Verified badges. Reviews. Claim listing flow.',
  },
  'status-page-incident-management': {
    type: 'Status Page / Incident Management',
    keywords:
      'status, incident, outage, uptime, downtime, statuspage, monitoring, sla, maintenance, sev1, postmortem',
    style:
      'Data-Dense Dashboard + Real-Time Monitoring; also Minimalism & Swiss Style , Dark Mode (OLED)',
    colors: 'Status green + incident red + maintenance amber + neutral dark',
    notes:
      'Service status matrix. Incident timeline. Severity badges. Maintenance schedule. SLA uptime history. Email/SMS subscribe.',
  },
  'wiki-encyclopedia': {
    type: 'Wiki / Encyclopedia',
    keywords:
      'wiki, encyclopedia, knowledge, article, reference, wikipedia, documentation, collaborative, edit, version, citation',
    style:
      'Minimalism & Swiss Style + Flat Design; also Swiss Modernism 2.0 , Accessible & Ethical',
    colors: 'Clean white + link blue + heading hierarchy + citation grey',
    notes:
      'Full-text search bar. Table of contents sidebar. Edit history. Inter-page linking. Mobile responsive. Print-friendly.',
  },
  'auction-platform': {
    type: 'Auction Platform',
    keywords:
      'auction, bid, hammer, lot, live-auction, bidding-war, estate-sale, proxibid, gavel, lot-number, reserve-price',
    style:
      'Dark Mode (OLED) + Motion-Driven; also Vibrant & Block-based , Real-Time Monitoring',
    colors: 'Dark bg + bid green + outbid red + countdown amber',
    notes:
      'Real-time bid updates. Countdown timer urgency. Auto-bid ceiling. Outbid notifications. Bid history. Reserve price indicator.',
  },
  'changelog-release-notes': {
    type: 'Changelog / Release Notes',
    keywords:
      'changelog, release-notes, version-history, whats-new, product-updates, semver, patch-notes, release-tracker',
    style:
      'Minimalism & Swiss Style + Flat Design; also Swiss Modernism 2.0 , Editorial Grid / Magazine',
    colors:
      'Neutral bg + version badge colors (feat=green, fix=blue, breaking=red) + date grey',
    notes:
      'Chronological release feed. Semver badges. Breaking change warnings. Copy-paste install commands. Subscribe to feed. Search by version.',
  },
  'citizen-science-platform': {
    type: 'Citizen Science Platform',
    keywords:
      'citizen-science, zooniverse, crowdsourced-research, volunteer-science, public-participation, distributed-research, citizen-researcher',
    style:
      'Organic Biophilic + Vibrant & Block-based; also Claymorphism , Motion-Driven',
    colors:
      'Earth green + discovery orange + volunteer badge blue + data neutral',
    notes:
      'Project cards with impact metrics. Contribution tracker. Beginner-friendly onboarding. Data quality feedback loop. Leaderboards. Community forums.',
  },
  'classifieds-buy-sell': {
    type: 'Classifieds / Buy-Sell',
    keywords:
      'classifieds, buy-sell, craigslist, secondhand, marketplace-listing, for-sale, trade, flea-market, thrift, resell',
    style:
      'Flat Design + Vibrant & Block-based; also Minimalism & Swiss Style , Bento Box Grid',
    colors: 'Neutral bg + price green + category chips + verified seller badge',
    notes:
      'Category tree. Photo-first listing cards. Price negotiation. Location radius filter. Saved searches. Seller reputation. Flag/report.',
  },
  'conference-symposium-landing-page': {
    type: 'Conference / Symposium Landing Page',
    keywords:
      'conference, symposium, summit, cfp, call-for-papers, speaker-lineup, registration, venue, proceedings, keynote, track',
    style:
      'Swiss Modernism 2.0 + Minimalism & Swiss Style; also Editorial Grid / Magazine , Accessible & Ethical',
    colors: 'Academic navy + track color chips + gold keynote + neutral white',
    notes:
      'Speaker grid. Multi-track agenda. CFP deadline countdown. Venue map. Sponsor tiers. Early-bird pricing. Proceedings download.',
  },
  'crowdfunding-platform': {
    type: 'Crowdfunding Platform',
    keywords:
      'crowdfunding, kickstarter, indiegogo, campaign, backer, pledge, funding-goal, stretch-goal, reward-tier, all-or-nothing',
    style:
      'Vibrant & Block-based + Motion-Driven; also Claymorphism , Editorial Grid / Magazine',
    colors:
      'Brand primary + funding progress green + urgency amber + reward tier colors',
    notes:
      'Funding progress bar with % goal. Reward tier selector. Backer count. Countdown timer. Updates feed. Creator profile. Risk/disclaimer section.',
  },
  'digital-signage-kiosk': {
    type: 'Digital Signage / Kiosk',
    keywords:
      'digital-signage, kiosk, interactive-display, touchscreen, wayfinding, lobby-display, menu-board, point-of-sale-display',
    style:
      'Minimalism & Swiss Style + Dark Mode (OLED); also Flat Design , Motion-Driven',
    colors: 'High contrast + brand accent + touch target emphasis (56px min)',
    notes:
      'Full-screen single-purpose layout. Touch targets \u226556px. Auto-rotate content. Offline fallback. Brightness-aware color palette. No scroll.',
  },
  'e-signature-document-workflow': {
    type: 'E-signature / Document Workflow',
    keywords:
      'esignature, e-sign, docusign, digital-signature, document-workflow, approval-chain, contract-signing, signing-ceremony',
    style:
      'Accessible & Ethical + Minimalism & Swiss Style; also Accessible & Ethical , Flat Design',
    colors: 'Trust navy + signature green + pending amber + neutral grey',
    notes:
      'Document preview with annotation. Signature placement UI. Multi-signer workflow. Audit trail. Compliance badges. Mobile signing. Expiry reminders.',
  },
  'feature-flag-config-management': {
    type: 'Feature Flag / Config Management',
    keywords:
      'feature-flag, config, launchdarkly, feature-toggle, experiment, rollout, kill-switch, a-b-test-config, percentage-rollout',
    style:
      'Dark Mode (OLED) + Data-Dense Dashboard; also Minimalism & Swiss Style , Accessible & Ethical',
    colors:
      'Dark bg + enabled green + disabled grey + experimental amber + kill-switch red',
    notes:
      'Feature list with on/off toggles. Percentage rollout slider. Environment selector (prod/staging). User targeting rules. Kill switch. Audit log.',
  },
  'government-portal-civic-services': {
    type: 'Government Portal / Civic Services',
    keywords:
      'government-portal, civic-services, city-hall, permit-application, tax-payment, voter-registration, public-records, municipal-online',
    style:
      'Accessible & Ethical + Inclusive Design; also Flat Design , Inclusive Design',
    colors:
      'Professional blue + accessibility high contrast + service category colors',
    notes:
      'Multilingual toggle. Service A-Z index. Form wizard with save-progress. Document upload. Appointment booking. Status tracker. WCAG AAA. Plain language.',
  },
  'grant-funding-portal': {
    type: 'Grant / Funding Portal',
    keywords:
      'grant, funding, rfp, proposal, research-grant, foundation, fellowship, award, application-portal, funding-opportunity',
    style:
      'Accessible & Ethical + Minimalism & Swiss Style; also Accessible & Ethical , Swiss Modernism 2.0',
    colors: 'Institution navy + funding green + deadline red + neutral white',
    notes:
      'Funding opportunity cards. Eligibility checker. Deadline countdown. Application form wizard. Document checklist. Review status tracker. Award announcement feed.',
  },
  'lms-learning-management-system': {
    type: 'LMS (Learning Management System)',
    keywords:
      'lms, course-management, learning-management, canvas, moodle, blackboard, enrollment, gradebook, syllabus, assignment-submit',
    style:
      'Flat Design + Accessible & Ethical; also Minimalism & Swiss Style , Vibrant & Block-based',
    colors: 'Calm blue + course category colors + grade green + alert red',
    notes:
      'Dashboard with enrolled courses. Assignment deadlines. Gradebook view. Discussion forums. File upload. Calendar integration. Mobile offline sync.',
  },
  'no-code-low-code-builder': {
    type: 'No-code / Low-code Builder',
    keywords:
      'no-code, low-code, builder, bubble, webflow, drag-drop, visual-builder, app-builder, workflow-builder, logic-blocks',
    style:
      'Vibrant & Block-based + Bento Box Grid; also Motion-Driven , Glassmorphism',
    colors:
      'Brand primary + component palette colors + canvas neutral + connect blue',
    notes:
      'Drag-drop canvas. Component library sidebar. Logic flow visual editor. Preview pane. Template gallery. Publish button. Version history.',
  },
  'open-source-project-landing': {
    type: 'Open Source Project Landing',
    keywords:
      'open-source, github-project, oss, contributor, star, fork, pull-request, maintainer, sponsoring, readme, repository',
    style:
      'Dark Mode (OLED) + Minimalism & Swiss Style; also Accessible & Ethical , Flat Design',
    colors:
      'Dark bg + language color bar + star gold + fork silver + sponsor purple',
    notes:
      'Star/fork count badges. Install command (copy-paste). Language breakdown bar. Top contributors grid. Sponsor CTA. Documentation link. Issue/pr status.',
  },
  'patient-portal-health-records': {
    type: 'Patient Portal / Health Records',
    keywords:
      'patient-portal, health-records, ehr, emr, mychart, lab-results, prescription-refill, medical-history, test-results, care-team',
    style:
      'Minimalism & Swiss Style + Accessible & Ethical; also Minimalism & Swiss Style , Flat Design',
    colors:
      'Clinical blue + health green + alert red + calm white + accessible contrast',
    notes:
      'Labs and results timeline. Medication list with refill. Appointment scheduling. Message care team. Immunization records. Allergy alerts. Family access proxy.',
  },
  'patent-ip-database': {
    type: 'Patent / IP Database',
    keywords:
      'patent, intellectual-property, trademark, prior-art, uspto, wipo, invention, ip-portfolio, patent-search, claims',
    style:
      'Swiss Modernism 2.0 + Minimalism & Swiss Style; also Editorial Grid / Magazine , Data-Dense Dashboard',
    colors:
      'Formal neutral + patent type chips + status badges (granted/pending/rejected)',
    notes:
      'Full-text patent search. Classification tree. Citation graph. Prior art comparison. Patent family view. PDF download. Legal status tracker.',
  },
  'q-a-community-platform': {
    type: 'Q&A Community Platform',
    keywords:
      'qa, stack-overflow, question-answer, knowledge-sharing, community-qa, expert-answer, upvote, accepted-answer, reputation',
    style:
      'Minimalism & Swiss Style + Flat Design; also Dark Mode (OLED) , Accessible & Ethical',
    colors:
      'Clean white + upvote orange + accepted green + reputation gold + tag colors',
    notes:
      'Question list with vote count. Rich code blocks. Tag filter. Reputation system. Accepted answer highlight. Comment threads. Bookmark/save.',
  },
  'research-lab-university-department': {
    type: 'Research Lab / University Department',
    keywords:
      'research-lab, university-department, academic-lab, principal-investigator, lab-members, publications, research-group, pi-page',
    style:
      'Swiss Modernism 2.0 + Minimalism & Swiss Style; also Editorial Grid / Magazine , Accessible & Ethical',
    colors:
      'Institutional navy + white + research area accent colors + serif headings',
    notes:
      'PI bio and research focus. Current members grid. Publication list with links. Open positions. Lab facilities photos. Funding acknowledgments.',
  },
  'resume-cv-builder': {
    type: 'Resume / CV Builder',
    keywords:
      'resume, cv, builder, job-search, curriculum-vitae, portfolio-resume, cover-letter, career-builder, ats-friendly',
    style:
      'Minimalism & Swiss Style + Flat Design; also Swiss Modernism 2.0 , Accessible & Ethical',
    colors: 'Professional navy + section accent + success green + clean white',
    notes:
      'Template picker. Section-by-section editor. Real-time preview. ATS score indicator. PDF export. Cover letter generator. Import from LinkedIn.',
  },
  'review-platform': {
    type: 'Review Platform',
    keywords:
      'review, rating, yelp, trustpilot, testimonial, customer-review, star-rating, verified-purchase, pros-cons',
    style:
      'Flat Design + Vibrant & Block-based; also Accessible & Ethical , Minimalism & Swiss Style',
    colors:
      'Brand primary + star gold + positive green + negative red + verified blue',
    notes:
      'Star rating summary with distribution. Verified purchase badge. Photo/video reviews. Helpful/upvote. Filter by rating. Response from business. Sort by recency.',
  },
  'rpa-automation-dashboard': {
    type: 'RPA / Automation Dashboard',
    keywords:
      'rpa, robotic-process-automation, uipath, automation-anywhere, bot-orchestrator, process-discovery, attended-bot, unattended-bot',
    style:
      'Dark Mode (OLED) + Data-Dense Dashboard; also Minimalism & Swiss Style , Accessible & Ethical',
    colors:
      'Dark bg + running green + failed red + queued amber + completed blue',
    notes:
      'Bot status grid (running/idle/failed). Queue depth. Process flow visualization. Exception handling alert. ROI metrics. Bot scheduling calendar. Audit trail.',
  },
  'survey-form-builder': {
    type: 'Survey / Form Builder',
    keywords:
      'survey, form-builder, questionnaire, typeform, survey-monkey, poll, feedback-form, multi-step-form, nps-survey, logic-jump',
    style:
      'Minimalism & Swiss Style + Micro-interactions; also Claymorphism , Flat Design',
    colors: 'Clean white + question accent + progress green + submit blue',
    notes:
      'Drag-drop form builder. Question type library. Conditional logic visualizer. Theme picker. Response dashboard with charts. Export CSV. Share link/QR/embed.',
  },
  'telemedicine-platform': {
    type: 'Telemedicine Platform',
    keywords:
      'telemedicine, telehealth, virtual-visit, remote-consultation, video-doctor, remote-patient-monitoring, telehealth-app',
    style:
      'Neumorphism + Accessible & Ethical; also Minimalism & Swiss Style , Soft UI Evolution',
    colors: 'Calm medical blue + video green + waiting amber + trust white',
    notes:
      'Video call UI with screen share. Appointment queue. Symptom intake form. Prescription e-delivery. Waiting room with ETA. Post-visit summary. Insurance verification.',
  },
  'testimonial-social-proof-widget': {
    type: 'Testimonial & Social Proof Widget',
    keywords:
      'testimonial, social-proof, wall-of-love, customer-quote, case-study, review-widget, trust-signal, user-story',
    style:
      'Vibrant & Block-based + Flat Design; also Motion-Driven , Minimalism & Swiss Style',
    colors: 'Brand primary + quote accent + star gold + verified blue',
    notes:
      'Testimonial cards with photo. Star ratings. Video testimonials. Case study summaries. Filter by industry/product. Embeddable widget code. Auto-rotate carousel.',
  },
  'ticketing-box-office': {
    type: 'Ticketing / Box Office',
    keywords:
      'ticketing, box-office, eventbrite, ticket-sales, seat-selection, will-call, qr-ticket, venue-capacity, will-call-pickup',
    style:
      'Vibrant & Block-based + Motion-Driven; also Dark Mode (OLED) , Glassmorphism',
    colors:
      'Event theme colors + available green + sold-out red + seat map neutral',
    notes:
      'Event cards with date/venue. Interactive seat map. Cart with countdown. QR code ticket. Will-call pickup. Group discounts. Refund policy.',
  },
}
