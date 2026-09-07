const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';
const pagesDir = path.join(webRoot, 'src/pages/gift-delivery');

const bookingPageCss = `.pageWrapper {
  min-height: 100vh;
  background-color: #F8FAFC;
  color: #0F172A;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding-bottom: 120px;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 12px;
}

.backBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  color: #1E293B;
  transition: background 0.2s;
}

.backBtn:hover {
  background: #F1F5F9;
}

.logoText {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.logoBlack {
  color: #0F172A;
}

.logoYellow {
  color: #F59E0B;
}

.headerRight {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cartIconWrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #F8FAFC;
  color: #1E293B;
}

.cartBadge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #F59E0B;
  color: #000000;
  font-size: 11px;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

/* Step Tracker */
.stepTracker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow-x: auto;
  padding: 14px 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  gap: 8px;
  scrollbar-width: none;
}

.stepTracker::-webkit-scrollbar {
  display: none;
}

.stepItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 60px;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.stepItem.stepActive {
  opacity: 1;
}

.stepItem.stepCompleted {
  opacity: 0.9;
}

.stepIconCircle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F1F5F9;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.stepActive .stepIconCircle {
  background: #E11D48;
  color: #FFFFFF;
  box-shadow: 0 4px 10px rgba(225, 29, 72, 0.3);
}

.stepCompleted .stepIconCircle {
  background: #10B981;
  color: #FFFFFF;
}

.stepTitle {
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
  white-space: nowrap;
}

.stepActive .stepTitle {
  color: #E11D48;
  font-weight: 700;
}

/* Main Container */
.mainContainer {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px;
}

.sectionHeadingGroup {
  margin-bottom: 20px;
}

.stepMainHeading {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 4px;
}

.stepSubHeading {
  font-size: 14px;
  color: #64748B;
}

/* Error Alert */
.errorAlert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FEE2E2;
  color: #991B1B;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.alertClose {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #991B1B;
  cursor: pointer;
}

/* Step 1: Categories Grid */
.categoriesGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

@media (max-width: 480px) {
  .categoriesGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.categoryCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.categoryCard:hover {
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.categoryCardActive {
  border-color: #E11D48;
  background: #FFF1F2;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.12);
}

.categoryIconCircle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #F8FAFC;
  color: #E11D48;
  display: flex;
  align-items: center;
  justify-content: center;
}

.categoryCardActive .categoryIconCircle {
  background: #FFE4E6;
}

.categoryName {
  font-size: 13px;
  font-weight: 700;
  color: #1E293B;
  text-align: center;
}

/* Promo Banner */
.promoBanner {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border: 1px solid #FCD34D;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.promoBannerIcon {
  color: #D97706;
  flex-shrink: 0;
}

.promoBannerText {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.promoBannerText strong {
  font-size: 14px;
  color: #92400E;
}

.promoBannerText span {
  font-size: 12px;
  color: #B45309;
}

/* Filters & Search */
.filtersBar {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.searchBox {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 10px 14px;
  color: #64748B;
}

.searchBox input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #0F172A;
}

.chipRow {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filterChip {
  padding: 8px 16px;
  border-radius: 20px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filterChipActive {
  background: #0F172A;
  color: #FFFFFF;
  border-color: #0F172A;
}

/* Products Grid */
.productsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

@media (max-width: 520px) {
  .productsGrid {
    grid-template-columns: 1fr;
  }
}

.productCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
}

.productCard:hover {
  border-color: #CBD5E1;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.productCardActive {
  border-color: #E11D48;
  box-shadow: 0 6px 18px rgba(225, 29, 72, 0.15);
}

.productImageWrapper {
  position: relative;
  width: 100%;
  height: 160px;
  background: #F1F5F9;
}

.productImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.productBadge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #E11D48;
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.favBtn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.favBtnActive {
  color: #E11D48;
}

.productInfo {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.productTitleRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.productName {
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.3;
}

.productPrice {
  font-size: 16px;
  font-weight: 800;
  color: #E11D48;
  white-space: nowrap;
}

.productDesc {
  font-size: 12px;
  color: #64748B;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.productAttributes {
  display: flex;
  gap: 10px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  background: #F8FAFC;
  padding: 6px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.productRatingRow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.starBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #FEF3C7;
  color: #B45309;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.reviewsCount {
  font-size: 11px;
  color: #94A3B8;
}

.productActionRow {
  margin-top: auto;
}

.addBtn {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  color: #0F172A;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.addBtn:hover {
  background: #E2E8F0;
}

.qtyCounter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  border-radius: 8px;
  padding: 4px 8px;
}

.qtyBtn {
  background: #FFFFFF;
  border: 1px solid #FECDD3;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E11D48;
  cursor: pointer;
}

.qtyValue {
  font-size: 14px;
  font-weight: 800;
  color: #E11D48;
}

/* Expert Help Card */
.expertHelpCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.expertIcon {
  color: #0284C7;
  flex-shrink: 0;
}

.expertText {
  flex: 1;
}

.expertText strong {
  font-size: 14px;
  color: #0F172A;
  display: block;
}

.expertText p {
  font-size: 12px;
  color: #64748B;
  margin: 2px 0 0 0;
}

.expertBtn {
  padding: 8px 14px;
  background: #E0F2FE;
  color: #0369A1;
  border: 1px solid #BAE6FD;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

/* Step 2: Form Styles */
.deliverToToggle {
  margin-bottom: 16px;
}

.fieldLabel {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
  display: block;
}

.togglePills {
  display: flex;
  background: #E2E8F0;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
}

.togglePill {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.togglePillActive {
  background: #FFFFFF;
  color: #0F172A;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.formCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inputWithIcon {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 14px;
  background: #FFFFFF;
}

.inputWithIcon input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #0F172A;
}

.inputIcon {
  color: #94A3B8;
}

.phoneInputRow {
  display: flex;
  gap: 10px;
}

.countryCodeBadge {
  background: #F1F5F9;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
}

.phoneInputRow input {
  flex: 1;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #0F172A;
  outline: none;
}

.labelWithAction {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.useLocationBtn {
  background: transparent;
  border: none;
  color: #E11D48;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.inputRow {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

@media (max-width: 480px) {
  .inputRow {
    grid-template-columns: 1fr;
  }
}

.inputRow input,
.inputRow select {
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #0F172A;
  outline: none;
  background: #FFFFFF;
}

.labelWithCounter {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.charCount {
  font-size: 11px;
  color: #94A3B8;
}

textarea {
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #0F172A;
  outline: none;
  font-family: inherit;
  resize: vertical;
}

.cardPreviewBox {
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cardPreviewLeft {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cardPreviewIcon {
  color: #E11D48;
}

.cardPreviewLeft strong {
  font-size: 13px;
  color: #0F172A;
  display: block;
}

.cardPreviewLeft span {
  font-size: 11px;
  color: #64748B;
}

.changeCardBtn {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #0F172A;
  cursor: pointer;
}

.safetyBanner {
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #065F46;
  font-size: 13px;
  margin-bottom: 20px;
}

.safetyIcon {
  color: #10B981;
  flex-shrink: 0;
}

/* Step 3: Date & Time */
.deliveryTypesGrid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.deliveryTypeCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.deliveryTypeCardActive {
  border-color: #E11D48;
  background: #FFF1F2;
}

.deliveryTypeHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.radioCircle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deliveryTypeCardActive .radioCircle {
  border-color: #E11D48;
}

.radioDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E11D48;
}

.deliveryTypeTitleGroup {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.deliveryTypeTitleGroup strong {
  font-size: 14px;
  color: #0F172A;
}

.typeBadge {
  background: #FEF3C7;
  color: #B45309;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.deliveryTypePrice {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}

.deliveryTypeDesc {
  font-size: 12px;
  color: #64748B;
  margin: 4px 0 2px 28px;
}

.deliveryTypeEta {
  font-size: 11px;
  font-weight: 700;
  color: #10B981;
  margin-left: 28px;
  display: block;
}

.weekBanner {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #475569;
  margin-bottom: 20px;
}

.dateSection {
  margin-bottom: 20px;
}

.dateSubtext {
  font-size: 12px;
  color: #94A3B8;
  margin-bottom: 10px;
  display: block;
}

.dateCarousel {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.datePill {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 68px;
  cursor: pointer;
  transition: all 0.2s;
}

.datePillActive {
  background: #0F172A;
  border-color: #0F172A;
  color: #FFFFFF;
}

.dateDayName {
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
}

.datePillActive .dateDayName {
  color: #CBD5E1;
}

.dateNumber {
  font-size: 16px;
  font-weight: 800;
}

.dateMonth {
  font-size: 11px;
  font-weight: 600;
  color: #94A3B8;
}

.datePillActive .dateMonth {
  color: #94A3B8;
}

.timeSlotSection {
  margin-bottom: 20px;
}

.timeSlotsGrid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeSlotBtn {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.timeSlotBtnActive {
  border-color: #E11D48;
  background: #FFF1F2;
  color: #E11D48;
}

.guaranteeNotice {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #64748B;
  margin-bottom: 20px;
}

/* Step 4: Premium Setup */
.premiumList {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.premiumCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.premiumCardActive {
  border-color: #E11D48;
  background: #FFF1F2;
}

.checkboxCircle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.premiumCardActive .checkboxCircle {
  background: #E11D48;
  border-color: #E11D48;
}

.addonCardActive .checkboxCircle {
  background: #E11D48;
  border-color: #E11D48;
}

.premiumDetails {
  flex: 1;
}

.premiumTitleRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.premiumTitleRow strong {
  font-size: 15px;
  color: #0F172A;
  flex: 1;
}

.badgePopular {
  background: #FEF3C7;
  color: #B45309;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.badgeNew {
  background: #E0F2FE;
  color: #0369A1;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.badgeBestValue {
  background: #DCFCE7;
  color: #15803D;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.premiumPrice {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}

.premiumDesc {
  font-size: 13px;
  color: #64748B;
  line-height: 1.4;
  margin: 0;
}

.inclusionsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 10px;
  background: #FFFFFF;
  padding: 10px;
  border-radius: 8px;
}

.inclusionItem {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.addonCounterBar {
  background: #0F172A;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 20px;
}

/* Step 5: Add-ons */
.addonsGrid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.addonCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.addonCardActive {
  border-color: #E11D48;
  background: #FFF1F2;
}

.addonHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.addonTitleBlock {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.addonTitleBlock strong {
  font-size: 14px;
  color: #0F172A;
}

.addonPrice {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}

.addonDesc {
  font-size: 12px;
  color: #64748B;
  margin: 0 0 0 34px;
}

/* Step 6: Review & Pay */
.reviewCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
}

.reviewCardHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.productReviewRow {
  display: flex;
  gap: 12px;
}

.reviewProductThumb {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
}

.reviewProductName {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 2px 0;
}

.reviewProductSub {
  font-size: 12px;
  color: #64748B;
  margin: 0 0 4px 0;
}

.reviewProductMeta {
  display: flex;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

.reviewCardPriceRow {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.reviewProductPrice {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
}

.editLinkBtn {
  background: transparent;
  border: none;
  color: #E11D48;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.cardTitleWithEdit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cardTitleWithEdit strong {
  font-size: 15px;
  color: #0F172A;
}

.reviewDetailRow {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #475569;
  margin-bottom: 8px;
}

.detailLabel {
  font-size: 11px;
  color: #94A3B8;
  display: block;
}

.italicMessage {
  font-style: italic;
  color: #BE185D;
  margin: 2px 0 0 0;
}

/* Coupon Card */
.couponCard {
  background: #FFFFFF;
  border: 1.5px dashed #CBD5E1;
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.couponIcon {
  color: #E11D48;
}

.couponCard input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 700;
  color: #0F172A;
  text-transform: uppercase;
}

.applyCouponBtn {
  background: #0F172A;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Bill Card */
.billCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
}

.billHeading {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 12px 0;
}

.billRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #475569;
  margin-bottom: 8px;
}

.discountRow {
  color: #10B981;
  font-weight: 600;
}

.totalPayableRow {
  border-top: 1px dashed #E2E8F0;
  padding-top: 10px;
  margin-top: 6px;
  font-size: 16px;
  color: #0F172A;
}

.totalYellow {
  color: #F59E0B;
  font-size: 18px;
}

.securePaymentBanner {
  background: #FEF3C7;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.secureShieldIcon {
  color: #E11D48;
  flex-shrink: 0;
}

.securePaymentBanner strong {
  font-size: 14px;
  color: #0F172A;
  display: block;
}

.securePaymentBanner p {
  font-size: 12px;
  color: #64748B;
  margin: 2px 0 0 0;
}

/* Payment Methods */
.paymentMethodsCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.paymentOption {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.paymentOptionActive {
  border-color: #F59E0B;
  background: #FFFBEB;
}

.paymentInfoBlock {
  display: flex;
  flex-direction: column;
}

.paymentInfoBlock strong {
  font-size: 14px;
  color: #0F172A;
}

.paymentInfoBlock span {
  font-size: 11px;
  color: #64748B;
}

.termsNote {
  text-align: center;
  font-size: 11px;
  color: #94A3B8;
  margin-top: 10px;
}

/* Sticky Bottom Action Bars */
.bottomActionBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
}

.bottomPriceSummary {
  display: flex;
  flex-direction: column;
}

.bottomPriceLabel {
  font-size: 11px;
  color: #64748B;
}

.bottomPriceValue {
  font-size: 18px;
  font-weight: 800;
  color: #0F172A;
}

.viewPriceDetailsLink {
  font-size: 11px;
  color: #F59E0B;
  font-weight: 700;
  cursor: pointer;
}

.primaryActionBtn {
  background: #0F172A;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.primaryActionBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primaryActionBtnYellow {
  background: #F59E0B;
  color: #000000;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.secondaryActionBtn {
  background: transparent;
  border: 1.5px solid #CBD5E1;
  color: #334155;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.placeOrderBtnRed {
  background: #DC2626;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
  transition: all 0.2s;
}

.placeOrderBtnRed:hover {
  background: #B91C1C;
}

/* Step 7: Order Success Screen */
.successStepContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 10px;
}

.celebrationIconWrapper {
  margin-bottom: 16px;
}

.celebrationCircle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #FEF3C7;
  border: 4px solid #FDE68A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D97706;
}

.celebrationCheck {
  color: #D97706;
}

.successHeading {
  font-size: 22px;
  font-weight: 900;
  color: #0F172A;
  margin: 0 0 6px 0;
}

.successSubHeading {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 20px 0;
}

.orderIdCard {
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.orderIdLeft {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.orderIdLabel {
  font-size: 11px;
  color: #94A3B8;
}

.orderIdNumber {
  font-size: 17px;
  font-weight: 900;
  color: #0F172A;
  letter-spacing: 0.5px;
}

.copyOrderBtn {
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.estimatedDeliveryCard {
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  text-align: left;
}

.estimatedCalendarIcon {
  color: #10B981;
}

.estimatedDeliveryInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.estLabel {
  font-size: 11px;
  color: #94A3B8;
}

.estDate {
  font-size: 15px;
  font-weight: 800;
  color: #10B981;
}

.estSlot {
  font-size: 12px;
  color: #64748B;
}

.estChevron {
  color: #CBD5E1;
}

.whatsNextCard {
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  text-align: left;
}

.whatsNextTitle {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 16px 0;
}

.whatsNextTimeline {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.timelineNode {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  opacity: 0.5;
}

.timelineNodeActive {
  opacity: 1;
}

.nodeIconCircle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F1F5F9;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.timelineNodeActive .nodeIconCircle {
  background: #FEF3C7;
  color: #D97706;
}

.timelineNode strong {
  font-size: 11px;
  color: #0F172A;
  line-height: 1.2;
}

.timelineNode span {
  font-size: 10px;
  color: #94A3B8;
}

.inProgressPill {
  background: #E0F2FE;
  color: #0369A1 !important;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.notificationsBanner {
  width: 100%;
  background: #DC2626;
  color: #FFFFFF;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  text-align: left;
}

.notificationsBanner strong {
  font-size: 14px;
  display: block;
}

.notificationsBanner p {
  font-size: 12px;
  color: #FEE2E2;
  margin: 2px 0 0 0;
}

.referCard {
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  text-align: left;
}

.referIcon {
  color: #F59E0B;
}

.referText {
  flex: 1;
}

.referText strong {
  font-size: 14px;
  color: #0F172A;
  display: block;
}

.referText p {
  font-size: 12px;
  color: #64748B;
  margin: 2px 0 0 0;
}

.referBtn {
  background: #FFFBEB;
  border: 1px solid #FCD34D;
  color: #D97706;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.successActionsGrid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.needHelpBtn {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.shareOrderBtn {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.trackOrderBtnRed {
  width: 100%;
  background: #DC2626;
  color: #FFFFFF;
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
}

/* Modal */
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modalContent {
  background: #FFFFFF;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
}

.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modalHeader h3 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
}

.modalHeader button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748B;
}

.cardDesignsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.cardOption {
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.cardOptionActive {
  border-color: #E11D48;
  background: #FFF1F2;
}

.cardOptionImg {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.cardOption strong {
  font-size: 13px;
  color: #0F172A;
}

.cardOption span {
  font-size: 11px;
  color: #64748B;
}
`;

fs.writeFileSync(path.join(pagesDir, 'GiftDeliveryBookingPage.module.css'), bookingPageCss, 'utf8');
console.log('Created GiftDeliveryBookingPage.module.css');
