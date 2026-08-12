export type SupportedLocale = "zh-TW" | "en";

type LocalizedName = {
  "zh-TW": string;
  en?: string;
};

export type TravelStyle = "lazy" | "nature" | "food" | "city" | "shopping";

export const localize = (name: LocalizedName, locale: SupportedLocale = "zh-TW") =>
  name[locale] || name["zh-TW"];

export const destinationContinents = [
  { id: "asia", name: { "zh-TW": "亞洲", en: "Asia" } },
  { id: "europe", name: { "zh-TW": "歐洲", en: "Europe" } },
  { id: "north_america", name: { "zh-TW": "北美洲", en: "North America" } },
  { id: "south_america", name: { "zh-TW": "南美洲", en: "South America" } },
  { id: "oceania", name: { "zh-TW": "大洋洲", en: "Oceania" } },
  { id: "africa", name: { "zh-TW": "非洲", en: "Africa" } },
] as const;

export const destinationRegions = [
  { id: "east_asia", continent: "asia", name: { "zh-TW": "東北亞", en: "East Asia" } },
  { id: "greater_china", continent: "asia", name: { "zh-TW": "大中華地區", en: "Greater China" } },
  { id: "southeast_asia", continent: "asia", name: { "zh-TW": "東南亞", en: "Southeast Asia" } },
  { id: "south_asia", continent: "asia", name: { "zh-TW": "南亞", en: "South Asia" } },
  { id: "central_asia", continent: "asia", name: { "zh-TW": "中亞", en: "Central Asia" } },
  { id: "caucasus", continent: "asia", name: { "zh-TW": "高加索", en: "Caucasus" } },
  { id: "middle_east", continent: "asia", name: { "zh-TW": "西亞・中東", en: "Middle East" } },
  { id: "northern_europe", continent: "europe", name: { "zh-TW": "北歐", en: "Northern Europe" } },
  { id: "western_europe", continent: "europe", name: { "zh-TW": "西歐", en: "Western Europe" } },
  { id: "central_europe", continent: "europe", name: { "zh-TW": "中歐", en: "Central Europe" } },
  { id: "southern_europe", continent: "europe", name: { "zh-TW": "南歐", en: "Southern Europe" } },
  { id: "eastern_europe", continent: "europe", name: { "zh-TW": "東歐", en: "Eastern Europe" } },
  { id: "baltics", continent: "europe", name: { "zh-TW": "波羅的海三國", en: "Baltics" } },
  { id: "balkans", continent: "europe", name: { "zh-TW": "巴爾幹半島", en: "Balkans" } },
  { id: "canada", continent: "north_america", name: { "zh-TW": "加拿大", en: "Canada" } },
  { id: "united_states", continent: "north_america", name: { "zh-TW": "美國・夏威夷", en: "United States & Hawaii" } },
  { id: "mexico_caribbean", continent: "north_america", name: { "zh-TW": "墨西哥・加勒比海", en: "Mexico & Caribbean" } },
  { id: "central_america", continent: "north_america", name: { "zh-TW": "中美洲", en: "Central America" } },
  { id: "andes", continent: "south_america", name: { "zh-TW": "安地斯地區", en: "Andean Region" } },
  { id: "northern_south_america", continent: "south_america", name: { "zh-TW": "南美洲北部", en: "Northern South America" } },
  { id: "brazil", continent: "south_america", name: { "zh-TW": "巴西", en: "Brazil" } },
  { id: "southern_cone", continent: "south_america", name: { "zh-TW": "南錐地區", en: "Southern Cone" } },
  { id: "australia", continent: "oceania", name: { "zh-TW": "澳洲", en: "Australia" } },
  { id: "new_zealand", continent: "oceania", name: { "zh-TW": "紐西蘭", en: "New Zealand" } },
  { id: "pacific_islands", continent: "oceania", name: { "zh-TW": "太平洋島嶼", en: "Pacific Islands" } },
  { id: "north_africa", continent: "africa", name: { "zh-TW": "北非", en: "North Africa" } },
  { id: "east_africa", continent: "africa", name: { "zh-TW": "東非", en: "East Africa" } },
  { id: "west_africa", continent: "africa", name: { "zh-TW": "西非", en: "West Africa" } },
  { id: "central_africa", continent: "africa", name: { "zh-TW": "中非", en: "Central Africa" } },
  { id: "southern_africa", continent: "africa", name: { "zh-TW": "南部非洲", en: "Southern Africa" } },
  { id: "indian_ocean_africa", continent: "africa", name: { "zh-TW": "印度洋島嶼", en: "Indian Ocean Islands" } },
] as const;

