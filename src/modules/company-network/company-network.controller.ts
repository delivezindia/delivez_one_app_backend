import type { RequestHandler } from 'express';
import {
  ABOUT_DELIVEZ,
  COMPANY_OVERVIEW,
  OUR_JOURNEY,
  NETWORK_OVERVIEW,
  NETWORK_HUBS,
} from './company-network.store.js';

export const getAboutDelivez: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: ABOUT_DELIVEZ,
  });
};

export const getCompanyOverview: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: COMPANY_OVERVIEW,
  });
};

export const getOurJourney: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: OUR_JOURNEY,
  });
};

export const getNetworkOverview: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: NETWORK_OVERVIEW,
  });
};

export const getNetworkHubs: RequestHandler = (req, res) => {
  const { search, region } = req.query;
  let filtered = [...NETWORK_HUBS];

  if (region && typeof region === 'string') {
    const cleanRegion = region.trim().toLowerCase();
    if (cleanRegion !== 'all') {
      filtered = filtered.filter(
        (h) => h.region.toLowerCase() === cleanRegion || h.type.toLowerCase().includes(cleanRegion)
      );
    }
  }

  if (search && typeof search === 'string') {
    const query = search.trim().toLowerCase();
    filtered = filtered.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.city.toLowerCase().includes(query) ||
        h.pincodeRange.toLowerCase().includes(query) ||
        h.type.toLowerCase().includes(query)
    );
  }

  const regionCounts = {
    all: NETWORK_HUBS.length,
    north: NETWORK_HUBS.filter((h) => h.region === 'North').length,
    south: NETWORK_HUBS.filter((h) => h.region === 'South').length,
    west: NETWORK_HUBS.filter((h) => h.region === 'West').length,
    east: NETWORK_HUBS.filter((h) => h.region === 'East').length,
  };

  res.status(200).json({
    status: 'success',
    data: {
      hubs: filtered,
      totalCount: filtered.length,
      regionCounts,
    },
  });
};
