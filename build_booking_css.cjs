const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const cssPath = path.join(webRoot, 'src', 'pages', 'return-pickup', 'ReturnPickupBookingPage.module.css');

const cssContent = `/* ReturnPickupBookingPage.module.css */
.pageWrapper {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #0f172a;
}

.topHeader {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.headerContainer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
}

.brandRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.brandTitle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brandLogo {
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: #0f172a;
}

.brandBadge {
  background: #fef3c7;
  color: #b45309;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.securePill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ecfdf5;
  color: #059669;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  margin-left: 8px;
}

.headerMeta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.walletPill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 8px;
}

/* Stepper Navigation */
.stepperContainer {
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}

.stepperRail {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.stepperRail::before {
  content: '';
  position: absolute;
  top: 14px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.stepItem {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.stepCircle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #cbd5e1;
  transition: all 0.2s ease;
}

.stepItem.active .stepCircle {
  background: #d97706;
  color: #ffffff;
  border-color: #d97706;
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.15);
}

.stepItem.completed .stepCircle {
  background: #16a34a;
  color: #ffffff;
  border-color: #16a34a;
}

.stepLabel {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.stepItem.active .stepLabel {
  color: #d97706;
  font-weight: 700;
}

.stepItem.completed .stepLabel {
  color: #0f172a;
}

/* Main Layout */
.mainLayout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.wizardGrid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
  align-items: start;
}

.formColumn {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.errorBanner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  border: 1px solid #fecaca;
}

/* Step Card */
.stepCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stepHeader {
  margin-bottom: 24px;
}

.stepBadge {
  display: inline-block;
  background: #fef3c7;
  color: #b45309;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.stepHeader h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.stepHeader p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* Step 1: Return Types Grid */
.typeGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.typeCard {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.typeCard:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.typeCard.selectedType {
  border-color: #d97706;
  background: #fffbeb;
}

.typeIconWrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f8fafc;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.selectedType .typeIconWrapper {
  background: #fef3c7;
}

.typeContent {
  flex: 1;
}

.typeContent strong {
  display: block;
  font-size: 0.95rem;
  color: #0f172a;
  margin-bottom: 2px;
}

.typeContent p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  line-height: 1.35;
}

.radioDot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.selectedType .radioDot,
.selectedService .radioDot,
.selectedPay .radioDot {
  border-color: #d97706;
}

.radioInner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d97706;
}

/* Step 2: Destinations */
.destinationGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.destCard {
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.destCard:hover {
  border-color: #cbd5e1;
}

.destCard.selectedDest {
  border-color: #d97706;
  background: #fffbeb;
}

.destIcon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selectedDest .destIcon {
  background: #fef3c7;
}

.destCard strong {
  font-size: 0.88rem;
  color: #0f172a;
}

.destCard small {
  font-size: 0.72rem;
  color: #64748b;
  line-height: 1.25;
}

.storeSearchBox {
  margin-bottom: 24px;
}

.storeSearchBox label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.searchInputWrap {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 14px;
  background: #ffffff;
}

.searchInputWrap input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  color: #0f172a;
}

.subHeading {
  margin-bottom: 12px;
}

.subHeading span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recentStoreList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.storePillCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.storePillCard:hover {
  border-color: #cbd5e1;
  background: #ffffff;
}

.storePillCard.selectedStore {
  border-color: #d97706;
  background: #fffbeb;
}

.storeTitle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.storeTitle strong {
  font-size: 0.92rem;
  color: #0f172a;
}

.verifiedTag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #ecfdf5;
  color: #059669;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.storeMain small {
  font-size: 0.78rem;
  color: #64748b;
}

.selectStoreBtn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.selectedStore .selectStoreBtn {
  background: #d97706;
  color: #ffffff;
  border-color: #d97706;
}

/* Step 3: Address Forms */
.addressFormBlock {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.blockTitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.98rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.addressTypeTabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.addressTypeTabs button {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.addressTypeTabs button.activeTab {
  background: #d97706;
  color: #ffffff;
  border-color: #d97706;
}

.formRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 14px;
}

.formRowThree {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.formGroup label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

.labelWithAction {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.labelWithAction label {
  margin: 0;
}

.gpsBtn {
  background: none;
  border: none;
  color: #d97706;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.formGroup input,
.formGroup select,
.formGroup textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88rem;
  background: #ffffff;
  color: #0f172a;
  outline: none;
  font-family: inherit;
}

.formGroup input:focus,
.formGroup select:focus,
.formGroup textarea:focus {
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
}

.charCount {
  font-size: 0.72rem;
  color: #94a3b8;
  text-align: right;
}

/* Step 4: Auto-detect & Items */
.autoDetectBanner {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.autoDetectHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.autoDetectTitle {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #92400e;
}

.demoFillBtn {
  background: #d97706;
  color: #ffffff;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.autoDetectBanner p {
  font-size: 0.85rem;
  color: #78350f;
  margin: 0 0 10px;
}

.detectPills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detectPills span {
  background: #fde68a;
  color: #78350f;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
}

.quantityPicker {
  display: flex;
  gap: 8px;
}

.quantityPicker button {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.quantityPicker button.activeQty {
  background: #d97706;
  color: #ffffff;
  border-color: #d97706;
}

.conditionSection,
.handlingSection,
.documentsSection {
  margin-top: 20px;
}

.conditionSection label,
.handlingSection label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.conditionGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.condCard {
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.condCard.selectedCond {
  border-color: #d97706;
  background: #fffbeb;
}

.condCard strong {
  display: block;
  font-size: 0.85rem;
  color: #0f172a;
}

.condCard small {
  font-size: 0.72rem;
  color: #64748b;
}

.tagChips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tagChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.tagChip.activeTag {
  background: #d97706;
  color: #ffffff;
  border-color: #d97706;
}

.docUploadGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.docCard {
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 14px;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.docTitleRow {
  display: flex;
  align-items: center;
  gap: 6px;
}

.docTitleRow strong {
  font-size: 0.85rem;
  color: #0f172a;
}

.docBadge {
  font-size: 0.68rem;
  font-weight: 700;
  background: #e2e8f0;
  color: #475569;
  padding: 1px 6px;
  border-radius: 4px;
}

.docInfo small {
  font-size: 0.72rem;
  color: #64748b;
  display: block;
}

.uploadDocBtn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.uploadedList {
  margin-top: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.docItemsRow {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.uploadedDocItem {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 0.8rem;
  font-weight: 600;
}

.uploadedDocItem button {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  display: flex;
}

/* Step 5: Schedule & Speed */
.scheduleBlock label,
.servicesBlock label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.datePillsRow {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.datePill {
  min-width: 90px;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.datePill.selectedDate {
  border-color: #d97706;
  background: #fffbeb;
}

.pillDay {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

.selectedDate .pillDay {
  color: #d97706;
}

.pillDate {
  display: block;
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f172a;
}

.timeSlotsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.slotPill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  position: relative;
}

.slotPill.selectedSlot {
  border-color: #d97706;
  background: #fffbeb;
  color: #d97706;
}

.fastestTag {
  position: absolute;
  top: -6px;
  right: 6px;
  background: #16a34a;
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.serviceCardsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.serviceSpeedCard {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
}

.serviceSpeedCard.selectedService {
  border-color: #d97706;
  background: #fffbeb;
}

.srvTopRow {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.srvNameRow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.srvNameRow strong {
  font-size: 0.95rem;
  color: #0f172a;
}

.srvBadge {
  font-size: 0.68rem;
  font-weight: 800;
  background: #fef3c7;
  color: #b45309;
  padding: 1px 6px;
  border-radius: 4px;
}

.srvTitleCol small {
  font-size: 0.78rem;
  color: #64748b;
  display: block;
}

.srvPrice strong {
  font-size: 1.1rem;
  color: #0f172a;
}

.srvBottomRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.etaPill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #059669;
}

.protectionCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
}

.protLeft {
  display: flex;
  align-items: center;
  gap: 14px;
}

.protLeft strong {
  display: block;
  font-size: 0.92rem;
  color: #166534;
}

.protLeft p {
  font-size: 0.8rem;
  color: #15803d;
  margin: 2px 0 0;
}

.protRight {
  display: flex;
  align-items: center;
  gap: 12px;
}

.protPrice {
  font-size: 0.95rem;
  font-weight: 800;
  color: #166534;
}

.protRight input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: #16a34a;
  cursor: pointer;
}

/* Step 6: Review & Payments */
.reviewBlocks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.reviewItem {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.reviewIcon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fef3c7;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reviewDetails {
  flex: 1;
}

.reviewDetails small {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.5px;
}

.reviewDetails strong {
  font-size: 0.92rem;
  color: #0f172a;
}

.reviewDetails p {
  font-size: 0.82rem;
  color: #64748b;
  margin: 2px 0 0;
}

.reviewItem button {
  background: none;
  border: none;
  color: #d97706;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.couponBox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #fffbeb;
  margin-bottom: 24px;
}

.couponBox input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.9rem;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
}

.applyCouponBtn {
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.paymentMethodsSection label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 10px;
}

.paymentGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.payCard {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}

.payCard.selectedPay {
  border-color: #d97706;
  background: #fffbeb;
}

.payIcon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selectedPay .payIcon {
  background: #fef3c7;
}

.payInfo {
  flex: 1;
}

.payInfo strong {
  display: block;
  font-size: 0.92rem;
  color: #0f172a;
}

.payInfo small {
  font-size: 0.78rem;
  color: #64748b;
}

/* Wizard Footer Navigation */
.wizardFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.backBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.nextBtn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(217, 119, 6, 0.25);
  transition: all 0.2s;
}

.nextBtn:hover {
  background: #b45309;
}

.confirmPayBtn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #16a34a;
  color: #ffffff;
  border: none;
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(22, 163, 74, 0.25);
  transition: all 0.2s;
}

.confirmPayBtn:hover {
  background: #15803d;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Right Column: Sticky Summary */
.summaryColumn {
  position: relative;
}

.stickyCard {
  position: sticky;
  top: 130px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.sidebarHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
}

.sidebarHeader h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.sidebarHeader small {
  font-size: 0.72rem;
  font-weight: 800;
  color: #b45309;
  letter-spacing: 0.5px;
}

.sidebarDetails {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.sideItem small {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.sideItem strong {
  font-size: 0.88rem;
  color: #0f172a;
}

.productSnippet {
  font-size: 0.82rem;
  color: #334155;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.priceBreakdown {
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}

.priceBreakdown h4 {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px;
}

.priceRow {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 8px;
}

.discountRow {
  color: #16a34a;
  font-weight: 700;
}

.totalRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
  margin-top: 10px;
}

.totalRow strong {
  font-size: 1rem;
  color: #0f172a;
}

.totalRow small {
  display: block;
  font-size: 0.72rem;
  color: #94a3b8;
}

.totalPrice {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
}

.guaranteeBadge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  color: #166534;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  margin-top: 20px;
}

/* Confirmation Hero (Step 7) */
.confirmationHero {
  max-width: 680px;
  margin: 40px auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.confCheckIcon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #dcfce7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.confirmationHero h1 {
  font-size: 1.8rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 8px;
}

.confSub {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 24px;
  line-height: 1.5;
}

.bookingIdCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 14px 20px;
  margin-bottom: 24px;
  text-align: left;
}

.bookingIdCard small {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  display: block;
}

.bookingIdCard strong {
  font-size: 1.15rem;
  color: #0f172a;
  font-family: monospace;
}

.copyBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.confSummaryGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 32px;
  text-align: left;
}

.confSummaryItem {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f8fafc;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.confSummaryItem small {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  display: block;
}

.confSummaryItem strong {
  font-size: 0.85rem;
  color: #0f172a;
}

.confActions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.primaryConfBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
}

.secondaryConfBtn {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.outlineConfBtn {
  background: transparent;
  color: #64748b;
  border: none;
  padding: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .wizardGrid {
    grid-template-columns: 1fr;
  }
  .stickyCard {
    position: static;
  }
  .formRow,
  .formRowThree,
  .serviceCardsGrid,
  .docUploadGrid,
  .confSummaryGrid {
    grid-template-columns: 1fr;
  }
  .conditionGrid {
    grid-template-columns: 1fr;
  }
}
`;

fs.writeFileSync(cssPath, cssContent);
console.log('✓ ReturnPickupBookingPage.module.css written');
