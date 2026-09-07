const fs = require('fs');

const uiPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/components/AdminGiftDeliveryView.jsx';
let code = fs.readFileSync(uiPath, 'utf8');

// 1. Add handleDeleteCategory after handleSaveCategory
const targetAfterCategorySave = `    try {
      if (editingCategory) {
        await updateAdminGiftCategory(editingCategory.id, formData)
        showToast('Category updated!')
      } else {
        await createAdminGiftCategory(formData)
        showToast('New category created!')
      }
      setCategoryModalOpen(false)
      loadCategories()
      loadMetrics()
    } catch (err) {
      alert(err.message || 'Failed to save category.')
    }
  }`;

const replacementWithDeleteCat = `    try {
      if (editingCategory) {
        await updateAdminGiftCategory(editingCategory.id, formData)
        showToast('Category updated!')
      } else {
        await createAdminGiftCategory(formData)
        showToast('New category created!')
      }
      setCategoryModalOpen(false)
      loadCategories()
      loadMetrics()
    } catch (err) {
      alert(err.message || 'Failed to save category.')
    }
  }

  const handleDeleteCategory = async (cat) => {
    if (!cat) return
    const msg = (cat.productsCount || 0) > 0
      ? \`Category "\${cat.name}" currently contains \${cat.productsCount} products. Deleting this category will also remove its associated products. Are you sure?\`
      : \`Are you sure you want to delete category "\${cat.name}"?\`
    
    if (!window.confirm(msg)) return

    try {
      await deleteAdminGiftCategory(cat.id)
      showToast(\`Category "\${cat.name}" deleted successfully!\`)
      loadCategories()
      loadMetrics()
    } catch (err) {
      alert(err.message || 'Failed to delete category.')
    }
  }`;

if (code.includes(targetAfterCategorySave)) {
  code = code.replace(targetAfterCategorySave, replacementWithDeleteCat);
}

// 2. Update category card actions in Tab 4
const oldCatCardActions = `<div className={styles.catActions}>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => {
                      setEditingCategory(cat)
                      setCategoryForm({
                        name: cat.name,
                        description: cat.description || '',
                        iconName: cat.iconName || 'Gift',
                        displayOrder: cat.displayOrder,
                        isActive: cat.isActive
                      })
                      setCategoryModalOpen(true)
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                </div>`;

const newCatCardActions = `<div className={styles.catActions}>
                  <button
                    type="button"
                    className={styles.catEditBtn}
                    title="Edit Category"
                    onClick={() => {
                      setEditingCategory(cat)
                      setCategoryForm({
                        name: cat.name,
                        description: cat.description || '',
                        iconName: cat.iconName || 'Gift',
                        displayOrder: cat.displayOrder,
                        isActive: cat.isActive
                      })
                      setCategoryModalOpen(true)
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles.catDeleteBtn}
                    title="Delete Category"
                    onClick={() => handleDeleteCategory(cat)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>`;

if (code.includes(oldCatCardActions)) {
  code = code.replace(oldCatCardActions, newCatCardActions);
}

// 3. Add Delete Button inside the Category Modal when editingCategory exists
const oldCatModalButtons = `<div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setCategoryModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>`;

const newCatModalButtons = `<div className={styles.modalActions}>
                {editingCategory && (
                  <button
                    type="button"
                    className={styles.modalDeleteCategoryBtn}
                    onClick={() => {
                      handleDeleteCategory(editingCategory)
                      setCategoryModalOpen(false)
                    }}
                  >
                    <Trash2 size={14} /> Delete Category
                  </button>
                )}
                <button type="button" className={styles.cancelBtn} onClick={() => setCategoryModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>`;

if (code.includes(oldCatModalButtons)) {
  code = code.replace(oldCatModalButtons, newCatModalButtons);
}

fs.writeFileSync(uiPath, code, 'utf8');
console.log('Updated AdminGiftDeliveryView.jsx with category deletion options');

// 4. Update AdminGiftDeliveryView.module.css
const cssPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/components/AdminGiftDeliveryView.module.css';
let css = fs.readFileSync(cssPath, 'utf8');

const extraCss = `
.catActions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.catEditBtn {
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.catEditBtn:hover {
  background: #E2E8F0;
  color: #0F172A;
}

.catDeleteBtn {
  background: #FEE2E2;
  border: 1px solid #FECDD3;
  border-radius: 8px;
  padding: 8px 10px;
  color: #DC2626;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.catDeleteBtn:hover {
  background: #FECDD3;
  color: #B91C1C;
}

.modalDeleteCategoryBtn {
  background: #FEF2F2;
  border: 1.5px solid #FEE2E2;
  color: #DC2626;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  margin-right: auto;
  transition: all 0.2s ease;
}

.modalDeleteCategoryBtn:hover {
  background: #FEE2E2;
  border-color: #FECDD3;
  color: #B91C1C;
}
`;

if (!css.includes('.catDeleteBtn')) {
  fs.writeFileSync(cssPath, css + extraCss, 'utf8');
  console.log('Appended delete category styles to AdminGiftDeliveryView.module.css');
}