export const destinationCountries = [
  ["JP", "east_asia", "日本", "Japan", "🇯🇵"], ["KR", "east_asia", "韓國", "South Korea", "🇰🇷"],
  ["CN", "greater_china", "中國", "China", "🇨🇳"], ["HK", "greater_china", "香港", "Hong Kong", "🇭🇰"], ["MO", "greater_china", "澳門", "Macau", "🇲🇴"],
  ["TH", "southeast_asia", "泰國", "Thailand", "🇹🇭"], ["VN", "southeast_asia", "越南", "Vietnam", "🇻🇳"], ["SG", "southeast_asia", "新加坡", "Singapore", "🇸🇬"], ["MY", "southeast_asia", "馬來西亞", "Malaysia", "🇲🇾"], ["PH", "southeast_asia", "菲律賓", "Philippines", "🇵🇭"], ["ID", "southeast_asia", "印尼", "Indonesia", "🇮🇩"], ["KH", "southeast_asia", "柬埔寨", "Cambodia", "🇰🇭"],
  ["LA", "southeast_asia", "寮國", "Laos", "🇱🇦"], ["MM", "southeast_asia", "緬甸", "Myanmar", "🇲🇲"], ["BN", "southeast_asia", "汶萊", "Brunei", "🇧🇳"],
  ["IN", "south_asia", "印度", "India", "🇮🇳"], ["NP", "south_asia", "尼泊爾", "Nepal", "🇳🇵"], ["LK", "south_asia", "斯里蘭卡", "Sri Lanka", "🇱🇰"], ["MV", "south_asia", "馬爾地夫", "Maldives", "🇲🇻"], ["BD", "south_asia", "孟加拉", "Bangladesh", "🇧🇩"], ["BT", "south_asia", "不丹", "Bhutan", "🇧🇹"], ["PK", "south_asia", "巴基斯坦", "Pakistan", "🇵🇰"],
  ["KZ", "central_asia", "哈薩克", "Kazakhstan", "🇰🇿"], ["UZ", "central_asia", "烏茲別克", "Uzbekistan", "🇺🇿"],
  ["MN", "east_asia", "蒙古", "Mongolia", "🇲🇳"], ["GE", "caucasus", "喬治亞", "Georgia", "🇬🇪"], ["AM", "caucasus", "亞美尼亞", "Armenia", "🇦🇲"], ["AZ", "caucasus", "亞塞拜然", "Azerbaijan", "🇦🇿"],
  ["AE", "middle_east", "阿拉伯聯合大公國", "United Arab Emirates", "🇦🇪"], ["QA", "middle_east", "卡達", "Qatar", "🇶🇦"], ["TR", "middle_east", "土耳其", "Türkiye", "🇹🇷"], ["SA", "middle_east", "沙烏地阿拉伯", "Saudi Arabia", "🇸🇦"], ["JO", "middle_east", "約旦", "Jordan", "🇯🇴"], ["OM", "middle_east", "阿曼", "Oman", "🇴🇲"],
  ["GB", "western_europe", "英國", "United Kingdom", "🇬🇧"], ["IE", "western_europe", "愛爾蘭", "Ireland", "🇮🇪"], ["FR", "western_europe", "法國", "France", "🇫🇷"], ["NL", "western_europe", "荷蘭", "Netherlands", "🇳🇱"], ["BE", "western_europe", "比利時", "Belgium", "🇧🇪"],
  ["DE", "central_europe", "德國", "Germany", "🇩🇪"], ["CH", "central_europe", "瑞士", "Switzerland", "🇨🇭"], ["AT", "central_europe", "奧地利", "Austria", "🇦🇹"], ["CZ", "central_europe", "捷克", "Czechia", "🇨🇿"], ["HU", "central_europe", "匈牙利", "Hungary", "🇭🇺"], ["PL", "central_europe", "波蘭", "Poland", "🇵🇱"],
  ["IT", "southern_europe", "義大利", "Italy", "🇮🇹"], ["ES", "southern_europe", "西班牙", "Spain", "🇪🇸"], ["PT", "southern_europe", "葡萄牙", "Portugal", "🇵🇹"], ["GR", "southern_europe", "希臘", "Greece", "🇬🇷"], ["HR", "southern_europe", "克羅埃西亞", "Croatia", "🇭🇷"],
  ["DK", "northern_europe", "丹麥", "Denmark", "🇩🇰"], ["SE", "northern_europe", "瑞典", "Sweden", "🇸🇪"], ["NO", "northern_europe", "挪威", "Norway", "🇳🇴"], ["FI", "northern_europe", "芬蘭", "Finland", "🇫🇮"], ["IS", "northern_europe", "冰島", "Iceland", "🇮🇸"],
  ["RO", "eastern_europe", "羅馬尼亞", "Romania", "🇷🇴"], ["BG", "eastern_europe", "保加利亞", "Bulgaria", "🇧🇬"],
  ["EE", "baltics", "愛沙尼亞", "Estonia", "🇪🇪"], ["LV", "baltics", "拉脫維亞", "Latvia", "🇱🇻"], ["LT", "baltics", "立陶宛", "Lithuania", "🇱🇹"],
  ["RS", "balkans", "塞爾維亞", "Serbia", "🇷🇸"], ["SI", "balkans", "斯洛維尼亞", "Slovenia", "🇸🇮"], ["SK", "central_europe", "斯洛伐克", "Slovakia", "🇸🇰"], ["AL", "balkans", "阿爾巴尼亞", "Albania", "🇦🇱"], ["MT", "southern_europe", "馬爾他", "Malta", "🇲🇹"], ["CY", "southern_europe", "賽普勒斯", "Cyprus", "🇨🇾"],
  ["CA", "canada", "加拿大", "Canada", "🇨🇦"], ["US", "united_states", "美國", "United States", "🇺🇸"],
  ["MX", "mexico_caribbean", "墨西哥", "Mexico", "🇲🇽"], ["CU", "mexico_caribbean", "古巴", "Cuba", "🇨🇺"], ["DO", "mexico_caribbean", "多明尼加", "Dominican Republic", "🇩🇴"], ["BS", "mexico_caribbean", "巴哈馬", "Bahamas", "🇧🇸"], ["JM", "mexico_caribbean", "牙買加", "Jamaica", "🇯🇲"],
  ["CR", "central_america", "哥斯大黎加", "Costa Rica", "🇨🇷"], ["PA", "central_america", "巴拿馬", "Panama", "🇵🇦"],
  ["PE", "andes", "秘魯", "Peru", "🇵🇪"], ["BO", "andes", "玻利維亞", "Bolivia", "🇧🇴"], ["EC", "andes", "厄瓜多", "Ecuador", "🇪🇨"],
  ["CO", "northern_south_america", "哥倫比亞", "Colombia", "🇨🇴"], ["BR", "brazil", "巴西", "Brazil", "🇧🇷"],
  ["AR", "southern_cone", "阿根廷", "Argentina", "🇦🇷"], ["CL", "southern_cone", "智利", "Chile", "🇨🇱"], ["UY", "southern_cone", "烏拉圭", "Uruguay", "🇺🇾"], ["PY", "southern_cone", "巴拉圭", "Paraguay", "🇵🇾"], ["VE", "northern_south_america", "委內瑞拉", "Venezuela", "🇻🇪"],
  ["AU", "australia", "澳洲", "Australia", "🇦🇺"], ["NZ", "new_zealand", "紐西蘭", "New Zealand", "🇳🇿"],
  ["FJ", "pacific_islands", "斐濟", "Fiji", "🇫🇯"], ["GU", "pacific_islands", "關島", "Guam", "🇬🇺"], ["PW", "pacific_islands", "帛琉", "Palau", "🇵🇼"], ["PF", "pacific_islands", "法屬玻里尼西亞", "French Polynesia", "🇵🇫"], ["NC", "pacific_islands", "新喀里多尼亞", "New Caledonia", "🇳🇨"],
  ["EG", "north_africa", "埃及", "Egypt", "🇪🇬"], ["MA", "north_africa", "摩洛哥", "Morocco", "🇲🇦"], ["TN", "north_africa", "突尼西亞", "Tunisia", "🇹🇳"], ["DZ", "north_africa", "阿爾及利亞", "Algeria", "🇩🇿"],
  ["KE", "east_africa", "肯亞", "Kenya", "🇰🇪"], ["TZ", "east_africa", "坦尚尼亞", "Tanzania", "🇹🇿"], ["ET", "east_africa", "衣索比亞", "Ethiopia", "🇪🇹"],
  ["GH", "west_africa", "迦納", "Ghana", "🇬🇭"], ["SN", "west_africa", "塞內加爾", "Senegal", "🇸🇳"], ["RW", "east_africa", "盧安達", "Rwanda", "🇷🇼"], ["UG", "east_africa", "烏干達", "Uganda", "🇺🇬"],
  ["CM", "central_africa", "喀麥隆", "Cameroon", "🇨🇲"],
  ["ZA", "southern_africa", "南非", "South Africa", "🇿🇦"], ["NA", "southern_africa", "納米比亞", "Namibia", "🇳🇦"], ["BW", "southern_africa", "波札那", "Botswana", "🇧🇼"], ["ZW", "southern_africa", "辛巴威", "Zimbabwe", "🇿🇼"], ["MG", "indian_ocean_africa", "馬達加斯加", "Madagascar", "🇲🇬"],
  ["MU", "indian_ocean_africa", "模里西斯", "Mauritius", "🇲🇺"], ["SC", "indian_ocean_africa", "塞席爾", "Seychelles", "🇸🇨"],
].map(([id, region, zhTW, en, emoji]) => ({ id, region, name: { "zh-TW": zhTW, en }, emoji }));

