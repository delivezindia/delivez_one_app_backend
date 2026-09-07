import type { RequestHandler } from 'express';

import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { validateSavedAddress } from '../personal-courier/courier.validation.js';

const serializeAddress = (address: any) => ({
  ...address,
  latitude: address.latitude === null ? null : Number(address.latitude),
  longitude: address.longitude === null ? null : Number(address.longitude),
});

export const listAddresses: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const addresses = await prisma.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  });

  res.status(200).json({
    status: 'success',
    data: { addresses: addresses.map(serializeAddress) },
  });
};

export const createAddress: RequestHandler = async (req, res) => {
  const input = validateSavedAddress(req.body);
  const userId = req.user!.id;

  const address = await prisma.$transaction(async (transaction) => {
    const existingCount = await transaction.userAddress.count({
      where: { userId },
    });
    const isDefault = input.isDefault || existingCount === 0;

    if (isDefault) {
      await transaction.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return transaction.userAddress.create({
      data: {
        ...input,
        isDefault,
        userId,
      },
    });
  });

  res.status(201).json({
    status: 'success',
    data: { address: serializeAddress(address) },
  });
};

export const updateAddress: RequestHandler = async (req, res) => {
  const input = validateSavedAddress(req.body);
  const userId = req.user!.id;
  const addressId = String(req.params.id);

  const address = await prisma.$transaction(async (transaction) => {
    const existing = await transaction.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new AppError(404, 'Saved address not found.');
    }

    if (input.isDefault) {
      await transaction.userAddress.updateMany({
        where: { userId, id: { not: existing.id } },
        data: { isDefault: false },
      });
    }

    return transaction.userAddress.update({
      where: { id: existing.id },
      data: {
        ...input,
        isDefault: existing.isDefault || input.isDefault,
      },
    });
  });

  res.status(200).json({
    status: 'success',
    data: { address: serializeAddress(address) },
  });
};

export const deleteAddress: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const addressId = String(req.params.id);

  await prisma.$transaction(async (transaction) => {
    const existing = await transaction.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new AppError(404, 'Saved address not found.');
    }

    await transaction.userAddress.delete({
      where: { id: existing.id },
    });

    if (existing.isDefault) {
      const replacement = await transaction.userAddress.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      if (replacement) {
        await transaction.userAddress.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        });
      }
    }
  });

  res.status(204).send();
};
