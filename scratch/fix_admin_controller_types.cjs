const fs = require('fs');

const controllerPath = 'c:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/gift-delivery/gift-delivery-admin.controller.ts';
let code = fs.readFileSync(controllerPath, 'utf8');

// Replace { id } = req.params with const id = String(req.params.id)
code = code.replace(/const \{ id \} = req\.params;/g, 'const id = String(req.params.id);');

// Replace req.query destructuring
code = code.replace(
  `  const {
    search,
    status,
    paymentStatus,
    deliveryType,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    sortBy = 'createdAt',
    sortDir = 'desc',
  } = req.query;`,
  `  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const paymentStatus = typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus : undefined;
  const deliveryType = typeof req.query.deliveryType === 'string' ? req.query.deliveryType : undefined;
  const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;
  const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;
  const minAmount = req.query.minAmount;
  const maxAmount = req.query.maxAmount;
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt';
  const sortDir = req.query.sortDir === 'asc' ? 'asc' : 'desc';`
);

code = code.replace(
  `  const { categoryId, search, isAvailable } = req.query;`,
  `  const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const isAvailable = req.query.isAvailable;`
);

fs.writeFileSync(controllerPath, code, 'utf8');
console.log('Fixed types in gift-delivery-admin.controller.ts');