type CitySeed = [code: string, countryCode: string, zhTW: string, en: string, floor: number, ceiling: number, popularity: number, styles: TravelStyle[]];

const citySeeds: CitySeed[] = [
  ["NRT", "JP", "東京", "Tokyo", 9000, 16000, 100, ["food", "city", "shopping"]], ["KIX", "JP", "大阪", "Osaka", 8500, 15000, 98, ["food", "city", "shopping"]], ["FUK", "JP", "福岡", "Fukuoka", 7500, 13000, 94, ["food", "city", "lazy"]], ["OKA", "JP", "沖繩", "Okinawa", 7000, 12500, 92, ["lazy", "nature", "food"]], ["CTS", "JP", "札幌", "Sapporo", 10000, 18000, 91, ["food", "nature", "city"]],
  ["ICN", "KR", "首爾", "Seoul", 7000, 12500, 99, ["food", "city", "shopping"]], ["PUS", "KR", "釜山", "Busan", 6500, 11500, 92, ["food", "city", "nature"]],
  ["PVG", "CN", "上海", "Shanghai", 8500, 15000, 96, ["food", "city", "shopping"]], ["PEK", "CN", "北京", "Beijing", 10000, 17500, 94, ["food", "city", "nature"]], ["TFU", "CN", "成都", "Chengdu", 9500, 16500, 91, ["food", "city", "nature"]], ["XMN", "CN", "廈門", "Xiamen", 7000, 12500, 87, ["food", "city", "lazy"]], ["HKG", "HK", "香港", "Hong Kong", 6500, 11500, 98, ["food", "city", "shopping"]], ["MFM", "MO", "澳門", "Macau", 6500, 11000, 87, ["food", "city", "lazy"]],
  ["BKK", "TH", "曼谷", "Bangkok", 8500, 14500, 100, ["food", "city", "shopping"]], ["CNX", "TH", "清邁", "Chiang Mai", 9500, 15500, 91, ["nature", "food", "lazy"]], ["HKT", "TH", "普吉島", "Phuket", 10000, 17000, 94, ["lazy", "nature", "food"]], ["SGN", "VN", "胡志明市", "Ho Chi Minh City", 8000, 14000, 96, ["food", "city", "shopping"]], ["HAN", "VN", "河內", "Hanoi", 9000, 15000, 93, ["food", "city", "nature"]], ["DAD", "VN", "峴港", "Da Nang", 9000, 15000, 91, ["lazy", "nature", "food"]], ["PQC", "VN", "富國島", "Phu Quoc", 10500, 17500, 86, ["lazy", "nature", "food"]], ["SIN", "SG", "新加坡", "Singapore", 9500, 16000, 98, ["food", "city", "lazy"]], ["KUL", "MY", "吉隆坡", "Kuala Lumpur", 8500, 14500, 95, ["food", "city", "shopping"]], ["PEN", "MY", "檳城", "Penang", 9500, 15500, 89, ["food", "city", "lazy"]], ["BKI", "MY", "亞庇", "Kota Kinabalu", 8500, 14500, 90, ["nature", "lazy", "food"]], ["MNL", "PH", "馬尼拉", "Manila", 7500, 13500, 91, ["food", "city", "shopping"]], ["CEB", "PH", "宿霧", "Cebu", 8500, 14500, 94, ["lazy", "nature", "food"]], ["MPH", "PH", "長灘島", "Boracay", 10000, 16500, 90, ["lazy", "nature", "food"]], ["DPS", "ID", "峇里島", "Bali", 11000, 18500, 98, ["lazy", "nature", "food"]], ["CGK", "ID", "雅加達", "Jakarta", 9500, 16000, 84, ["food", "city", "shopping"]], ["REP", "KH", "暹粒", "Siem Reap", 10500, 17000, 89, ["nature", "city", "food"]], ["PNH", "KH", "金邊", "Phnom Penh", 9500, 16000, 82, ["food", "city", "lazy"]],
  ["DEL", "IN", "德里", "Delhi", 15000, 26000, 91, ["food", "city", "shopping"]], ["BOM", "IN", "孟買", "Mumbai", 16000, 27500, 89, ["food", "city", "shopping"]], ["KTM", "NP", "加德滿都", "Kathmandu", 15500, 26000, 92, ["nature", "city", "food"]], ["CMB", "LK", "可倫坡", "Colombo", 15000, 25000, 87, ["nature", "food", "lazy"]], ["MLE", "MV", "馬列・馬爾地夫", "Malé & Maldives", 17000, 30000, 96, ["lazy", "nature", "food"]],
  ["ALA", "KZ", "阿拉木圖", "Almaty", 17000, 28000, 88, ["nature", "city", "food"]], ["TAS", "UZ", "塔什干", "Tashkent", 18000, 30000, 86, ["city", "food", "nature"]], ["SKD", "UZ", "撒馬罕", "Samarkand", 19000, 31000, 90, ["city", "food", "nature"]], ["DXB", "AE", "杜拜", "Dubai", 16000, 28000, 98, ["city", "shopping", "food"]], ["AUH", "AE", "阿布達比", "Abu Dhabi", 17000, 29000, 89, ["city", "lazy", "food"]], ["DOH", "QA", "杜哈", "Doha", 16500, 28000, 90, ["city", "food", "shopping"]], ["IST", "TR", "伊斯坦堡", "Istanbul", 19000, 32000, 97, ["food", "city", "shopping"]],
  ["LHR", "GB", "倫敦", "London", 24000, 42000, 100, ["city", "food", "shopping"]], ["EDI", "GB", "愛丁堡", "Edinburgh", 27000, 44000, 91, ["city", "nature", "food"]], ["CDG", "FR", "巴黎", "Paris", 23000, 41000, 100, ["city", "food", "shopping"]], ["NCE", "FR", "尼斯", "Nice", 27000, 44000, 91, ["lazy", "city", "food"]], ["AMS", "NL", "阿姆斯特丹", "Amsterdam", 24000, 42000, 97, ["city", "food", "nature"]], ["BRU", "BE", "布魯塞爾", "Brussels", 26000, 43000, 88, ["food", "city", "shopping"]],
  ["BER", "DE", "柏林", "Berlin", 25000, 42000, 95, ["city", "food", "shopping"]], ["MUC", "DE", "慕尼黑", "Munich", 24000, 41000, 93, ["city", "food", "nature"]], ["FRA", "DE", "法蘭克福", "Frankfurt", 23000, 40000, 89, ["city", "food", "shopping"]], ["ZRH", "CH", "蘇黎世", "Zurich", 25000, 43000, 94, ["nature", "city", "food"]], ["GVA", "CH", "日內瓦", "Geneva", 27000, 45000, 88, ["nature", "city", "food"]], ["VIE", "AT", "維也納", "Vienna", 25000, 42000, 95, ["city", "food", "shopping"]], ["PRG", "CZ", "布拉格", "Prague", 26000, 43000, 96, ["city", "food", "shopping"]], ["BUD", "HU", "布達佩斯", "Budapest", 26000, 43000, 94, ["city", "food", "lazy"]], ["WAW", "PL", "華沙", "Warsaw", 26000, 43000, 88, ["city", "food", "shopping"]],
  ["FCO", "IT", "羅馬", "Rome", 24000, 42000, 99, ["city", "food", "shopping"]], ["MXP", "IT", "米蘭", "Milan", 23000, 41000, 96, ["city", "food", "shopping"]], ["VCE", "IT", "威尼斯", "Venice", 27000, 44000, 95, ["city", "food", "lazy"]], ["BCN", "ES", "巴塞隆納", "Barcelona", 25000, 43000, 98, ["city", "food", "lazy"]], ["MAD", "ES", "馬德里", "Madrid", 25000, 43000, 95, ["city", "food", "shopping"]], ["LIS", "PT", "里斯本", "Lisbon", 27000, 45000, 96, ["city", "food", "lazy"]], ["ATH", "GR", "雅典", "Athens", 27000, 45000, 95, ["city", "food", "nature"]], ["DBV", "HR", "杜布羅夫尼克", "Dubrovnik", 29000, 47000, 89, ["city", "nature", "lazy"]],
  ["CPH", "DK", "哥本哈根", "Copenhagen", 26000, 44000, 94, ["city", "food", "shopping"]], ["ARN", "SE", "斯德哥爾摩", "Stockholm", 27000, 45000, 92, ["city", "nature", "food"]], ["OSL", "NO", "奧斯陸", "Oslo", 27000, 45000, 90, ["nature", "city", "food"]], ["HEL", "FI", "赫爾辛基", "Helsinki", 25000, 43000, 91, ["city", "nature", "lazy"]], ["KEF", "IS", "雷克雅維克", "Reykjavík", 30000, 49000, 96, ["nature", "city", "lazy"]], ["OTP", "RO", "布加勒斯特", "Bucharest", 28000, 46000, 86, ["city", "food", "shopping"]], ["SOF", "BG", "索菲亞", "Sofia", 28000, 46000, 84, ["city", "nature", "food"]],
  ["YVR", "CA", "溫哥華", "Vancouver", 21000, 38000, 98, ["nature", "city", "food"]], ["YYZ", "CA", "多倫多", "Toronto", 25000, 42000, 97, ["city", "food", "shopping"]], ["YUL", "CA", "蒙特婁", "Montréal", 27000, 44000, 94, ["city", "food", "nature"]], ["YYC", "CA", "卡加利", "Calgary", 25000, 42000, 91, ["nature", "city", "food"]], ["YQB", "CA", "魁北克市", "Québec City", 29000, 46000, 88, ["city", "food", "nature"]],
  ["LAX", "US", "洛杉磯", "Los Angeles", 23000, 40000, 98, ["city", "nature", "shopping"]], ["SFO", "US", "舊金山", "San Francisco", 22000, 39000, 97, ["city", "food", "nature"]], ["SEA", "US", "西雅圖", "Seattle", 23000, 40000, 93, ["nature", "city", "food"]], ["LAS", "US", "拉斯維加斯", "Las Vegas", 25000, 42000, 94, ["city", "shopping", "food"]], ["HNL", "US", "夏威夷・檀香山", "Honolulu", 19000, 34000, 99, ["lazy", "nature", "food"]], ["JFK", "US", "紐約", "New York", 26000, 44000, 100, ["city", "food", "shopping"]], ["BOS", "US", "波士頓", "Boston", 27000, 45000, 92, ["city", "food", "nature"]], ["IAD", "US", "華盛頓特區", "Washington, D.C.", 27000, 45000, 91, ["city", "food", "nature"]], ["MIA", "US", "邁阿密", "Miami", 29000, 47000, 95, ["lazy", "city", "food"]], ["ORD", "US", "芝加哥", "Chicago", 26000, 44000, 94, ["city", "food", "shopping"]],
  ["CUN", "MX", "坎昆", "Cancún", 30000, 48000, 97, ["lazy", "nature", "food"]], ["MEX", "MX", "墨西哥城", "Mexico City", 28000, 46000, 96, ["food", "city", "shopping"]], ["HAV", "CU", "哈瓦那", "Havana", 32000, 50000, 91, ["city", "food", "lazy"]], ["PUJ", "DO", "蓬塔卡納", "Punta Cana", 32000, 50000, 90, ["lazy", "nature", "food"]], ["SJO", "CR", "聖荷西", "San José", 30000, 48000, 92, ["nature", "city", "food"]], ["PTY", "PA", "巴拿馬城", "Panama City", 30000, 48000, 89, ["city", "nature", "food"]],
  ["LIM", "PE", "利馬", "Lima", 32000, 50000, 94, ["food", "city", "nature"]], ["CUZ", "PE", "庫斯科", "Cusco", 34000, 52000, 98, ["nature", "city", "food"]], ["LPB", "BO", "拉巴斯", "La Paz", 35000, 54000, 88, ["nature", "city", "food"]], ["UIO", "EC", "基多", "Quito", 33000, 51000, 90, ["nature", "city", "food"]], ["BOG", "CO", "波哥大", "Bogotá", 31000, 49000, 93, ["city", "food", "nature"]], ["MDE", "CO", "麥德林", "Medellín", 33000, 51000, 92, ["city", "nature", "food"]], ["CTG", "CO", "卡塔赫納", "Cartagena", 35000, 53000, 91, ["lazy", "city", "food"]], ["GRU", "BR", "聖保羅", "São Paulo", 32000, 50000, 95, ["food", "city", "shopping"]], ["GIG", "BR", "里約熱內盧", "Rio de Janeiro", 33000, 51000, 98, ["nature", "city", "food"]], ["EZE", "AR", "布宜諾斯艾利斯", "Buenos Aires", 34000, 52000, 97, ["food", "city", "shopping"]], ["SCL", "CL", "聖地牙哥", "Santiago", 33000, 51000, 94, ["nature", "city", "food"]], ["MVD", "UY", "蒙特維多", "Montevideo", 36000, 55000, 86, ["lazy", "city", "food"]],
  ["SYD", "AU", "雪梨", "Sydney", 17000, 31000, 99, ["nature", "city", "food"]], ["MEL", "AU", "墨爾本", "Melbourne", 18000, 32000, 98, ["food", "city", "shopping"]], ["BNE", "AU", "布里斯本", "Brisbane", 18000, 32000, 92, ["nature", "city", "lazy"]], ["PER", "AU", "伯斯", "Perth", 19000, 33000, 91, ["nature", "city", "food"]], ["CNS", "AU", "凱恩斯", "Cairns", 20000, 34000, 94, ["nature", "lazy", "food"]], ["OOL", "AU", "黃金海岸", "Gold Coast", 19000, 33000, 95, ["lazy", "nature", "food"]], ["AKL", "NZ", "奧克蘭", "Auckland", 21000, 36000, 96, ["nature", "city", "food"]], ["ZQN", "NZ", "皇后鎮", "Queenstown", 25000, 41000, 98, ["nature", "lazy", "food"]], ["CHC", "NZ", "基督城", "Christchurch", 23000, 39000, 92, ["nature", "city", "food"]], ["WLG", "NZ", "威靈頓", "Wellington", 24000, 40000, 89, ["city", "nature", "food"]], ["NAN", "FJ", "楠迪・斐濟", "Nadi & Fiji", 23000, 39000, 94, ["lazy", "nature", "food"]], ["GUM", "GU", "關島", "Guam", 13000, 23000, 92, ["lazy", "nature", "shopping"]], ["ROR", "PW", "帛琉", "Palau", 18000, 30000, 90, ["lazy", "nature", "food"]],
  ["CAI", "EG", "開羅", "Cairo", 22000, 38000, 97, ["city", "food", "shopping"]], ["CMN", "MA", "卡薩布蘭卡", "Casablanca", 28000, 45000, 89, ["city", "food", "shopping"]], ["RAK", "MA", "馬拉喀什", "Marrakesh", 29000, 46000, 95, ["city", "food", "shopping"]], ["TUN", "TN", "突尼斯", "Tunis", 29000, 46000, 86, ["city", "food", "lazy"]], ["NBO", "KE", "奈洛比", "Nairobi", 25000, 42000, 94, ["nature", "city", "food"]], ["ZNZ", "TZ", "桑吉巴", "Zanzibar", 30000, 48000, 95, ["lazy", "nature", "food"]], ["ADD", "ET", "阿迪斯阿貝巴", "Addis Ababa", 24000, 41000, 85, ["city", "food", "nature"]], ["CPT", "ZA", "開普敦", "Cape Town", 28000, 46000, 98, ["nature", "city", "food"]], ["JNB", "ZA", "約翰尼斯堡", "Johannesburg", 26000, 43000, 91, ["city", "nature", "food"]], ["WDH", "NA", "溫得和克", "Windhoek", 32000, 50000, 86, ["nature", "city", "food"]], ["MRU", "MU", "模里西斯", "Mauritius", 27000, 45000, 96, ["lazy", "nature", "food"]], ["SEZ", "SC", "塞席爾", "Seychelles", 31000, 50000, 94, ["lazy", "nature", "food"]],
  ["VTE", "LA", "永珍", "Vientiane", 11000, 19000, 86, ["food", "city", "lazy"]], ["LPQ", "LA", "龍坡邦", "Luang Prabang", 13000, 21000, 91, ["nature", "food", "lazy"]], ["RGN", "MM", "仰光", "Yangon", 12000, 20000, 86, ["city", "food", "nature"]], ["BWN", "BN", "斯里巴加灣市", "Bandar Seri Begawan", 11000, 19000, 82, ["city", "nature", "lazy"]],
  ["DAC", "BD", "達卡", "Dhaka", 17000, 29000, 82, ["city", "food", "shopping"]], ["PBH", "BT", "帕羅・廷布", "Paro & Thimphu", 19000, 32000, 92, ["nature", "city", "food"]], ["ISB", "PK", "伊斯蘭馬巴德", "Islamabad", 19000, 32000, 84, ["nature", "city", "food"]], ["UBN", "MN", "烏蘭巴托", "Ulaanbaatar", 15000, 26000, 90, ["nature", "city", "food"]],
  ["TBS", "GE", "第比利斯", "Tbilisi", 22000, 36000, 94, ["food", "city", "nature"]], ["EVN", "AM", "葉里溫", "Yerevan", 23000, 37000, 87, ["city", "food", "nature"]], ["GYD", "AZ", "巴庫", "Baku", 22000, 36000, 89, ["city", "food", "shopping"]], ["RUH", "SA", "利雅德", "Riyadh", 19000, 32000, 88, ["city", "food", "shopping"]], ["JED", "SA", "吉達", "Jeddah", 20000, 33000, 90, ["city", "food", "lazy"]], ["AMM", "JO", "安曼・佩特拉", "Amman & Petra", 22000, 36000, 95, ["nature", "city", "food"]], ["MCT", "OM", "馬斯喀特", "Muscat", 20000, 34000, 90, ["nature", "city", "lazy"]],
  ["DUB", "IE", "都柏林", "Dublin", 27000, 44000, 94, ["city", "food", "nature"]], ["TLL", "EE", "塔林", "Tallinn", 28000, 45000, 91, ["city", "food", "lazy"]], ["RIX", "LV", "里加", "Riga", 28000, 45000, 88, ["city", "food", "shopping"]], ["VNO", "LT", "維爾紐斯", "Vilnius", 28000, 45000, 87, ["city", "food", "lazy"]], ["BEG", "RS", "貝爾格勒", "Belgrade", 27000, 44000, 89, ["city", "food", "shopping"]], ["LJU", "SI", "盧比安納", "Ljubljana", 28000, 45000, 91, ["nature", "city", "food"]], ["BTS", "SK", "布拉提斯拉瓦", "Bratislava", 27000, 44000, 86, ["city", "food", "lazy"]], ["TIA", "AL", "地拉那", "Tirana", 29000, 46000, 87, ["nature", "city", "food"]], ["MLA", "MT", "馬爾他", "Malta", 29000, 46000, 94, ["lazy", "city", "food"]], ["LCA", "CY", "拉納卡・賽普勒斯", "Larnaca & Cyprus", 28000, 45000, 91, ["lazy", "nature", "food"]],
  ["YOW", "CA", "渥太華", "Ottawa", 28000, 45000, 89, ["city", "nature", "food"]], ["YEG", "CA", "愛德蒙頓", "Edmonton", 26000, 43000, 87, ["nature", "city", "shopping"]], ["YHZ", "CA", "哈利法克斯", "Halifax", 30000, 48000, 88, ["nature", "city", "food"]], ["YWG", "CA", "溫尼伯", "Winnipeg", 29000, 46000, 82, ["nature", "city", "food"]],
  ["MCO", "US", "奧蘭多", "Orlando", 29000, 47000, 95, ["city", "shopping", "lazy"]], ["MSY", "US", "紐奧良", "New Orleans", 30000, 48000, 92, ["food", "city", "lazy"]], ["DEN", "US", "丹佛", "Denver", 27000, 45000, 91, ["nature", "city", "food"]], ["ANC", "US", "安克拉治", "Anchorage", 30000, 48000, 90, ["nature", "city", "lazy"]], ["SAN", "US", "聖地牙哥", "San Diego", 27000, 45000, 93, ["lazy", "city", "food"]], ["NAS", "BS", "拿索", "Nassau", 33000, 51000, 92, ["lazy", "nature", "food"]], ["MBJ", "JM", "蒙特哥灣", "Montego Bay", 34000, 52000, 91, ["lazy", "nature", "food"]],
  ["ASU", "PY", "亞松森", "Asunción", 36000, 54000, 84, ["city", "food", "lazy"]], ["CCS", "VE", "卡拉卡斯", "Caracas", 35000, 53000, 82, ["nature", "city", "food"]], ["PPT", "PF", "大溪地・帕皮提", "Papeete & Tahiti", 30000, 48000, 98, ["lazy", "nature", "food"]], ["NOU", "NC", "努美阿", "Nouméa", 26000, 43000, 90, ["lazy", "nature", "food"]],
  ["ALG", "DZ", "阿爾及爾", "Algiers", 29000, 46000, 84, ["city", "food", "nature"]], ["ACC", "GH", "阿克拉", "Accra", 28000, 45000, 89, ["city", "food", "nature"]], ["DSS", "SN", "達喀爾", "Dakar", 30000, 48000, 88, ["food", "city", "nature"]], ["KGL", "RW", "吉佳利", "Kigali", 28000, 45000, 92, ["nature", "city", "food"]], ["EBB", "UG", "恩德培・坎帕拉", "Entebbe & Kampala", 28000, 45000, 90, ["nature", "city", "food"]], ["DLA", "CM", "杜阿拉", "Douala", 31000, 49000, 83, ["city", "food", "nature"]], ["GBE", "BW", "嘉柏隆里", "Gaborone", 32000, 50000, 85, ["nature", "city", "food"]], ["TNR", "MG", "安塔那那利佛", "Antananarivo", 32000, 50000, 89, ["nature", "city", "food"]], ["VFA", "ZW", "維多利亞瀑布", "Victoria Falls", 33000, 51000, 96, ["nature", "lazy", "food"]],
];

