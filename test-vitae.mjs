#!/usr/bin/env node
/**
 * Vitae Health Tracker — core logic tests
 * Run: node test-vitae.mjs
 */

const CONVERSION = {
  LB_TO_KG: 0.45359237,
  KG_TO_LB: 1 / 0.45359237,
  IN_TO_CM: 2.54,
  CM_TO_IN: 1 / 2.54
};

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.error(`  ✗ ${msg}`); }
}

function calcBMI(weightKg, heightCm) {
  const hM = heightCm / 100;
  return weightKg / (hM * hM);
}

function lbToKg(lb) { return lb * CONVERSION.LB_TO_KG; }
function inToCm(inches) { return inches * CONVERSION.IN_TO_CM; }
function imperialToMetric(lb, ft, inches) {
  return { weightKg: lbToKg(lb), heightCm: inToCm(ft * 12 + inches) };
}

function getCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', key: 'underweight' };
  if (bmi < 25) return { label: 'Healthy Weight', key: 'normal' };
  if (bmi < 30) return { label: 'Overweight', key: 'overweight' };
  if (bmi < 35) return { label: 'Obesity Class I', key: 'obese' };
  if (bmi < 40) return { label: 'Obesity Class II', key: 'obese' };
  return { label: 'Obesity Class III (Severe)', key: 'obese' };
}

function escapeCSV(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function parseCSVLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { result.push(cur); cur = ''; }
      else cur += c;
    }
  }
  result.push(cur);
  return result;
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

console.log('\nVitae Health Tracker — Tests\n');

console.log('NIST Conversion Factors');
assert(Math.abs(CONVERSION.LB_TO_KG - 0.45359237) < 0.0000001, 'LB_TO_KG = 0.45359237 (NIST)');
assert(Math.abs(CONVERSION.IN_TO_CM - 2.54) < 0.0000001, 'IN_TO_CM = 2.54 (exact)');
assert(Math.abs(lbToKg(1) - 0.45359237) < 0.0000001, '1 lb → 0.45359237 kg');

console.log('\nBMI Calculation (metric)');
const bmi1 = calcBMI(72.5, 175);
assert(Math.abs(bmi1 - 23.7) < 0.1, `BMI 72.5kg/175cm ≈ 23.7 (got ${bmi1.toFixed(1)})`);

console.log('\nBMI Calculation (imperial — CDC 5\'9" / 160 lb example)');
const cdc = imperialToMetric(160, 5, 9);
const bmiCdc = calcBMI(cdc.weightKg, cdc.heightCm);
assert(Math.abs(cdc.weightKg - 72.5748) < 0.01, `160 lb → ${cdc.weightKg.toFixed(4)} kg`);
assert(Math.abs(cdc.heightCm - 175.26) < 0.01, `5'9" → ${cdc.heightCm.toFixed(2)} cm`);
assert(getCategory(bmiCdc).label === 'Healthy Weight', `CDC example BMI ${bmiCdc.toFixed(1)} = Healthy Weight`);
assert(bmiCdc >= 18.5 && bmiCdc < 25, 'CDC example in healthy range 18.5–24.9');

console.log('\nWHO/CDC Categories');
assert(getCategory(17.0).label === 'Underweight', 'BMI 17.0 Underweight');
assert(getCategory(22.0).label === 'Healthy Weight', 'BMI 22.0 Healthy Weight');
assert(getCategory(27.0).label === 'Overweight', 'BMI 27.0 Overweight');
assert(getCategory(32.0).label === 'Obesity Class I', 'BMI 32.0 Obesity Class I');
assert(getCategory(37.0).label === 'Obesity Class II', 'BMI 37.0 Obesity Class II');
assert(getCategory(42.0).label === 'Obesity Class III (Severe)', 'BMI 42.0 Obesity Class III');

console.log('\nOld vs NIST conversion difference');
const oldKg = 160 / 2.205;
const newKg = lbToKg(160);
assert(Math.abs(newKg - oldKg) > 0.01, `NIST (${newKg.toFixed(3)}) differs from legacy 2.205 divisor (${oldKg.toFixed(3)})`);

