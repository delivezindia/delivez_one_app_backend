import type { Request, RequestHandler } from 'express';
import {
  SCHEDULE_PICKUP_CONFIG,
  createScheduledPickup,
  getAllPickups,
  getPickupById,
  cancelScheduledPickup,
} from './schedule-pickup.store.js';
import type { CreateScheduledPickupInput } from './schedule-pickup.types.js';

export const getSchedulePickupConfigHandler: RequestHandler = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: SCHEDULE_PICKUP_CONFIG,
  });
};

export const createScheduledPickupHandler: RequestHandler = (req, res) => {
  const body = req.body || {};
  const defaultDate = SCHEDULE_PICKUP_CONFIG.availableDates[0]?.display || 'Today 10 Sep';

  const input: CreateScheduledPickupInput = {
    pickupAddress: body.pickupAddress || body.address || SCHEDULE_PICKUP_CONFIG.defaultAddress,
    pickupDate: body.pickupDate || body.date || defaultDate,
    pickupTimeSlot: body.pickupTimeSlot || body.timeSlot || body.time_slot || '9:00 AM - 12:00 PM',
    noOfPackages: Number(body.noOfPackages || body.no_of_packages || body.packages) || 1,
    approxWeightKg: Number(body.approxWeightKg || body.approx_weight_kg || body.weight) || 1.5,
    packageSize: body.packageSize || body.package_size || 'Small (Upto 5 kg)',
    specialInstructions: body.specialInstructions || body.special_instructions || '',
  };

  const record = createScheduledPickup(input);

  res.status(201).json({
    status: 'success',
    message: 'Pickup scheduled successfully',
    data: record,
  });
};

export const listScheduledPickupsHandler: RequestHandler = (req, res) => {
  const pickups = getAllPickups();
  res.status(200).json({
    status: 'success',
    data: {
      total: pickups.length,
      pickups,
    },
  });
};

export const getScheduledPickupByIdHandler: RequestHandler = (req, res) => {
  const rawId = typeof req.params.id === 'string' ? req.params.id : '';
  const pickup = getPickupById(rawId);

  if (!pickup) {
    res.status(404).json({
      status: 'fail',
      message: `Scheduled pickup with ID '${rawId}' not found`,
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    data: pickup,
  });
};

export const cancelScheduledPickupHandler: RequestHandler = (req, res) => {
  const rawId = typeof req.params.id === 'string' ? req.params.id : '';
  const cancelled = cancelScheduledPickup(rawId);

  if (!cancelled) {
    res.status(404).json({
      status: 'fail',
      message: `Scheduled pickup with ID '${rawId}' not found`,
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    message: 'Scheduled pickup cancelled successfully',
    data: cancelled,
  });
};