type Airport = { code: string; name: string };

const namedAirports: Record<string, string> = {
  NRT: "成田國際機場", KIX: "關西國際機場", ICN: "仁川國際機場", PVG: "上海浦東國際機場",
  PEK: "北京首都國際機場", BKK: "蘇凡納布國際機場", LHR: "倫敦希斯洛機場", CDG: "巴黎戴高樂機場",
  FCO: "羅馬菲烏米奇諾機場", MXP: "米蘭馬爾彭薩機場", JFK: "紐約甘迺迪國際機場",
  IAD: "華盛頓杜勒斯國際機場", EZE: "布宜諾斯艾利斯埃塞薩國際機場", YVR: "溫哥華國際機場",
  YYZ: "多倫多皮爾遜國際機場", LAX: "洛杉磯國際機場", SFO: "舊金山國際機場",
};

const alternateAirports: Record<string, Airport[]> = {
  NRT: [{ code: "HND", name: "東京羽田機場" }],
  KIX: [{ code: "ITM", name: "大阪伊丹機場" }],
  ICN: [{ code: "GMP", name: "首爾金浦國際機場" }],
  PVG: [{ code: "SHA", name: "上海虹橋國際機場" }],
  PEK: [{ code: "PKX", name: "北京大興國際機場" }],
  BKK: [{ code: "DMK", name: "曼谷廊曼國際機場" }],
  LHR: [{ code: "LGW", name: "倫敦蓋威克機場" }, { code: "STN", name: "倫敦史坦斯特機場" }],
  CDG: [{ code: "ORY", name: "巴黎奧利機場" }],
  FCO: [{ code: "CIA", name: "羅馬錢皮諾機場" }],
  MXP: [{ code: "LIN", name: "米蘭利納特機場" }, { code: "BGY", name: "米蘭貝加莫機場" }],
  JFK: [{ code: "EWR", name: "紐約紐華克自由國際機場" }, { code: "LGA", name: "紐約拉瓜地亞機場" }],
  IAD: [{ code: "DCA", name: "華盛頓雷根國家機場" }],
  EZE: [{ code: "AEP", name: "布宜諾斯艾利斯荷西紐貝瑞機場" }],
};

export const destinations = citySeeds.map(([code, countryCode, zhTW, en, floor, ceiling, popularity, styles]) => {
  const country = destinationCountries.find((item) => item.id === countryCode);
  if (!country) throw new Error(`找不到城市 ${code} 的國家資料`);
  const region = destinationRegions.find((item) => item.id === country.region);
  if (!region) throw new Error(`找不到城市 ${code} 的區域資料`);
  return {
    code,
    city: localize({ "zh-TW": zhTW, en }),
    cityName: { "zh-TW": zhTW, en },
    country: localize(country.name),
    countryName: country.name,
    countryCode,
    continent: region.continent,
    region: country.region,
    emoji: country.emoji,
    floor,
    ceiling,
    popularity,
    styles,
    note: `${zhTW}是${localize(country.name)}熱門目的地，可依團員偏好安排城市、自然與美食體驗。`,
    airports: [
      { code, name: namedAirports[code] ?? `${zhTW}主要機場` },
      ...(alternateAirports[code] ?? []),
    ],
  };
});
