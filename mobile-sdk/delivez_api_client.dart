import 'dart:convert';
import 'package:http/http.dart' as http;

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
  // 6. SERVICE 3: CONFIDENTIAL VAULT DELIVERY
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

  Future<Map<String, dynamic>> createVaultBooking(Map<String, dynamic> bookingPayload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/confidential-delivery/bookings'),
      headers: _buildHeaders({'Idempotency-Key': 'idemp-${DateTime.now().millisecondsSinceEpoch}'}),
      body: jsonEncode(bookingPayload),
    );
    return _handleResponse(res);
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
  // 8. UNIVERSAL TRACKER & SUPPORT
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
}

class DelivezApiException implements Exception {
  final int statusCode;
  final String message;
  final dynamic details;

  DelivezApiException(this.statusCode, this.message, [this.details]);

  @override
  String toString() => 'DelivezApiException($statusCode): $message';
}
