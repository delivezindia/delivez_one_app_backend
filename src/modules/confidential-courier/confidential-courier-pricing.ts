import type { LocationCoordinates } from '../personal-courier/courier-pricing.js';
import {
  CONFIDENTIAL_PRICING_VERSION,
  confidentialDeliverySpeeds,
  confidentialHandoverMethods,
  confidentialSecurityLevels,
} from './confidential-courier-config.js';

export interface ConfidentialCourierQuoteRequest {
  pickup: LocationCoordinates;
  dropoff: LocationCoordinates;
  deliverySpeed: keyof typeof confidentialDeliverySpeeds;
  security: {
    level: keyof typeof confidentialSecurityLevels;
    handoverMethod: keyof typeof confidentialHandoverMethods;
  };
  document: {
    containsOriginals: boolean;
    requiresReturn: boolean;
  };
}

const money = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const haversineDistance = (
  pickup: LocationCoordinates,
  dropoff: LocationCoordinates,
): number | null => {
  if (
    pickup.latitude === null ||
    pickup.longitude === null ||
    dropoff.latitude === null ||
    dropoff.longitude === null
  ) {
    return null;
  }

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(dropoff.latitude - pickup.latitude);
  const longitudeDelta = toRadians(dropoff.longitude - pickup.longitude);
  const firstLatitude = toRadians(pickup.latitude);
  const secondLatitude = toRadians(dropoff.latitude);

  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return money(earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)));
};

export const calculateConfidentialCourierQuote = (
  request: ConfidentialCourierQuoteRequest,
) => {
  const distanceKm = haversineDistance(request.pickup, request.dropoff);
  const baseCharge = confidentialDeliverySpeeds[request.deliverySpeed].baseCharge;
  const distanceCharge =
    distanceKm === null
      ? 0
      : money(Math.max(0, Math.ceil(distanceKm - 5)) * 10);
  const securityCharge =
    confidentialSecurityLevels[request.security.level].charge;
  const handoverCharge =
    confidentialHandoverMethods[request.security.handoverMethod].charge;
  const originalsCharge = request.document.containsOriginals ? 25 : 0;
  const returnCharge = request.document.requiresReturn
    ? money(baseCharge * 0.75)
    : 0;
  const taxAmount = 0;
  const totalAmount = money(
    baseCharge +
      distanceCharge +
      securityCharge +
      handoverCharge +
      originalsCharge +
      returnCharge +
      taxAmount,
  );

  return {
    pricingVersion: CONFIDENTIAL_PRICING_VERSION,
    currency: 'INR',
    distanceKm,
    breakdown: {
      baseCharge: money(baseCharge),
      distanceCharge,
      securityCharge: money(securityCharge),
      handoverCharge: money(handoverCharge),
      originalsCharge,
      returnCharge,
      taxAmount,
    },
    totalAmount,
    note:
      distanceKm === null
        ? 'Distance charges are finalized when route coordinates are available.'
        : null,
  };
};
