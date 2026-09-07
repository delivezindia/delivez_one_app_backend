const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';

const desktopCss = `
/* Desktop-First Responsive Container */
.pageWrapper {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 1.5rem 5rem;
  font-family: inherit;
  color: #0f172a;
}

.desktopContainer {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Page Topbar Navigation */
.topNav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}

.navLeft {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.backIconBtn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0f172a;
  transition: all 0.2s ease;
}

.backIconBtn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.brandGroup {
  display: flex;
  flex-direction: column;
}

.brandTitle {
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #0f172a;
  line-height: 1.1;
}

.brandAccent {
  color: #f59e0b;
}

.brandSub {
  font-size: 0.72rem;
  font-weight: 800;
  color: #d32f2f;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.navRight {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stepIndicatorBadge {
  font-size: 0.85rem;
  font-weight: 800;
  color: #475569;
  background: #f1f5f9;
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.supportBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.supportBtn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Horizontal Stepper Rail for Desktop */
.stepperRail {
  background: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow-x: auto;
  gap: 0.5rem;
}

.stepRailItem {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  cursor: pointer;
}

.stepRailNumber {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 2px solid #cbd5e1;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.stepRailActive .stepRailNumber {
  background: #d32f2f;
  border-color: #d32f2f;
  color: #ffffff;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.2);
}

.stepRailDone .stepRailNumber {
  background: #10b981;
  border-color: #10b981;
  color: #ffffff;
}

.stepRailLabel {
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}

.stepRailActive .stepRailLabel {
  color: #0f172a;
  font-weight: 800;
}

.stepRailDivider {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  min-width: 16px;
}

.stepRailDividerActive {
  background: #10b981;
}

/* 2-Column Split Layout for Desktop */
.splitLayout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  align-items: start;
}

/* Left Main Form Panel */
.formPanel {
  background: #ffffff;
  border-radius: 24px;
  border: 1.5px solid #e2e8f0;
  padding: 2.25rem 2.5rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panelHeader {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1.25rem;
}

.panelTitle {
  font-size: 1.75rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.2;
}

.panelTitleHighlight {
  color: #d32f2f;
}

.panelSubtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0.35rem 0 0;
  font-weight: 500;
}

/* Step 1: Category Grid (4 Columns on desktop) */
.categoryGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.categoryCard {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.categoryCard:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.categoryCardSelected {
  border-color: #f59e0b;
  background: #fffdfa;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
}

.categoryIconCircle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #fef8ee;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.categoryCardSelected .categoryIconCircle {
  background: #fef3c7;
  color: #b45309;
}

.categoryLabel {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f172a;
}

/* Step 2: Place Grid (3 Columns on desktop) */
.placeGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.placeCard {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.placeCard:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
}

.placeCardSelected {
  border-color: #f59e0b;
  background: #fffdfa;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
}

.placeCardBadge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f59e0b;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeIconBox {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #fef8ee;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeCardSelected .placeIconBox {
  background: #fef3c7;
  color: #b45309;
}

.placeTitle {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.placeDesc {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.35;
}

/* Step 3: Handover Grid (2 Columns on desktop) */
.handoverGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.handoverCard {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.15rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.handoverCard:hover {
  border-color: #cbd5e1;
}

.handoverCardSelected {
  border-color: #f59e0b;
  background: #fffdfa;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
}

.handoverRadio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.handoverCardSelected .handoverRadio {
  border-color: #f59e0b;
}

.handoverRadioInner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f59e0b;
}

.handoverInfo {
  flex: 1;
}

.handoverTitle {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.handoverDesc {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 2px;
}

/* Step 4 & 5: Forms (2 Columns Responsive Grid) */
.formGrid2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.formGridFull {
  grid-column: span 2;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.inputLabel {
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
}

.inputField {
  width: 100%;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-size: 0.92rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.inputField:focus {
  border-color: #d32f2f;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.12);
}

.selectField {
  width: 100%;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-size: 0.92rem;
  color: #0f172a;
  outline: none;
  cursor: pointer;
}

.locationDetectBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.locationDetectBox:hover {
  border-color: #d32f2f;
  background: #fff5f5;
}

/* Step 6: Item Details (Side-by-side desktop layout) */
.itemDetailsSplit {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1.5rem;
}

.photoUploadBox {
  border: 2px dashed #cbd5e1;
  border-radius: 18px;
  padding: 1.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.2s ease;
  text-align: center;
  height: 100%;
  box-sizing: border-box;
}

.photoUploadBox:hover {
  border-color: #d32f2f;
  background: #fff5f5;
}

.photoPreviewThumb {
  max-height: 190px;
  width: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.tagPills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tagPill {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tagPillActive {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
}

/* Step 7: Speed Cards (4 Columns on Desktop) */
.speedGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.speedCard {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.25rem 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.speedCard:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.speedCardActive {
  border-color: #d32f2f;
  background: #fff5f5;
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.2);
}

.speedTitle {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.speedEta {
  font-size: 0.82rem;
  font-weight: 700;
  color: #d97706;
}

.speedPrice {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 700;
}

/* Date & Time Picker */
.datePillList {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.datePill {
  min-width: 68px;
  padding: 0.75rem 0.5rem;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.datePillActive {
  background: #d32f2f;
  border-color: #d32f2f;
  color: #ffffff;
}

.datePillLabel {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.datePillNumber {
  font-size: 1.2rem;
  font-weight: 900;
}

.timePillList {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.timePill {
  padding: 0.65rem 1rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.timePillActive {
  border-color: #d32f2f;
  color: #d32f2f;
  background: #fff5f5;
}

/* Step 8: Security Toggles Grid (2 Columns on Desktop) */
.securityGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.toggleCard {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem 1.15rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.toggleInfo {
  flex: 1;
}

.toggleTitle {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.toggleDesc {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 26px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.2s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #d32f2f;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* Step 9: Payment Grid (4 Columns on Desktop) */
.paymentGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.paymentCard {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
  transition: all 0.2s ease;
}

.paymentCardSelected {
  border-color: #d32f2f;
  background: #fff5f5;
  color: #d32f2f;
}

/* Trust and Notice Banners */
.trustBanner {
  background: #fef8ee;
  border-radius: 16px;
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #fef3c7;
}

.alertRedBanner {
  background: #d32f2f;
  color: #ffffff;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Bottom Action Buttons */
.bottomActions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
  gap: 1rem;
}

.backBtn {
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  padding: 0.85rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.backBtn:hover {
  background: #f8fafc;
}

.continueRedBtn {
  background: #d32f2f;
  border: none;
  border-radius: 12px;
  padding: 0.9rem 2rem;
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(211, 47, 47, 0.3);
  transition: all 0.2s ease;
}

.continueRedBtn:hover {
  background: #b71c1c;
  transform: translateY(-1px);
}

.continueYellowBtn {
  background: #f59e0b;
  border: none;
  border-radius: 12px;
  padding: 0.9rem 2rem;
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
  transition: all 0.2s ease;
}

.continueYellowBtn:hover {
  background: #d97706;
  transform: translateY(-1px);
}

/* Right Sticky Live Summary Sidebar */
.summarySidebar {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.liveSummaryCard {
  background: #ffffff;
  border-radius: 24px;
  border: 1.5px solid #e2e8f0;
  padding: 1.5rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.summaryHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}

.summaryTitle {
  font-size: 1.1rem;
  font-weight: 900;
  color: #0f172a;
}

.summaryLivePill {
  font-size: 0.72rem;
  font-weight: 800;
  color: #15803d;
  background: #dcfce7;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
}

.summaryItemRow {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.85rem 1rem;
  border-radius: 16px;
}

.summaryIconWrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #fef8ee;
  color: #d32f2f;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.routeBlock {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  padding-left: 0.5rem;
}

.routeLine {
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 17px;
  width: 2px;
  background: #cbd5e1;
}

.routePoint {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.routeDot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #d32f2f;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.routeDotGreen {
  border-color: #10b981;
}

.routePointContent {
  flex: 1;
}

.routeLabel {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.routeAddress {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  margin-top: 1px;
}

/* Price Breakdown Box in Sidebar */
.priceBox {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.15rem;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.priceRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #475569;
}

.priceTotalRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.15rem;
  font-weight: 900;
  color: #0f172a;
  padding-top: 0.6rem;
  border-top: 1.5px dashed #cbd5e1;
  margin-top: 0.25rem;
}

.guaranteeBox {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.15rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

/* Step 10: Confirmation View (Desktop Centered) */
.confirmationContainer {
  max-width: 880px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  border: 1.5px solid #e2e8f0;
  padding: 3rem 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.confirmBadge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #10b981;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
}

.confirmInfoGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.confirmInfoCard {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
}

.milestoneTrack {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 1.5rem;
  margin: 1rem 0;
}

.milestoneLine {
  position: absolute;
  top: 50%;
  left: 2.5rem;
  right: 2.5rem;
  height: 3px;
  background: #e2e8f0;
  transform: translateY(-50%);
  z-index: 1;
}

.milestoneNode {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #cbd5e1;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.milestoneNodeDone {
  background: #d32f2f;
  border-color: #d32f2f;
}

.milestoneLabels {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  text-align: center;
  gap: 0.5rem;
}

.otpDisplayBox {
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.otpCodeBadge {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 3px;
  color: #d32f2f;
  background: #ffffff;
  padding: 0.4rem 1rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

/* Responsive Media Queries */
@media (max-width: 1024px) {
  .splitLayout {
    grid-template-columns: 1fr;
  }
  .summarySidebar {
    position: static;
    width: 100%;
  }
  .categoryGrid {
    grid-template-columns: repeat(3, 1fr);
  }
  .placeGrid {
    grid-template-columns: repeat(2, 1fr);
  }
  .speedGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .pageWrapper {
    padding: 1rem 0.75rem 4rem;
  }
  .formPanel {
    padding: 1.5rem 1.25rem;
  }
  .categoryGrid {
    grid-template-columns: repeat(3, 1fr);
  }
  .formGrid2 {
    grid-template-columns: 1fr;
  }
  .formGridFull {
    grid-column: span 1;
  }
  .itemDetailsSplit {
    grid-template-columns: 1fr;
  }
  .securityGrid {
    grid-template-columns: 1fr;
  }
  .paymentGrid {
    grid-template-columns: repeat(2, 1fr);
  }
  .confirmInfoGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}
`;

writeFile('src/pages/forgot-something/ForgotSomethingBookingPage.module.css', desktopCss);
writeFile('src/pages/forgot-something/ForgotSomethingTrackingPage.module.css', desktopCss);
console.log('CSS module files written successfully!');
`;

writeFile('write_desktop_css.cjs', '');
fs.writeFileSync('c:/Users/Rax/Desktop/Delivery_app_site_backend/write_desktop_css.cjs', desktopCss);
