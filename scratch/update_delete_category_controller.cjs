const fs = require('fs');

const controllerPath = 'c:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/gift-delivery/gift-delivery-admin.controller.ts';
let code = fs.readFileSync(controllerPath, 'utf8');

const oldDeleteCategory = `export async function deleteAdminCategory(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const existing = await prisma.giftCategory.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!existing) {
    throw new AppError(404, 'Category not found.');
  }

  if (existing._count.products > 0) {
    // Soft deactivate instead of hard cascade to preserve product links
    await prisma.giftCategory.update({
      where: { id },
      data: { isActive: false },
    });
    res.status(200).json({
      status: 'success',
      message: \`Category deactivated (contains \${existing._count.products} products).\`,
    });
    return;
  }

  await prisma.giftCategory.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: 'Category deleted successfully.',
  });
}`;

const newDeleteCategory = `export async function deleteAdminCategory(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const existing = await prisma.giftCategory.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!existing) {
    throw new AppError(404, 'Category not found.');
  }

  // Delete associated products and product images if any to maintain clean referential integrity
  const products = await prisma.giftProduct.findMany({
    where: { categoryId: id },
    select: { id: true },
  });

  const productIds = products.map((p) => p.id);
  if (productIds.length > 0) {
    await prisma.giftProductImage.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.giftProduct.deleteMany({
      where: { categoryId: id },
    });
  }

  // Delete the category
  await prisma.giftCategory.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: \`Category "\${existing.name}" deleted successfully.\`,
    data: { deletedCategoryId: id },
  });
}`;

if (code.includes(oldDeleteCategory)) {
  code = code.replace(oldDeleteCategory, newDeleteCategory);
  fs.writeFileSync(controllerPath, code, 'utf8');
  console.log('Updated deleteAdminCategory in controller');
} else {
  console.log('Target string for deleteAdminCategory not found directly, checking lines...');
}
