import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDynamicPricing } from './pricing';

test('calculateDynamicPricing keeps included package distance and time free', () => {
  const breakdown = calculateDynamicPricing({
    basePrice: 50,
    kilometers: 18,
    minutes: 30,
    vehicleType: 'mini',
    pricePerKm: 12,
    pricePerMinute: 2,
    surgeMultiplier: 1.3,
    platformFee: 15,
    taxes: 0.12,
    discounts: 20,
    tollCharges: 0,
    airportParkingFee: 0,
  });

  assert.equal(breakdown.baseFare, 50);
  assert.equal(breakdown.distanceCharge, 0);
  assert.equal(breakdown.timeCharge, 0);
  assert.equal(breakdown.surgeAmount, 15);
  assert.equal(breakdown.platformFee, 15);
  assert.equal(breakdown.taxAmount, 9.6);
  assert.equal(breakdown.discountAmount, 20);
  assert.equal(breakdown.totalCost, 120);
});

test('calculateDynamicPricing charges only extras beyond the package', () => {
  const breakdown = calculateDynamicPricing({
    basePrice: 1800,
    kilometers: 100,
    minutes: 540,
    pricePerKm: 16,
    pricePerMinute: 2.5,
    baseKm: 80,
    driverAllowance: 0,
    platformFee: 0,
    taxRate: 0,
  });

  assert.equal(breakdown.distanceCharge, 320);
  assert.equal(breakdown.timeCharge, 150);
  assert.equal(breakdown.totalCost, 2270);
});

test('calculateDynamicPricing multiplies the fare for the requested cab count', () => {
  const oneCab = calculateDynamicPricing({
    basePrice: 1800,
    kilometers: 80,
    minutes: 480,
    pricePerKm: 16,
    baseKm: 80,
    platformFee: 15,
    taxRate: 0.12,
  });
  const threeCabs = calculateDynamicPricing({
    basePrice: 1800,
    kilometers: 80,
    minutes: 480,
    pricePerKm: 16,
    baseKm: 80,
    platformFee: 15,
    taxRate: 0.12,
    tripMultiplier: 3,
  });

  assert.equal(threeCabs.totalCost, oneCab.totalCost * 3);
});