console.log('\nGoal weight unit display (canonical kg storage)');
function kgToLb(kg) { return kg * CONVERSION.KG_TO_LB; }
function displayWeightFromKg(kg, unitSystem) {
  return unitSystem === 'metric' ? kg.toFixed(1) : kgToLb(kg).toFixed(1);
}
function parseWeightInput(val, unitSystem) {
  const n = parseFloat(val);
  if (!n || n <= 0) return null;
  return unitSystem === 'metric' ? n : lbToKg(n);
}
const targetKg = 70;
const imperialDisplay = displayWeightFromKg(targetKg, 'imperial');
assert(parseFloat(imperialDisplay) > 150 && parseFloat(imperialDisplay) < 160, `70 kg displays as ~154 lb (got ${imperialDisplay})`);
assert(Math.abs(parseWeightInput(imperialDisplay, 'imperial') - targetKg) < 0.2, '154 lb round-trips to ~70 kg');
assert(displayWeightFromKg(parseWeightInput('154.3', 'imperial'), 'imperial') === '154.3', 'lb input preserved on display');

console.log('\nCSV dual-unit import helpers');
function cmToIn(cm) { return cm * CONVERSION.CM_TO_IN; }
function heightToImperialParts(cm) {
  const totalIn = cmToIn(cm);
  return { ft: Math.floor(totalIn / 12), inches: Math.round((totalIn % 12) * 10) / 10 };
}
function parseCSVWeightKg(cols, header) {
  const kgIdx = header.indexOf('weight_kg');
  const lbIdx = header.indexOf('weight_lb');
  const kg = kgIdx >= 0 ? parseFloat(cols[kgIdx]) : NaN;
  const lb = lbIdx >= 0 ? parseFloat(cols[lbIdx]) : NaN;
  if (kg > 0) return kg;
  if (lb > 0) return lbToKg(lb);
  return null;
}
function parseCSVHeightCm(cols, header) {
  const cmIdx = header.indexOf('height_cm');
  const ftIdx = header.indexOf('height_ft');
  const inIdx = header.indexOf('height_in');
  const cm = cmIdx >= 0 ? parseFloat(cols[cmIdx]) : NaN;
  if (cm > 0) return cm;
  const ft = ftIdx >= 0 ? parseFloat(cols[ftIdx]) : NaN;
  const inches = inIdx >= 0 ? parseFloat(cols[inIdx]) : NaN;
  const hasFt = ftIdx >= 0 && !isNaN(ft) && ft > 0;
  const hasIn = inIdx >= 0 && !isNaN(inches) && inches >= 0;
  if (hasFt || hasIn) {
    const totalIn = (hasFt ? ft * 12 : 0) + (hasIn ? inches : 0);
    if (totalIn > 0) return inToCm(totalIn);
  }
  return null;
}

const fullHeader = 'date,weight_kg,weight_lb,height_cm,height_ft,height_in,bmi'.split(',');
const metricRow = ['2026-01-15', '72.5', '', '175', '', '', '23.7'];
const imperialRow = ['2026-01-16', '', '160', '', '5', '9', '23.6'];
const legacyHeader = 'date,weight_kg,height_cm,bmi'.split(',');
const legacyRow = ['2026-01-17', '70', '170', '24.2'];

assert(Math.abs(parseCSVWeightKg(metricRow, fullHeader) - 72.5) < 0.01, 'import weight from kg column');
assert(Math.abs(parseCSVWeightKg(imperialRow, fullHeader) - lbToKg(160)) < 0.01, 'import weight from lb column when kg empty');
assert(Math.abs(parseCSVHeightCm(metricRow, fullHeader) - 175) < 0.01, 'import height from cm column');
assert(Math.abs(parseCSVHeightCm(imperialRow, fullHeader) - inToCm(69)) < 0.5, 'import height from ft+in when cm empty');
assert(Math.abs(parseCSVWeightKg(legacyRow, legacyHeader) - 70) < 0.01, 'legacy CSV weight_kg still imports');
assert(Math.abs(parseCSVHeightCm(legacyRow, legacyHeader) - 170) < 0.01, 'legacy CSV height_cm still imports');

const imp = heightToImperialParts(175.26);
assert(imp.ft === 5 && Math.abs(imp.inches - 9) < 0.2, `175.26 cm exports as 5'9" (got ${imp.ft}'${imp.inches}")`);
assert(Math.abs(kgToLb(72.5) - 159.84) < 0.1, 'export lb column from kg');

console.log('\nDate Helpers');
assert(daysInMonth(2026, 2) === 28, 'Feb 2026 has 28 days');
assert(daysInMonth(2024, 2) === 29, 'Feb 2024 leap year');

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'─'.repeat(40)}\n`);

process.exit(failed > 0 ? 1 : 0);