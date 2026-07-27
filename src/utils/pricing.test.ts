import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDynamicPricing } from './pricing';

test('calculateDynamicPricing applies base, distance, time, surge, fees, and discounts', () => {
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
  assert.equal(breakdown.distanceCharge, 216);
  assert.equal(breakdown.timeCharge, 60);
  assert.equal(breakdown.surgeAmount, 97.8);
  assert.equal(breakdown.platformFee, 15);
  assert.equal(breakdown.taxAmount, 52.66);
  assert.equal(breakdown.discountAmount, 20);
  assert.equal(breakdown.totalCost, 471.46);
});
