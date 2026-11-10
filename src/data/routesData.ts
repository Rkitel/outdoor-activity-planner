import { OutdoorRoute } from '../types/weather';

export const SINGAPORE_ROUTES: OutdoorRoute[] = [
  {
    id: 'marina-bay-loop',
    name: 'Marina Bay Waterfront Loop',
    region: 'south',
    distanceKm: 11.2,
    elevationGainM: 18,
    surface: 'Paved',
    shadePercent: 20,
    shelterPoints: 'Marina Bay Sands, Esplanade Underpass, The Float, Helix Bridge',
    description: 'Singapore’s most iconic scenic waterfront circuit. Flat, wide pavement passing Merlion Park, Gardens by the Bay, Marina Barrage, and modern city skyline.',
    highlights: ['Marina Barrage skyline views', 'Helix Bridge architecture', 'Smooth paved surface', 'Water coolers every 2km'],
    forecastAreaName: 'Marina South',
    center: [1.2840, 103.8590],
    coordinates: [
      [1.2868, 103.8545], // Merlion
      [1.2895, 103.8580], // Esplanade
      [1.2875, 103.8610], // Marina Bay Sands promenade
      [1.2815, 103.8635], // Marina Bay Sands south
      [1.2805, 103.8710], // Gardens by the Bay
      [1.2808, 103.8745], // Marina Barrage
      [1.2870, 103.8730], // Bay East Garden
      [1.2930, 103.8660], // Stadium link
      [1.2925, 103.8585], // The Float
      [1.2868, 103.8545]  // Merlion loop back
    ]
  },
  {
    id: 'east-coast-park',
    name: 'East Coast Park Coastal Trail',
    region: 'east',
    distanceKm: 15.0,
    elevationGainM: 12,
    surface: 'Paved',
    shadePercent: 45,
    shelterPoints: 'Marine Cove, Coastal PlayGrove, Underpasses to Marine Parade, Parkland Green',
    description: 'The runner and cyclist haven along Singapore’s southeastern shore. Separate dedicated bike tracks and pedestrian paths with continuous cooling maritime sea breezes.',
    highlights: ['Dedicated cycling track', 'Continuous sea breeze', 'Ample hydration and washrooms', 'Night lighting throughout'],
    forecastAreaName: 'Bedok',
    center: [1.3020, 103.9160],
    coordinates: [
      [1.2970, 103.8780], // Area A / Fort Road
      [1.2995, 103.8900], // Area B
      [1.3015, 103.9050], // Area C / Parkland Green
      [1.3040, 103.9210], // Area D / Marine Cove
      [1.3090, 103.9400], // Area E / Lagoon Food Village
      [1.3140, 103.9600], // Area F
      [1.3195, 103.9800], // Area G / Tanah Merah link
      [1.3220, 103.9920]  // Changi link
    ]
  },
  {
    id: 'macritchie-nature-trail',
    name: 'MacRitchie Reservoir Nature Loop',
    region: 'central',
    distanceKm: 10.8,
    elevationGainM: 165,
    surface: 'Gravel / Trail',
    shadePercent: 85,
    shelterPoints: 'Lornie Trail Pavilions, TreeTop Walk Ranger Station, MacRitchie Amenities Centre',
    description: 'Singapore’s primary rainforest trail run. Natural compacted earth, wooden boardwalks over clear waters, canopy tree cover, and scenic undulating forest terrain.',
    highlights: ['Natural dirt & crushed stone trail', 'High canopy shade coverage', 'Wildlife viewing (monkeys, monitor lizards)', 'Treetop Walk suspension bridge'],
    forecastAreaName: 'Central Water Catchment',
    center: [1.3480, 103.8260],
    coordinates: [
      [1.3420, 103.8340], // MacRitchie Reservoir park / boat shed
      [1.3460, 103.8360], // Prunus trail
      [1.3530, 103.8300], // Petai trail
      [1.3590, 103.8220], // Sime Track
      [1.3610, 103.8150], // Ranger station
      [1.3570, 103.8110], // Jelutong Tower
      [1.3520, 103.8150], // Terentang Trail
      [1.3450, 103.8230], // Lornie Trail
      [1.3420, 103.8340]  // Back to entrance
    ]
  },
  {
    id: 'rail-corridor',
    name: 'Rail Corridor (Green Corridor Spine)',
    region: 'central',
    distanceKm: 21.0,
    elevationGainM: 95,
    surface: 'Mixed',
    shadePercent: 60,
    shelterPoints: 'Bukit Timah Railway Station, Hillview MRT Shelter, King Albert Park Pavilion',
    description: 'A 24km continuous ecological green corridor running north to south along the former KTM railway line, connecting Woodlands to Tanjong Pagar.',
    highlights: ['Car-free continuous green corridor', 'Historic cast-iron truss bridges', 'Mix of paved gravel and porous concrete', 'Connects diverse neighborhoods'],
    forecastAreaName: 'Bukit Timah',
    center: [1.3450, 103.7820],
    coordinates: [
      [1.2740, 103.8380], // Tanjong Pagar old railway
      [1.2950, 103.8210], // Alexandra / Dawson
      [1.3110, 103.8010], // Buona Vista / Holland
      [1.3340, 103.7810], // Bukit Timah Railway Station
      [1.3520, 103.7710], // Upper Bukit Timah Truss Bridge
      [1.3620, 103.7650], // Hillview
      [1.3850, 103.7610], // Ten Mile Junction / Senja
      [1.4120, 103.7630], // Kranji / Woodlands
      [1.4350, 103.7700]  // Woodlands Train Checkpoint
    ]
  },
  {
    id: 'changi-bay-point',
    name: 'Changi Bay Point & Coastal Park Connector',
    region: 'east',
    distanceKm: 14.5,
    elevationGainM: 8,
    surface: 'Paved',
    shadePercent: 15,
    shelterPoints: 'Changi Bay Pavilion, Changi Beach Park Shelters, Coastal Rest Stops',
    description: 'Flat, breezy, open coastal route popular with cyclists and tempo runners. Offers panoramic maritime views across the Straits of Johor and pristine boardwalks.',
    highlights: ['Sweeping ocean horizon vistas', 'Strong cooling sea breezes', 'Smooth tarmac for road bicycles', 'Picturesque coastal boardwalk bridges'],
    forecastAreaName: 'Changi',
    center: [1.3480, 104.0150],
    coordinates: [
      [1.3890, 103.9920], // Changi Village / Beach Park
      [1.3780, 104.0040], // Changi Coast Walk
      [1.3610, 104.0180], // Changi Bay Point Pavilion
      [1.3450, 104.0260], // Coastal Boardwalk
      [1.3250, 104.0150], // Tanah Merah Coast Road connection
      [1.3195, 103.9800]  // East Coast Park link
    ]
  },
  {
    id: 'kallang-riverside-stadium',
    name: 'Kallang Riverside & National Stadium Circuit',
    region: 'central',
    distanceKm: 6.8,
    elevationGainM: 10,
    surface: 'Paved',
    shadePercent: 70,
    shelterPoints: '100PLUS Promenade (100% Weatherproof covered track), Kallang Wave Mall',
    description: 'The ultimate rainproof and heat-safe athletic destination. Includes the sheltered 888m 100PLUS Promenade running track around the Singapore National Stadium.',
    highlights: ['Covered sheltered 888m running track', 'Zero rain interruption risk', 'River loop connects to Tanjong Rhu', 'Stadium amenities & lockers'],
    forecastAreaName: 'Kallang',
    center: [1.3030, 103.8740],
    coordinates: [
      [1.3035, 103.8740], // National Stadium
      [1.3060, 103.8710], // Kallang Riverside Park West
      [1.3000, 103.8660], // Nicoll Highway Bridge
      [1.2980, 103.8730], // Tanjong Rhu Suspension Bridge
      [1.2995, 103.8790], // Tanjong Rhu Promenade
      [1.3035, 103.8740]  // Loop back to Stadium
    ]
  },
  {
    id: 'punggol-waterway-coney',
    name: 'Punggol Waterway & Coney Island Loop',
    region: 'north',
    distanceKm: 13.5,
    elevationGainM: 14,
    surface: 'Boardwalk & Paved',
    shadePercent: 50,
    shelterPoints: 'Waterway Point, Coney Island Pavilions, Punggol Settlement Shelters',
    description: 'Charming northeastern loop blending the paved urban canal of Punggol Waterway with the rugged rustic sandy tracks and casuarina groves of Coney Island.',
    highlights: ['Waterway bridges and cascades', 'Rustic unpaved Coney Island paths', 'Seaside boardwalk at Punggol Settlement', 'Popular with distance runners & gravel bikes'],
    forecastAreaName: 'Punggol',
    center: [1.4080, 103.9140],
    coordinates: [
      [1.4060, 103.9020], // Waterway Point / Town Park
      [1.4120, 103.9110], // Jewel Bridge / Sunset Strip
      [1.4210, 103.9190], // Punggol Point Park / Settlement
      [1.4200, 103.9240], // Coney Island West Gate
      [1.4140, 103.9350], // Coney Island East Gate
      [1.4050, 103.9320], // Halus Wetland Bridge
      [1.4020, 103.9150], // Sunrise Bridge
      [1.4060, 103.9020]  // Return to Waterway Point
    ]
  },
  {
    id: 'sentosa-coastal-loop',
    name: 'Sentosa Coastal & Imbiah Ridge Loop',
    region: 'south',
    distanceKm: 8.4,
    elevationGainM: 110,
    surface: 'Boardwalk & Paved',
    shadePercent: 40,
    shelterPoints: 'Siloso Beach Pavilions, Palawan Beach Food Court, Imbiah Lookout',
    description: 'Coastal breeze with punchy elevation climbs. Stretches from Siloso, Palawan, and Tanjong white sand beaches up into the shady jungle canopy of Imbiah Hill.',
    highlights: ['Beachfront boardwalk running', 'Punchy hill climb workout', 'Southernmost Point of Continental Asia', 'Ocean breezes from Singapore Strait'],
    forecastAreaName: 'Southern Islands',
    center: [1.2520, 103.8210],
    coordinates: [
      [1.2580, 103.8120], // Siloso Point / Fort Siloso
      [1.2520, 103.8180], // Siloso Beach Walk
      [1.2480, 103.8240], // Palawan Beach Walk
      [1.2440, 103.8300], // Tanjong Beach Walk
      [1.2510, 103.8280], // Sentosa Cove link
      [1.2560, 103.8220], // Imbiah Nature Walk trail
      [1.2580, 103.8120]  // Siloso Point return
    ]
  }
];
