const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const cssPath = path.join(webRoot, 'src', 'pages', 'return-pickup', 'ReturnPickupTrackingPage.module.css');

const cssContent = `/* ReturnPickupTrackingPage.module.css */
.trackingPageWrapper {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #0f172a;
}

.loadingState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  gap: 16px;
  color: #64748b;
  font-weight: 600;
}

.trackHeader {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.trackHeaderContainer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trackHeaderLeft {
  display: flex;
  align-items: center;
  gap: 16px;
}

.backLink {
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

.titleRow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.titleRow h1 {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.statusBadge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  background: #fef3c7;
  color: #b45309;
}

.statusBadge.DELIVERED {
  background: #dcfce7;
  color: #166534;
}

.statusBadge.CANCELLED {
  background: #fee2e2;
  color: #991b1b;
}

.idRow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #64748b;
}

.copyMiniBtn {
  background: none;
  border: none;
  color: #d97706;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
}

.trackHeaderRight {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refreshBtn,
.supportHeaderBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.supportHeaderBtn {
  background: #f8fafc;
}

/* Main 2-Column Grid */
.mainGrid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
  align-items: start;
}

.timelineColumn {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ETA Banner */
.etaBanner {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.etaLeft {
  display: flex;
  align-items: center;
  gap: 16px;
}

.etaLeft small {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.5px;
}

.etaLeft strong {
  font-size: 1.15rem;
  color: #0f172a;
}

.etaPill {
  background: #fef3c7;
  color: #b45309;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
}

/* Partner Distance Card */
.partnerDistanceCard {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #ffffff;
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
}

.distancePulse {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.distanceInfo strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 2px;
}

.distanceInfo p {
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.95;
}

/* Milestones Timeline */
.milestonesCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.milestonesHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.milestonesHeader h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.totalDurationBadge {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
}

.timelineTrack {
  display: flex;
  flex-direction: column;
}

.timelineNode {
  display: flex;
  gap: 18px;
  position: relative;
}

.nodeIndicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
}

.nodeCircle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  z-index: 2;
}

.completedNode .nodeCircle {
  background: #16a34a;
  border-color: #16a34a;
}

.pendingDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
}

.nodeLine {
  flex: 1;
  width: 2px;
  background: #e2e8f0;
  margin: 4px 0;
  min-height: 40px;
}

.completedNode .nodeLine {
  background: #16a34a;
}

.nodeContent {
  flex: 1;
  padding-bottom: 24px;
}

.nodeTop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.nodeTop strong {
  font-size: 0.95rem;
  color: #0f172a;
}

.nodeTime {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
}

.nodeContent p {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

/* Policy Card */
.policyCard {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.policyLeft {
  display: flex;
  align-items: center;
  gap: 12px;
}

.policyLeft strong {
  display: block;
  font-size: 0.88rem;
  color: #166534;
}

.policyLeft p {
  font-size: 0.78rem;
  color: #15803d;
  margin: 2px 0 0;
}

.cancelRequestBtn {
  background: #ffffff;
  border: 1px solid #f87171;
  color: #dc2626;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

/* Right Details Column */
.detailsColumn {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.partnerCard,
.otpCard,
.snapshotCard,
.simulationCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.partnerCardHeader,
.otpCardHeader,
.simHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.partnerBody {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.partnerAvatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fef3c7;
  color: #b45309;
  font-size: 1.2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.partnerMeta strong {
  display: block;
  font-size: 1rem;
  color: #0f172a;
}

.partnerMeta p {
  font-size: 0.82rem;
  color: #64748b;
  margin: 2px 0 0;
}

.partnerActions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.callPartnerBtn,
.chatPartnerBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.callPartnerBtn {
  background: #d97706;
  color: #ffffff;
  border: none;
}

.chatPartnerBtn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
}

/* OTP Card */
.otpInstructions {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 14px;
}

.otpPillRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.otpBox {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
}

.otpBox small {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  color: #64748b;
}

.otpBox strong {
  font-size: 1.35rem;
  color: #0f172a;
  letter-spacing: 2px;
  font-family: monospace;
}

.otpTestSection {
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.otpTestSection small {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 6px;
}

.otpInputRow {
  display: flex;
  gap: 8px;
}

.otpInputRow input {
  width: 120px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 700;
  letter-spacing: 2px;
}

.otpInputRow button {
  flex: 1;
  background: #16a34a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.otpSuccess {
  display: block;
  font-size: 0.78rem;
  color: #16a34a;
  font-weight: 700;
  margin-top: 6px;
}

/* Snapshot Card */
.snapshotCard h4 {
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px;
}

.snapshotRow {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  margin-bottom: 8px;
}

.snapshotRow span {
  color: #64748b;
}

.snapshotRow strong {
  color: #0f172a;
  text-align: right;
  max-width: 60%;
}

.snapshotActions {
  margin-top: 16px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.viewDetailsBtn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
}

/* Simulation Controls */
.simulationCard p {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0 0 10px;
}

.simButtons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.simButtons button {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 6px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.simButtons button:hover {
  background: #e2e8f0;
}

/* Cancellation Modal */
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

.modalContent {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modalHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.modalHeader h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.modalContent p {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0 0 16px;
}

.reasonList {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.reasonOption {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #334155;
  cursor: pointer;
}

.modalActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modalCancelBtn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.modalConfirmBtn {
  background: #dc2626;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .mainGrid {
    grid-template-columns: 1fr;
  }
}
`;

fs.writeFileSync(cssPath, cssContent);
console.log('✓ ReturnPickupTrackingPage.module.css written');
