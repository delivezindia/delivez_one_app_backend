import 'dart:convert';
import 'package:http/http.dart' as http;
import 'vault_courier_models.dart';

export 'vault_courier_models.dart';

/// Delivez Mobile API Client (Flutter / Dart)
/// Ready-to-use production client for mobile apps.
class DelivezApiClient {
  final String baseUrl;
  String? _accessToken;

  DelivezApiClient({
    this.baseUrl = 'http://localhost:4000/api/v1',
    String? initialToken,
  }) : _accessToken = initialToken;

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  Map<String, String> _buildHeaders([Map<String, String>? extra]) {
    final headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Device-Platform': 'Flutter',
    };
    if (_accessToken != null && _accessToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    if (extra != null) {
      headers.addAll(extra);
    }
    return headers;
  }

  dynamic _handleResponse(http.Response response) {
    final body = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body['data'];
    } else {
      final msg = body['message'] ?? 'Request failed with status ${response.statusCode}';
      throw DelivezApiException(response.statusCode, msg, body['error']);
    }
  }

  // ==========================================
  // 1. SYSTEM & HOME
  // ==========================================
  Future<Map<String, dynamic>> checkHealth() async {
    final res = await http.get(Uri.parse('$baseUrl/health'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> addWalletBalance({
    required double amount,
    String paymentMethod = 'UPI',
    String? description,
    String? transactionReference,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/payment-methods/wallet/add'),
      headers: _buildHeaders(),
      body: jsonEncode({
        'amount': amount,
        'paymentMethod': paymentMethod,
        if (description != null) 'description': description,
        if (transactionReference != null) 'transactionReference': transactionReference,
      }),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getWalletTransactions({
    int? page,
    int? limit,
    String? type,
  }) async {
    final params = <String>[];
    if (page != null) params.add('page=$page');
    if (limit != null) params.add('limit=$limit');
    if (type != null) params.add('type=$type');
    final query = params.isNotEmpty ? '?' + params.join('&') : '';
    final res = await http.get(
      Uri.parse('$baseUrl/payment-methods/wallet/transactions' + query),
      headers: _buildHeaders(),
    );
    return _handleResponse(res);
  }


  Future<Map<String, dynamic>> getHomeFeed() async {
    final res = await http.get(Uri.parse('$baseUrl/home/all'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> detectLocation([double? lat, double? lng]) async {
    String endpoint = '$baseUrl/location/current';
    if (lat != null && lng != null) {
      endpoint = '$baseUrl/location/detect?lat=$lat&lng=$lng';
    }
    final res = await http.get(Uri.parse(endpoint), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> checkPincode(String pincode) async {
    final res = await http.get(Uri.parse('$baseUrl/pincode/$pincode'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  // ==========================================
  // 2. AUTHENTICATION & PROFILE
  // ==========================================
  Future<Map<String, dynamic>> sendLoginOtp(String mobileNumber, {String countryCode = '+91'}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _buildHeaders(),
      body: jsonEncode({'countryCode': countryCode, 'mobileNumber': mobileNumber}),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> verifyOtp(String challengeId, String otp, {String? deviceId}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/verify-otp'),
      headers: _buildHeaders(),
      body: jsonEncode({'challengeId': challengeId, 'otp': otp, 'deviceId': deviceId}),
    );
    final data = _handleResponse(res);
    if (data['accessToken'] != null) {
      setAccessToken(data['accessToken']);
    }
    return data;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final res = await http.get(Uri.parse('$baseUrl/auth/me'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  // ==========================================
  // 3. SAVED ADDRESSES
  // ==========================================
  Future<List<dynamic>> getAddresses() async {
    final res = await http.get(Uri.parse('$baseUrl/addresses'), headers: _buildHeaders());
    final data = _handleResponse(res);
    return data['addresses'] ?? [];
  }

  Future<Map<String, dynamic>> saveAddress(Map<String, dynamic> addressPayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/addresses'),
      headers: _buildHeaders(),
      body: jsonEncode(addressPayload),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 4. SERVICE 1: PERSONAL COURIER
  // ==========================================
  Future<Map<String, dynamic>> getCourierOptions() async {
    final res = await http.get(Uri.parse('$baseUrl/courier/options'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getCourierQuote(Map<String, dynamic> quotePayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/courier/quote'),
      headers: _buildHeaders(),
      body: jsonEncode(quotePayload),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> createCourierBooking(Map<String, dynamic> bookingPayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/courier/bookings'),
      headers: _buildHeaders({'Idempotency-Key': 'idemp-${DateTime.now().millisecondsSinceEpoch}'}),
      body: jsonEncode(bookingPayload),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> trackCourierBooking(String id) async {
    final res = await http.get(Uri.parse('$baseUrl/courier/bookings/$id/track'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getCourierPod(String id) async {
    final res = await http.get(Uri.parse('$baseUrl/courier/bookings/$id/pod'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  // ==========================================
  // 5. SERVICE 2: LUGGAGE DELIVERY
  // ==========================================
  Future<Map<String, dynamic>> getLuggageOptions() async {
    final res = await http.get(Uri.parse('$baseUrl/luggage-delivery/options'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getLuggageQuote(Map<String, dynamic> quotePayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/luggage-delivery/quote'),
      headers: _buildHeaders(),
      body: jsonEncode(quotePayload),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> createLuggageBooking(Map<String, dynamic> bookingPayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/luggage-delivery/bookings'),
      headers: _buildHeaders({'Idempotency-Key': 'idemp-${DateTime.now().millisecondsSinceEpoch}'}),
      body: jsonEncode(bookingPayload),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 6. SERVICE 3: CONFIDENTIAL VAULT DELIVERY (CANONICAL REST APIS)
  // ==========================================
  Future<Map<String, dynamic>> getVaultOptions() async {
    final res = await http.get(Uri.parse('$baseUrl/confidential-delivery/options'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getVaultQuote(Map<String, dynamic> quotePayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/confidential-delivery/quote'),
      headers: _buildHeaders(),
      body: jsonEncode(quotePayload),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> createVaultBooking(dynamic booking) async {
    final bodyData = booking is VaultBooking ? booking.toJson() : booking;
    final res = await http.post(
      Uri.parse('$baseUrl/courier-delivery/bookings'),
      headers: _buildHeaders({'Idempotency-Key': 'idemp-${DateTime.now().millisecondsSinceEpoch}'}),
      body: jsonEncode(bodyData),
    );
    return _handleResponse(res);
  }

  Future<List<VaultBooking>> getVaultBookings({String? serviceType, String? status}) async {
    String uri = '$baseUrl/courier-delivery/bookings';
    final queryParams = <String>[];
    if (serviceType != null) queryParams.add('service_type=${Uri.encodeComponent(serviceType)}');
    if (status != null) queryParams.add('status=${Uri.encodeComponent(status)}');
    if (queryParams.isNotEmpty) uri += '?${queryParams.join('&')}';

    final res = await http.get(Uri.parse(uri), headers: _buildHeaders());
    final data = _handleResponse(res);
    final list = data['bookings'] as List<dynamic>? ?? [];
    return list.map((e) => VaultBooking.fromJson(e)).toList();
  }

  Future<VaultBooking> getVaultBooking(String id) async {
    final res = await http.get(Uri.parse('$baseUrl/courier-delivery/bookings/$id'), headers: _buildHeaders());
    final data = _handleResponse(res);
    return VaultBooking.fromJson(data['booking'] ?? data);
  }

  Future<VaultBooking> updateVaultBooking(String id, VaultBooking booking) async {
    final res = await http.put(
      Uri.parse('$baseUrl/courier-delivery/bookings/$id'),
      headers: _buildHeaders(),
      body: jsonEncode(booking.toJson()),
    );
    final data = _handleResponse(res);
    return VaultBooking.fromJson(data['booking'] ?? data);
  }

  Future<VaultBooking> patchVaultBooking(String id, Map<String, dynamic> patch) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/courier-delivery/bookings/$id'),
      headers: _buildHeaders(),
      body: jsonEncode(patch),
    );
    final data = _handleResponse(res);
    return VaultBooking.fromJson(data['booking'] ?? data);
  }

  Future<Map<String, dynamic>> deleteVaultBooking(String id) async {
    final res = await http.delete(Uri.parse('$baseUrl/courier-delivery/bookings/$id'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  // --- VAULT PAYMENTS ---
  Future<VaultPayment> createVaultPayment({required String bookingId, String paymentMethod = 'ONLINE'}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/courier-delivery/payments'),
      headers: _buildHeaders(),
      body: jsonEncode({'booking_id': bookingId, 'payment_method': paymentMethod}),
    );
    final data = _handleResponse(res);
    return VaultPayment.fromJson(data);
  }

  Future<VaultPayment> getVaultPayment(String id) async {
    final res = await http.get(Uri.parse('$baseUrl/courier-delivery/payments/$id'), headers: _buildHeaders());
    final data = _handleResponse(res);
    return VaultPayment.fromJson(data);
  }

  Future<VaultPayment?> getVaultBookingPayment(String bookingId) async {
    final res = await http.get(Uri.parse('$baseUrl/courier-delivery/bookings/$bookingId/payment'), headers: _buildHeaders());
    final data = _handleResponse(res);
    return data != null ? VaultPayment.fromJson(data) : null;
  }

  Future<Map<String, dynamic>> verifyVaultPayment(String id, {String? gatewayPaymentId, String? gatewaySignature}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/courier-delivery/payments/$id/verify'),
      headers: _buildHeaders(),
      body: jsonEncode({
        'gateway_payment_id': gatewayPaymentId,
        'gateway_signature': gatewaySignature,
      }),
    );
    return _handleResponse(res);
  }

  Future<VaultPayment> refundVaultPayment(String id, {String? reason}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/courier-delivery/payments/$id/refund'),
      headers: _buildHeaders(),
      body: jsonEncode({'reason': reason}),
    );
    final data = _handleResponse(res);
    return VaultPayment.fromJson(data);
  }

  // --- VAULT RECEIPTS ---
  Future<VaultReceipt> createVaultReceipt({required String bookingId, String? paymentId}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/courier-delivery/receipts'),
      headers: _buildHeaders(),
      body: jsonEncode({'booking_id': bookingId, 'payment_id': paymentId}),
    );
    final data = _handleResponse(res);
    return VaultReceipt.fromJson(data);
  }

  Future<List<VaultReceipt>> getVaultReceipts() async {
    final res = await http.get(Uri.parse('$baseUrl/courier-delivery/receipts'), headers: _buildHeaders());
    final data = _handleResponse(res);
    final list = data is List ? data : (data['receipts'] as List<dynamic>? ?? []);
    return list.map((e) => VaultReceipt.fromJson(e)).toList();
  }

  Future<VaultReceipt> getVaultReceipt(String id) async {
    final res = await http.get(Uri.parse('$baseUrl/courier-delivery/receipts/$id'), headers: _buildHeaders());
    final data = _handleResponse(res);
    return VaultReceipt.fromJson(data);
  }

  Future<VaultReceipt?> getVaultBookingReceipt(String bookingId) async {
    final res = await http.get(Uri.parse('$baseUrl/courier-delivery/bookings/$bookingId/receipt'), headers: _buildHeaders());
    final data = _handleResponse(res);
    return data != null ? VaultReceipt.fromJson(data) : null;
  }

  Future<Map<String, dynamic>> trackVaultShipment(String vaultId) async {
    final res = await http.get(Uri.parse('$baseUrl/confidential-delivery/track/$vaultId'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> verifyVaultOtp(String id, String otp) async {
    final res = await http.post(
      Uri.parse('$baseUrl/confidential-delivery/track/$id/verify-otp'),
      headers: _buildHeaders(),
      body: jsonEncode({'otp': otp}),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 7. SERVICE 4: FORGOT SOMETHING
  // ==========================================
  Future<Map<String, dynamic>> getForgotSomethingOptions() async {
    final res = await http.get(Uri.parse('$baseUrl/forgot-something/options'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getForgotSomethingQuote(Map<String, dynamic> quotePayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/forgot-something/quote'),
      headers: _buildHeaders(),
      body: jsonEncode(quotePayload),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> createForgotSomethingBooking(Map<String, dynamic> bookingPayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/forgot-something/bookings'),
      headers: _buildHeaders({'Idempotency-Key': 'idemp-${DateTime.now().millisecondsSinceEpoch}'}),
      body: jsonEncode(bookingPayload),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> trackForgotSomething(String id) async {
    final res = await http.get(Uri.parse('$baseUrl/forgot-something/track/$id'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> verifyForgotSomethingOtp(String id, String type, String otp) async {
    final res = await http.post(
      Uri.parse('$baseUrl/forgot-something/track/$id/verify-otp'),
      headers: _buildHeaders(),
      body: jsonEncode({'type': type, 'otp': otp}),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 8. SERVICE 5: RETURN PICKUP
  // ==========================================
  Future<Map<String, dynamic>> getReturnPickupOptions() async {
    final res = await http.get(Uri.parse('$baseUrl/return-pickup/options'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getReturnPickupQuote(Map<String, dynamic> quotePayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/return-pickup/quote'),
      headers: _buildHeaders(),
      body: jsonEncode(quotePayload),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> createReturnPickupBooking(Map<String, dynamic> bookingPayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/return-pickup/bookings'),
      headers: _buildHeaders({'Idempotency-Key': 'idemp-${DateTime.now().millisecondsSinceEpoch}'}),
      body: jsonEncode(bookingPayload),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> trackReturnPickup(String id) async {
    final res = await http.get(Uri.parse('$baseUrl/return-pickup/track/$id'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> verifyReturnPickupOtp(String id, String type, String otp) async {
    final res = await http.post(
      Uri.parse('$baseUrl/return-pickup/track/$id/verify-otp'),
      headers: _buildHeaders(),
      body: jsonEncode({'type': type, 'otp': otp}),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 9. UNIVERSAL TRACKER & SUPPORT
  // ==========================================
  Future<Map<String, dynamic>> universalTrack(String trackingId) async {
    final res = await http.get(Uri.parse('$baseUrl/track/$trackingId'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getSupportConfig() async {
    final res = await http.get(Uri.parse('$baseUrl/support/config'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> submitInquiry(Map<String, dynamic> inquiryPayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/support/inquiry'),
      headers: _buildHeaders(),
      body: jsonEncode(inquiryPayload),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 9. UNIVERSAL ORDER STATUS OPERATIONS (BY ORDER ID)
  // ==========================================
  Future<Map<String, dynamic>> updateOrderStatus(String orderId, String status, [Map<String, dynamic>? metadata]) async {
    final timestamp = metadata?['timestamp'] ?? DateTime.now().toUtc().toIso8601String();
    final body = {
      'status': status,
      'timestamp': timestamp,
      'statusChangedAt': timestamp,
      'updatedAt': timestamp,
      'statusTimestamps': metadata?['statusTimestamps'] ?? {status: timestamp},
      if (metadata != null) ...metadata,
    };

    final res = await http.patch(
      Uri.parse('$baseUrl/admin/orders/${Uri.encodeComponent(orderId)}/status'),
      headers: _buildHeaders(),
      body: jsonEncode(body),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> cancelOrder(String orderId, [String reason = 'Cancelled by User/Dispatcher', Map<String, dynamic>? metadata]) async {
    final timestamp = metadata?['timestamp'] ?? DateTime.now().toUtc().toIso8601String();
    final body = {
      'reason': reason,
      'timestamp': timestamp,
      'cancelledAt': timestamp,
      'status': 'CANCELLED',
      if (metadata != null) ...metadata,
    };

    final res = await http.post(
      Uri.parse('$baseUrl/admin/orders/${Uri.encodeComponent(orderId)}/cancel'),
      headers: _buildHeaders(),
      body: jsonEncode(body),
    );
    return _handleResponse(res);
  }
}

class DelivezApiException implements Exception {
  final int statusCode;
  final String message;
  final dynamic details;

  DelivezApiException(this.statusCode, this.message, [this.details]);

  @override
  String toString() => 'DelivezApiException($statusCode): $message';

  // ==========================================
  // 12. OFFERS & REWARDS (APK SCREEN)
  // ==========================================
  Future<Map<String, dynamic>> getRewards() async {
    final res = await http.get(Uri.parse('$baseUrl/rewards'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> redeemReward(String rewardId) async {
    final res = await http.post(
      Uri.parse('$baseUrl/rewards/redeem'),
      headers: _buildHeaders(),
      body: jsonEncode({'rewardId': rewardId}),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 13. PAYMENT METHODS & WALLET (APK SCREEN)
  // ==========================================
  Future<Map<String, dynamic>> getPaymentMethods() async {
    final res = await http.get(Uri.parse('$baseUrl/payment-methods'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> addPaymentMethod(Map<String, dynamic> methodData) async {
    final res = await http.post(
      Uri.parse('$baseUrl/payment-methods'),
      headers: _buildHeaders(),
      body: jsonEncode(methodData),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> setDefaultPaymentMethod(String id) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/payment-methods/$id/default'),
      headers: _buildHeaders(),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> deletePaymentMethod(String id) async {
    final res = await http.delete(
      Uri.parse('$baseUrl/payment-methods/$id'),
      headers: _buildHeaders(),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 14. PRIVACY & SECURITY (APK SCREEN)
  // ==========================================
  Future<Map<String, dynamic>> getPrivacySecurity() async {
    final res = await http.get(Uri.parse('$baseUrl/privacy-security'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> updatePrivacySettings(Map<String, dynamic> settings) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/privacy-security/settings'),
      headers: _buildHeaders(),
      body: jsonEncode(settings),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> toggleTwoFactorAuth() async {
    final res = await http.post(
      Uri.parse('$baseUrl/privacy-security/toggle-2fa'),
      headers: _buildHeaders(),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getUserDevices() async {
    final res = await http.get(Uri.parse('$baseUrl/privacy-security/devices'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> revokeUserDevice(String deviceId) async {
    final res = await http.delete(
      Uri.parse('$baseUrl/privacy-security/devices/$deviceId'),
      headers: _buildHeaders(),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getLoginActivity() async {
    final res = await http.get(Uri.parse('$baseUrl/privacy-security/login-activity'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> downloadUserData() async {
    final res = await http.get(Uri.parse('$baseUrl/privacy-security/download-data'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> reportSecurityIssue(String issueType, String description) async {
    final res = await http.post(
      Uri.parse('$baseUrl/privacy-security/report-issue'),
      headers: _buildHeaders(),
      body: jsonEncode({'issueType': issueType, 'description': description}),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> deleteAccount() async {
    final res = await http.delete(
      Uri.parse('$baseUrl/privacy-security/delete-account'),
      headers: _buildHeaders(),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 15. HELP & SUPPORT (APK SCREEN)
  // ==========================================
  Future<Map<String, dynamic>> getSupportConfig() async {
    final res = await http.get(Uri.parse('$baseUrl/support/config'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getSupportFaqs({String? search, String? category}) async {
    String query = '';
    final params = <String>[];
    if (search != null) params.add('search=${Uri.encodeComponent(search)}');
    if (category != null) params.add('category=${Uri.encodeComponent(category)}');
    if (params.isNotEmpty) query = '?' + params.join('&');
    final res = await http.get(Uri.parse('$baseUrl/support/faqs$query'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> submitSupportInquiry({
    required String message,
    String? name,
    String? mobileNumber,
    String? email,
    String? subject,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/support/inquiry'),
      headers: _buildHeaders(),
      body: jsonEncode({
        'message': message,
        'name': name,
        'mobileNumber': mobileNumber,
        'email': email,
        'subject': subject,
      }),
    );
    return _handleResponse(res);
  }

  // ==========================================
  // 16. LEGAL & POLICIES (APK SCREENS)
  // ==========================================
  Future<Map<String, dynamic>> getTermsAndConditions() async {
    final res = await http.get(Uri.parse('$baseUrl/legal/terms'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> agreeToTerms() async {
    final res = await http.post(Uri.parse('$baseUrl/legal/terms/agree'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getPrivacyPolicy() async {
    final res = await http.get(Uri.parse('$baseUrl/legal/privacy'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> acknowledgePrivacyPolicy() async {
    final res = await http.post(Uri.parse('$baseUrl/legal/privacy/acknowledge'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  // ==========================================
  // 17. COMPANY & NETWORK HUBS (APK SCREENS)
  // ==========================================
  Future<Map<String, dynamic>> getAboutDelivez() async {
    final res = await http.get(Uri.parse('$baseUrl/company/about'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getCompanyOverview() async {
    final res = await http.get(Uri.parse('$baseUrl/company/overview'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getOurJourney() async {
    final res = await http.get(Uri.parse('$baseUrl/company/journey'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getNetworkOverview() async {
    final res = await http.get(Uri.parse('$baseUrl/network/overview'), headers: _buildHeaders());
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getNetworkHubs({String? search, String? region}) async {
    String query = '';
    final params = <String>[];
    if (search != null) params.add('search=${Uri.encodeComponent(search)}');
    if (region != null) params.add('region=${Uri.encodeComponent(region)}');
    if (params.isNotEmpty) query = '?' + params.join('&');
    final res = await http.get(Uri.parse('$baseUrl/network/hubs$query'), headers: _buildHeaders());
    return _handleResponse(res);
  }
}
