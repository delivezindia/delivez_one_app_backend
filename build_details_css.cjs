const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const cssPath = path.join(webRoot, 'src', 'pages', 'return-pickup', 'ReturnPickupDetailsPage.module.css');

const cssContent = `/* ReturnPickupDetailsPage.module.css */
.detailsPageWrapper {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #0f172a;
}

.loadingWrapper,
.notFoundWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  gap: 16px;
  color: #64748b;
  font-weight: 600;
}

.detailsHeader {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.headerInner {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.backBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.headerTitleRow h1 {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 2px;
}

.headerTitleRow p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.downloadInvoiceBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
}

/* Main Container */
.mainContainer {
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Hero Summary Card */
.heroSummaryCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.heroTop {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 18px;
}

.heroLeft {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.boxIconWrap {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.statusPill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  background: #dcfce7;
  color: #166534;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.bookingIdRow {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bookingIdRow small {
  font-size: 0.75rem;
  color: #64748b;
}

.bookingIdRow strong {
  font-size: 1.15rem;
  color: #0f172a;
}

.bookingIdRow button {
  background: none;
  border: none;
  color: #d97706;
  cursor: pointer;
  display: flex;
}

.deliveredDateText {
  display: block;
  font-size: 0.78rem;
  color: #16a34a;
  font-weight: 600;
  margin-top: 2px;
}

.heroRight {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.heroPrice {
  font-size: 1.5rem;
  font-weight: 900;
  color: #0f172a;
}

.rateReviewBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.heroKeyDetails {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.keyItem {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.keyItem small {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.keyItem strong {
  font-size: 0.82rem;
  color: #0f172a;
}

/* Progress Teaser Card */
.progressTeaserCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px 24px;
}

.progressTeaserHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progressTeaserHeader h3 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.viewTrackingLink {
  background: none;
  border: none;
  color: #d97706;
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.progressStepRow {
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 4px;
}

.stepBubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  min-width: 90px;
}

.bubbleIcon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #cbd5e1;
}

.doneBubble .bubbleIcon {
  background: #16a34a;
  color: #ffffff;
  border-color: #16a34a;
}

.stepBubble strong {
  font-size: 0.78rem;
  color: #0f172a;
}

.stepBubble small {
  font-size: 0.68rem;
  color: #64748b;
}

/* 2-Column Addresses */
.addressesTwoCol {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.addressBlock,
.sectionCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

.addressBlockHeader,
.sectionCardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 14px;
}

.addressBlockTitle,
.sectionCardTitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  color: #0f172a;
}

.viewTag {
  font-size: 0.72rem;
  font-weight: 700;
  color: #d97706;
  cursor: pointer;
}

.addressDetails h4 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.addressDetails p {
  font-size: 0.85rem;
  color: #475569;
  margin: 0 0 6px;
  line-height: 1.4;
}

.phoneRow {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.instructionNote {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 8px;
}

.instructionNote small {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
}

.instructionNote p {
  font-size: 0.8rem;
  color: #334155;
  margin: 2px 0 0;
}

/* Item Details */
.itemDetailBody {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.itemIconWrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.itemMeta h4 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.itemMeta p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 8px;
}

.reasonBadge span {
  background: #f1f5f9;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
}

/* Documents */
.docsListGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.docItemCard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.docItemMeta {
  flex: 1;
}

.docItemMeta strong {
  display: block;
  font-size: 0.85rem;
  color: #0f172a;
}

.docItemMeta small {
  font-size: 0.72rem;
  color: #64748b;
}

.docDownloadBtn {
  background: none;
  border: none;
  color: #d97706;
  cursor: pointer;
  display: flex;
}

/* Help Banner */
.helpBanner {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.helpLeft {
  display: flex;
  align-items: center;
  gap: 14px;
}

.helpIconCircle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.helpLeft strong {
  display: block;
  font-size: 0.95rem;
  color: #0f172a;
}

.helpLeft p {
  font-size: 0.82rem;
  color: #64748b;
  margin: 2px 0 0;
}

.chatNowBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
}

/* Bottom Bar */
.bottomBar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;
}

.goHomeBtn {
  flex: 1;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 14px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.trackReturnBtn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
}

/* Review Modal */
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.reviewModalContent {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.reviewModalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.reviewModalHeader h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.reviewModalHeader button {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}

.reviewSub {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0 0 16px;
}

.starsRow {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.starsRow button {
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
}

.starsRow button.activeStar {
  color: #f59e0b;
}

.reviewTextAreaWrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.reviewTextAreaWrap label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

.reviewTextAreaWrap textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88rem;
  font-family: inherit;
}

.submitReviewBtn {
  width: 100%;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
}

.reviewSuccessMsg {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 20px 0;
}

.reviewSuccessMsg strong {
  font-size: 1.15rem;
  color: #0f172a;
}

.reviewSuccessMsg p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .heroTop,
  .heroKeyDetails,
  .addressesTwoCol,
  .docsListGrid,
  .helpBanner,
  .bottomBar {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }
}
`;

fs.writeFileSync(cssPath, cssContent);
console.log('✓ ReturnPickupDetailsPage.module.css written');
