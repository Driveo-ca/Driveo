/**
 * Vehicle make/model database for autocomplete.
 * Covers the most popular makes and models in the GTA market.
 */

export const VEHICLE_MAKES: Record<string, string[]> = {
  Acura: ['ILX', 'Integra', 'MDX', 'RDX', 'TLX'],
  Audi: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'Q3', 'Q5', 'Q7', 'Q8', 'RS5', 'S4', 'S5'],
  BMW: ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series', 'i4', 'iX', 'X1', 'X3', 'X5', 'X6', 'X7', 'Z4'],
  Buick: ['Enclave', 'Encore', 'Encore GX', 'Envision'],
  Cadillac: ['CT4', 'CT5', 'Escalade', 'Lyriq', 'XT4', 'XT5', 'XT6'],
  Chevrolet: ['Blazer', 'Camaro', 'Colorado', 'Corvette', 'Equinox', 'Malibu', 'Silverado', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse'],
  Chrysler: ['300', 'Grand Caravan', 'Pacifica'],
  Dodge: ['Challenger', 'Charger', 'Durango', 'Hornet', 'RAM 1500', 'RAM 2500'],
  Ferrari: ['296', '488', 'F8', 'Roma', 'SF90'],
  Ford: ['Bronco', 'Bronco Sport', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'F-250', 'Maverick', 'Mustang', 'Ranger'],
  Genesis: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  GMC: ['Acadia', 'Canyon', 'Sierra', 'Terrain', 'Yukon'],
  Honda: ['Accord', 'Civic', 'CR-V', 'HR-V', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'],
  Hyundai: ['Elantra', 'IONIQ 5', 'IONIQ 6', 'Kona', 'Palisade', 'Santa Cruz', 'Santa Fe', 'Sonata', 'Tucson', 'Venue'],
  Infiniti: ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  Jaguar: ['E-PACE', 'F-PACE', 'F-TYPE', 'I-PACE', 'XE', 'XF'],
  Jeep: ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Wagoneer', 'Wagoneer', 'Wrangler'],
  Kia: ['Carnival', 'EV6', 'EV9', 'Forte', 'K5', 'Niro', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Telluride'],
  Lamborghini: ['Huracán', 'Urus'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
  Lexus: ['ES', 'GX', 'IS', 'LC', 'LX', 'NX', 'RC', 'RX', 'TX', 'UX'],
  Lincoln: ['Aviator', 'Corsair', 'Nautilus', 'Navigator'],
  Maserati: ['Ghibli', 'GranTurismo', 'Grecale', 'Levante', 'MC20', 'Quattroporte'],
  Mazda: ['CX-30', 'CX-5', 'CX-50', 'CX-70', 'CX-90', 'Mazda3', 'MX-5 Miata'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'CLA', 'CLE', 'E-Class', 'EQB', 'EQE', 'EQS', 'G-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'S-Class'],
  Mini: ['Clubman', 'Cooper', 'Countryman'],
  Mitsubishi: ['Eclipse Cross', 'Mirage', 'Outlander', 'RVR'],
  Nissan: ['Altima', 'Ariya', 'Frontier', 'Kicks', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa', 'Z'],
  Porsche: ['718', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  RAM: ['1500', '2500', '3500'],
  Rivian: ['R1S', 'R1T'],
  Subaru: ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'Solterra', 'WRX'],
  Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
  Toyota: ['4Runner', 'bZ4X', 'Camry', 'Corolla', 'Corolla Cross', 'Crown', 'GR86', 'Grand Highlander', 'Highlander', 'Land Cruiser', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Supra', 'Tacoma', 'Tundra', 'Venza'],
  Volkswagen: ['Atlas', 'Atlas Cross Sport', 'Golf', 'Golf GTI', 'Golf R', 'ID.4', 'Jetta', 'Taos', 'Tiguan'],
  Volvo: ['C40', 'S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
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
