/**
 * Vehicle make/model database for autocomplete.
 * Covers the most popular makes and models in the GTA market.
 */

export const VEHICLE_MAKES: Record<string, string[]> = {
  Acura: ['ILX', 'Integra', 'MDX', 'RDX', 'TLX'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale'],
  'Aston Martin': ['DB11', 'DB12', 'DBX', 'DBS', 'Valhalla', 'Vantage'],
  Audi: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'e-tron GT', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'R8', 'RS3', 'RS5', 'RS6', 'RS7', 'RS Q8', 'S3', 'S4', 'S5', 'S6', 'S7', 'SQ5', 'SQ7', 'SQ8', 'TT'],
  Bentley: ['Bentayga', 'Continental GT', 'Flying Spur'],
  BMW: ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series', 'i4', 'i5', 'i7', 'iX', 'M2', 'M3', 'M4', 'M5', 'M8', 'X1', 'X2', 'X3', 'X3 M', 'X4', 'X5', 'X5 M', 'X6', 'X6 M', 'X7', 'XM', 'Z4'],
  Bugatti: ['Chiron', 'Divo', 'Mistral', 'Tourbillon'],
  Buick: ['Enclave', 'Encore', 'Encore GX', 'Envision', 'Envista'],
  Cadillac: ['CT4', 'CT5', 'CT5-V', 'Escalade', 'Escalade-V', 'Lyriq', 'XT4', 'XT5', 'XT6'],
  Chevrolet: ['Blazer', 'Camaro', 'Colorado', 'Corvette', 'Equinox', 'Malibu', 'Silverado', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse'],
  Chrysler: ['300', 'Grand Caravan', 'Pacifica'],
  Dodge: ['Challenger', 'Charger', 'Durango', 'Hornet'],
  Ferrari: ['296 GTB', '296 GTS', '488', 'F8 Tributo', 'Roma', 'SF90 Stradale', '812', 'Purosangue'],
  Fiat: ['500', '500X'],
  Ford: ['Bronco', 'Bronco Sport', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'F-150 Lightning', 'F-250', 'F-350', 'Maverick', 'Mustang', 'Mustang Mach-E', 'Ranger'],
  Genesis: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  GMC: ['Acadia', 'Canyon', 'Hummer EV', 'Sierra', 'Terrain', 'Yukon', 'Yukon XL'],
  Honda: ['Accord', 'Civic', 'Civic Type R', 'CR-V', 'HR-V', 'Odyssey', 'Passport', 'Pilot', 'Prologue', 'Ridgeline'],
  Hyundai: ['Elantra', 'Elantra N', 'IONIQ 5', 'IONIQ 5 N', 'IONIQ 6', 'Kona', 'Palisade', 'Santa Cruz', 'Santa Fe', 'Sonata', 'Tucson', 'Venue'],
  Infiniti: ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  Jaguar: ['E-PACE', 'F-PACE', 'F-TYPE', 'I-PACE', 'XE', 'XF'],
  Jeep: ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee L', 'Grand Wagoneer', 'Wagoneer', 'Wrangler'],
  Kia: ['Carnival', 'EV6', 'EV9', 'Forte', 'K5', 'Niro', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
  Lamborghini: ['Huracán', 'Revuelto', 'Urus'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
  Lexus: ['ES', 'GX', 'IS', 'LC', 'LX', 'NX', 'RC', 'RC F', 'RX', 'TX', 'UX'],
  Lincoln: ['Aviator', 'Corsair', 'Nautilus', 'Navigator'],
  Lotus: ['Eletre', 'Emira'],
  Lucid: ['Air', 'Gravity'],
  Maserati: ['Ghibli', 'GranTurismo', 'Grecale', 'Levante', 'MC20', 'Quattroporte'],
  Mazda: ['CX-30', 'CX-5', 'CX-50', 'CX-70', 'CX-90', 'Mazda3', 'MX-5 Miata'],
  McLaren: ['720S', '750S', 'Artura', 'GT'],
  'Mercedes-Benz': ['A-Class', 'AMG GT', 'C-Class', 'CLA', 'CLE', 'E-Class', 'EQB', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV', 'G-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'Maybach', 'S-Class', 'SL'],
  Mini: ['Clubman', 'Cooper', 'Countryman'],
  Mitsubishi: ['Eclipse Cross', 'Mirage', 'Outlander', 'RVR'],
  Nissan: ['Altima', 'Ariya', 'Frontier', 'GT-R', 'Kicks', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa', 'Z'],
  Polestar: ['2', '3', '4'],
  Porsche: ['718 Boxster', '718 Cayman', '911', 'Cayenne', 'Cayenne Coupe', 'Macan', 'Panamera', 'Taycan'],
  RAM: ['1500', '2500', '3500'],
  'Range Rover': ['Evoque', 'Range Rover', 'Sport', 'Velar'],
  Rivian: ['R1S', 'R1T', 'R2'],
  'Rolls-Royce': ['Cullinan', 'Ghost', 'Phantom', 'Spectre', 'Wraith'],
  Subaru: ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'Solterra', 'WRX'],
  Tesla: ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y'],
  Toyota: ['4Runner', 'bZ4X', 'Camry', 'Corolla', 'Corolla Cross', 'Crown', 'GR86', 'GR Corolla', 'GR Supra', 'Grand Highlander', 'Highlander', 'Land Cruiser', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza'],
  Volkswagen: ['Atlas', 'Atlas Cross Sport', 'Golf', 'Golf GTI', 'Golf R', 'ID.4', 'ID. Buzz', 'Jetta', 'Taos', 'Tiguan'],
  Volvo: ['C40', 'EX30', 'EX90', 'S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
};

export const VEHICLE_MAKE_LIST = Object.keys(VEHICLE_MAKES).sort();

export function getModelsForMake(make: string): string[] {
  return VEHICLE_MAKES[make] || [];
}

export function getYearRange(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear + 1; y >= 1990; y--) {
    years.push(y);
  }
  return years;
}

/**
 * Model → vehicle type mapping.
 * Used to auto-detect vehicle category when user picks a make/model.
 */
type VT = 'sedan' | 'coupe' | 'crossover' | 'suv' | 'minivan' | 'pickup' | 'large_suv' | 'convertible';

const MODEL_TYPES: Record<string, Record<string, VT>> = {
  Acura: { ILX: 'sedan', Integra: 'sedan', MDX: 'suv', RDX: 'crossover', TLX: 'sedan' },
  'Alfa Romeo': { Giulia: 'sedan', Stelvio: 'suv', Tonale: 'crossover' },
  'Aston Martin': { DB11: 'coupe', DB12: 'coupe', DBX: 'suv', DBS: 'coupe', Valhalla: 'coupe', Vantage: 'coupe' },
  Audi: {
    A3: 'sedan', A4: 'sedan', A5: 'coupe', A6: 'sedan', A7: 'sedan', A8: 'sedan',
    'e-tron': 'suv', 'e-tron GT': 'sedan', Q3: 'crossover', 'Q4 e-tron': 'crossover',
    Q5: 'crossover', Q7: 'suv', Q8: 'suv', R8: 'coupe',
    RS3: 'sedan', RS5: 'coupe', RS6: 'sedan', RS7: 'sedan', 'RS Q8': 'suv',
    S3: 'sedan', S4: 'sedan', S5: 'coupe', S6: 'sedan', S7: 'sedan',
    SQ5: 'crossover', SQ7: 'suv', SQ8: 'suv', TT: 'coupe',
  },
  Bentley: { Bentayga: 'suv', 'Continental GT': 'coupe', 'Flying Spur': 'sedan' },
  BMW: {
    '2 Series': 'coupe', '3 Series': 'sedan', '4 Series': 'coupe', '5 Series': 'sedan',
    '7 Series': 'sedan', '8 Series': 'coupe', i4: 'sedan', i5: 'sedan', i7: 'sedan',
    iX: 'suv', M2: 'coupe', M3: 'sedan', M4: 'coupe', M5: 'sedan', M8: 'coupe',
    X1: 'crossover', X2: 'crossover', X3: 'crossover', 'X3 M': 'crossover',
    X4: 'crossover', X5: 'suv', 'X5 M': 'suv', X6: 'suv', 'X6 M': 'suv',
    X7: 'large_suv', XM: 'suv', Z4: 'convertible',
  },
  Bugatti: { Chiron: 'coupe', Divo: 'coupe', Mistral: 'convertible', Tourbillon: 'coupe' },
  Buick: { Enclave: 'suv', Encore: 'crossover', 'Encore GX': 'crossover', Envision: 'crossover', Envista: 'crossover' },
  Cadillac: {
    CT4: 'sedan', CT5: 'sedan', 'CT5-V': 'sedan', Escalade: 'large_suv', 'Escalade-V': 'large_suv',
    Lyriq: 'crossover', XT4: 'crossover', XT5: 'crossover', XT6: 'suv',
  },
  Chevrolet: {
    Blazer: 'crossover', Camaro: 'coupe', Colorado: 'pickup', Corvette: 'coupe',
    Equinox: 'crossover', Malibu: 'sedan', Silverado: 'pickup', Suburban: 'large_suv',
    Tahoe: 'large_suv', Trailblazer: 'crossover', Traverse: 'suv',
  },
  Chrysler: { '300': 'sedan', 'Grand Caravan': 'minivan', Pacifica: 'minivan' },
  Dodge: { Challenger: 'coupe', Charger: 'sedan', Durango: 'suv', Hornet: 'crossover' },
  Ferrari: {
    '296 GTB': 'coupe', '296 GTS': 'convertible', '488': 'coupe', 'F8 Tributo': 'coupe',
    Roma: 'coupe', 'SF90 Stradale': 'coupe', '812': 'coupe', Purosangue: 'suv',
  },
  Fiat: { '500': 'coupe', '500X': 'crossover' },
  Ford: {
    Bronco: 'suv', 'Bronco Sport': 'crossover', Edge: 'crossover', Escape: 'crossover',
    Expedition: 'large_suv', Explorer: 'suv', 'F-150': 'pickup', 'F-150 Lightning': 'pickup',
    'F-250': 'pickup', 'F-350': 'pickup', Maverick: 'pickup', Mustang: 'coupe',
    'Mustang Mach-E': 'crossover', Ranger: 'pickup',
  },
  Genesis: { G70: 'sedan', G80: 'sedan', G90: 'sedan', GV60: 'crossover', GV70: 'crossover', GV80: 'suv' },
  GMC: {
    Acadia: 'suv', Canyon: 'pickup', 'Hummer EV': 'pickup', Sierra: 'pickup',
    Terrain: 'crossover', Yukon: 'large_suv', 'Yukon XL': 'large_suv',
  },
  Honda: {
    Accord: 'sedan', Civic: 'sedan', 'Civic Type R': 'sedan', 'CR-V': 'crossover',
    'HR-V': 'crossover', Odyssey: 'minivan', Passport: 'suv', Pilot: 'suv',
    Prologue: 'suv', Ridgeline: 'pickup',
  },
  Hyundai: {
    Elantra: 'sedan', 'Elantra N': 'sedan', 'IONIQ 5': 'crossover', 'IONIQ 5 N': 'crossover',
    'IONIQ 6': 'sedan', Kona: 'crossover', Palisade: 'suv', 'Santa Cruz': 'pickup',
    'Santa Fe': 'suv', Sonata: 'sedan', Tucson: 'crossover', Venue: 'crossover',
  },
  Infiniti: { Q50: 'sedan', Q60: 'coupe', QX50: 'crossover', QX55: 'crossover', QX60: 'suv', QX80: 'large_suv' },
  Jaguar: { 'E-PACE': 'crossover', 'F-PACE': 'suv', 'F-TYPE': 'coupe', 'I-PACE': 'crossover', XE: 'sedan', XF: 'sedan' },
  Jeep: {
    Cherokee: 'crossover', Compass: 'crossover', Gladiator: 'pickup',
    'Grand Cherokee': 'suv', 'Grand Cherokee L': 'suv',
    'Grand Wagoneer': 'large_suv', Wagoneer: 'large_suv', Wrangler: 'suv',
  },
  Kia: {
    Carnival: 'minivan', EV6: 'crossover', EV9: 'suv', Forte: 'sedan', K5: 'sedan',
    Niro: 'crossover', Seltos: 'crossover', Sorento: 'suv', Soul: 'crossover',
    Sportage: 'crossover', Stinger: 'sedan', Telluride: 'suv',
  },
  Lamborghini: { 'Huracán': 'coupe', Revuelto: 'coupe', Urus: 'suv' },
  'Land Rover': {
    Defender: 'suv', Discovery: 'suv', 'Discovery Sport': 'crossover',
    'Range Rover': 'large_suv', 'Range Rover Evoque': 'crossover',
    'Range Rover Sport': 'suv', 'Range Rover Velar': 'suv',
  },
  Lexus: { ES: 'sedan', GX: 'suv', IS: 'sedan', LC: 'coupe', LX: 'large_suv', NX: 'crossover', RC: 'coupe', 'RC F': 'coupe', RX: 'suv', TX: 'large_suv', UX: 'crossover' },
  Lincoln: { Aviator: 'suv', Corsair: 'crossover', Nautilus: 'crossover', Navigator: 'large_suv' },
  Lotus: { Eletre: 'suv', Emira: 'coupe' },
  Lucid: { Air: 'sedan', Gravity: 'suv' },
  Maserati: { Ghibli: 'sedan', GranTurismo: 'coupe', Grecale: 'crossover', Levante: 'suv', MC20: 'coupe', Quattroporte: 'sedan' },
  Mazda: { 'CX-30': 'crossover', 'CX-5': 'crossover', 'CX-50': 'crossover', 'CX-70': 'suv', 'CX-90': 'suv', Mazda3: 'sedan', 'MX-5 Miata': 'convertible' },
  McLaren: { '720S': 'coupe', '750S': 'coupe', Artura: 'coupe', GT: 'coupe' },
  'Mercedes-Benz': {
    'A-Class': 'sedan', 'AMG GT': 'coupe', 'C-Class': 'sedan', CLA: 'sedan', CLE: 'coupe',
    'E-Class': 'sedan', EQB: 'crossover', EQE: 'sedan', 'EQE SUV': 'suv', EQS: 'sedan',
    'EQS SUV': 'suv', 'G-Class': 'suv', GLA: 'crossover', GLB: 'crossover', GLC: 'crossover',
    GLE: 'suv', GLS: 'large_suv', Maybach: 'sedan', 'S-Class': 'sedan', SL: 'convertible',
  },
  Mini: { Clubman: 'sedan', Cooper: 'coupe', Countryman: 'crossover' },
  Mitsubishi: { 'Eclipse Cross': 'crossover', Mirage: 'sedan', Outlander: 'suv', RVR: 'crossover' },
  Nissan: {
    Altima: 'sedan', Ariya: 'crossover', Frontier: 'pickup', 'GT-R': 'coupe',
    Kicks: 'crossover', Murano: 'crossover', Pathfinder: 'suv', Rogue: 'crossover',
    Sentra: 'sedan', Titan: 'pickup', Versa: 'sedan', Z: 'coupe',
  },
  Polestar: { '2': 'sedan', '3': 'suv', '4': 'crossover' },
  Porsche: {
    '718 Boxster': 'convertible', '718 Cayman': 'coupe', '911': 'coupe',
    Cayenne: 'suv', 'Cayenne Coupe': 'suv', Macan: 'crossover', Panamera: 'sedan', Taycan: 'sedan',
  },
  RAM: { '1500': 'pickup', '2500': 'pickup', '3500': 'pickup' },
  'Range Rover': { Evoque: 'crossover', 'Range Rover': 'large_suv', Sport: 'suv', Velar: 'suv' },
  Rivian: { R1S: 'suv', R1T: 'pickup', R2: 'crossover' },
  'Rolls-Royce': { Cullinan: 'large_suv', Ghost: 'sedan', Phantom: 'sedan', Spectre: 'coupe', Wraith: 'coupe' },
  Subaru: {
    Ascent: 'suv', BRZ: 'coupe', Crosstrek: 'crossover', Forester: 'crossover',
    Impreza: 'sedan', Legacy: 'sedan', Outback: 'crossover', Solterra: 'crossover', WRX: 'sedan',
  },
  Tesla: { Cybertruck: 'pickup', 'Model 3': 'sedan', 'Model S': 'sedan', 'Model X': 'suv', 'Model Y': 'crossover' },
  Toyota: {
    '4Runner': 'suv', bZ4X: 'crossover', Camry: 'sedan', Corolla: 'sedan',
    'Corolla Cross': 'crossover', Crown: 'sedan', GR86: 'coupe', 'GR Corolla': 'sedan',
    'GR Supra': 'coupe', 'Grand Highlander': 'suv', Highlander: 'suv',
    'Land Cruiser': 'large_suv', Prius: 'sedan', RAV4: 'crossover', Sequoia: 'large_suv',
    Sienna: 'minivan', Tacoma: 'pickup', Tundra: 'pickup', Venza: 'crossover',
  },
  Volkswagen: {
    Atlas: 'suv', 'Atlas Cross Sport': 'suv', Golf: 'sedan', 'Golf GTI': 'sedan',
    'Golf R': 'sedan', 'ID.4': 'crossover', 'ID. Buzz': 'minivan', Jetta: 'sedan',
    Taos: 'crossover', Tiguan: 'crossover',
  },
  Volvo: {
    C40: 'crossover', EX30: 'crossover', EX90: 'suv', S60: 'sedan', S90: 'sedan',
    V60: 'sedan', V90: 'sedan', XC40: 'crossover', XC60: 'crossover', XC90: 'suv',
  },
};

/** Returns the vehicle type for a known make/model, or null if unknown. */
export function getModelVehicleType(make: string, model: string): VT | null {
  return MODEL_TYPES[make]?.[model] ?? null;
}
