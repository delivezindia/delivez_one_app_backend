import 'package:flutter/material.dart';

/// ============================================================================
/// DELIVEZ COURIER DELIVERY MODELS (Flutter / Dart)
/// Complete data models matching the Courier Delivery Flutter flow and API
/// ============================================================================

/// Master configuration model returned by GET /courier/options or /courier-delivery/options
class CourierDeliveryConfig {
  final List<CourierPackageCategory> packageCategories;
  final Map<String, List<CourierBoxType>> boxTypes;
  final List<CourierParcelType> parcelTypes;
  final Map<String, Map<String, double>> parcelDimensions;
  final List<CourierServiceOption> localOptions;
  final List<CourierServiceOption> intercityOptions;
  final List<CourierDropOption> dropOptions;
  final List<CourierInsuranceOption> insuranceOptions;

  const CourierDeliveryConfig({
    required this.packageCategories,
    required this.boxTypes,
    required this.parcelTypes,
    required this.parcelDimensions,
    required this.localOptions,
    required this.intercityOptions,
    required this.dropOptions,
    required this.insuranceOptions,
  });

  factory CourierDeliveryConfig.fromJson(Map<String, dynamic> json) {
    // 1. Package Categories
    final rawCats = json['package_categories'] ??
        json['packageCategories'] ??
        json['categories'] ??
        [];
    final categories = (rawCats as List)
        .map((e) => CourierPackageCategory.fromJson(e as Map<String, dynamic>))
        .toList();

    // 2. Box Types
    final rawBoxes = json['box_types'] ?? json['boxTypes'] ?? {};
    final Map<String, List<CourierBoxType>> boxMap = {};
    if (rawBoxes is Map) {
      rawBoxes.forEach((key, list) {
        if (list is List) {
          boxMap[key.toString()] = list
              .map((b) => CourierBoxType.fromJson(b as Map<String, dynamic>))
              .toList();
        }
      });
    }

    // 3. Parcel Types
    final rawParcels = json['parcel_types'] ?? json['parcelTypes'] ?? [];
    final parcelTypes = (rawParcels as List)
        .map((p) => CourierParcelType.fromJson(p as Map<String, dynamic>))
        .toList();

    // 4. Parcel Dimensions Map
    final rawDims = json['parcel_dimensions'] ?? json['parcelDimensions'] ?? {};
    final Map<String, Map<String, double>> dimMap = {};
    if (rawDims is Map) {
      rawDims.forEach((k, v) {
        if (v is Map) {
          dimMap[k.toString()] = {
            'length': (v['length'] as num?)?.toDouble() ?? 0.0,
            'width': (v['width'] as num?)?.toDouble() ?? 0.0,
            'height': (v['height'] as num?)?.toDouble() ?? 0.0,
          };
        }
      });
    }

    // 5. Local Options
    final rawLocal = json['local_options'] ??
        json['localOptions'] ??
        (json['delivery_services']?['local']) ??
        (json['deliveryServices']?['local']) ??
        [];
    final localOptions = (rawLocal as List)
        .map((s) => CourierServiceOption.fromJson(s as Map<String, dynamic>))
        .toList();

    // 6. Intercity Options
    final rawIntercity = json['intercity_options'] ??
        json['intercityOptions'] ??
        (json['delivery_services']?['intercity']) ??
        (json['deliveryServices']?['intercity']) ??
        [];
    final intercityOptions = (rawIntercity as List)
        .map((s) => CourierServiceOption.fromJson(s as Map<String, dynamic>))
        .toList();

    // 7. Drop Options (Self Service)
    final rawDrop = json['drop_options'] ??
        json['dropOptions'] ??
        json['self_service_options'] ??
        json['selfServiceOptions'] ??
        [];
    final dropOptions = (rawDrop as List)
        .map((d) => CourierDropOption.fromJson(d as Map<String, dynamic>))
        .toList();

    // 8. Insurance Options
    final rawInsurance = json['insurance_options'] ?? json['insuranceOptions'] ?? [];
    final insuranceOptions = (rawInsurance as List)
        .map((i) => CourierInsuranceOption.fromJson(i as Map<String, dynamic>))
        .toList();

    return CourierDeliveryConfig(
      packageCategories: categories,
      boxTypes: boxMap,
      parcelTypes: parcelTypes,
      parcelDimensions: dimMap,
      localOptions: localOptions,
      intercityOptions: intercityOptions,
      dropOptions: dropOptions,
      insuranceOptions: insuranceOptions,
    );
  }

  Map<String, dynamic> toJson() => {
        'package_categories': packageCategories.map((c) => c.toJson()).toList(),
        'box_types': boxTypes.map((k, v) => MapEntry(k, v.map((b) => b.toJson()).toList())),
        'parcel_types': parcelTypes.map((p) => p.toJson()).toList(),
        'parcel_dimensions': parcelDimensions,
        'local_options': localOptions.map((o) => o.toJson()).toList(),
        'intercity_options': intercityOptions.map((o) => o.toJson()).toList(),
        'drop_options': dropOptions.map((d) => d.toJson()).toList(),
        'insurance_options': insuranceOptions.map((i) => i.toJson()).toList(),
      };

  /// Helper to get box list for given weight e.g. '10 Kg', '15 Kg', '25 Kg'
  List<CourierBoxType> getBoxesForWeight(String weight) {
    return boxTypes[weight] ?? [];
  }
}

/// ============================================================================
/// 1. Package Content Category
/// ============================================================================
class CourierPackageCategory {
  final String title;
  final String subtitle;
  final String apiCode;
  final String iconName;
  final String bgColorHex;
  final String iconColorHex;
  final String? iconUrl;
  final String? imageUrl;
  final String? pngUrl;
  final String? svgUrl;
  final String? lottieUrl;

  const CourierPackageCategory({
    required this.title,
    required this.subtitle,
    required this.apiCode,
    required this.iconName,
    required this.bgColorHex,
    required this.iconColorHex,
    this.iconUrl,
    this.imageUrl,
    this.pngUrl,
    this.svgUrl,
    this.lottieUrl,
  });

  factory CourierPackageCategory.fromJson(Map<String, dynamic> json) {
    return CourierPackageCategory(
      title: json['title'] ?? '',
      subtitle: json['subtitle'] ?? '',
      apiCode: json['apiCode'] ?? json['id'] ?? '',
      iconName: json['iconName'] ?? json['icon_name'] ?? json['icon'] ?? 'inventory_2_outlined',
      bgColorHex: json['bgColor'] ?? json['bgColorHex'] ?? '#FFF9E6',
      iconColorHex: json['iconColor'] ?? json['iconColorHex'] ?? '#D97706',
      iconUrl: json['iconUrl'] ?? json['icon_url'] ?? json['icon'],
      imageUrl: json['imageUrl'] ?? json['image_url'] ?? json['image'] ?? json['pngUrl'],
      pngUrl: json['pngUrl'] ?? json['png_url'] ?? json['imageUrl'] ?? json['icon'],
      svgUrl: json['svgUrl'] ?? json['svg_url'],
      lottieUrl: json['lottieUrl'] ?? json['lottie_url'] ?? (json['lottie'] is Map ? json['lottie']['lottieUrl'] : null),
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'subtitle': subtitle,
        'apiCode': apiCode,
        'icon': iconUrl ?? iconName,
        'iconUrl': iconUrl,
        'imageUrl': imageUrl,
        'pngUrl': pngUrl,
        'svgUrl': svgUrl,
        'lottieUrl': lottieUrl,
        'bgColor': bgColorHex,
        'iconColor': iconColorHex,
      };

  Color get bgColor => _parseHexColor(bgColorHex, const Color(0xFFFFF9E6));
  Color get iconColor => _parseHexColor(iconColorHex, const Color(0xFFD97706));

  bool get isNetworkImage => (imageUrl != null && imageUrl!.startsWith('http')) || (iconUrl != null && iconUrl!.startsWith('http') && !iconUrl!.endsWith('.json'));
  bool get isLottie => (lottieUrl != null && lottieUrl!.isNotEmpty) || (iconUrl != null && iconUrl!.endsWith('.json'));
  String get effectiveImageUrl => imageUrl ?? iconUrl ?? (iconName.startsWith('http') ? iconName : '');
  String get effectiveLottieUrl => lottieUrl ?? (iconName.endsWith('.json') ? iconName : '');

  IconData get icon {
    String key = iconName;
    if (key.contains('/')) {
      final parts = key.split('/');
      key = parts.last.replaceAll('.json', '');
    }
    switch (key) {
      case 'documents':
      case 'description_outlined':
      case 'description':
        return Icons.description_outlined;
      case 'electronics':
      case 'smartphone_outlined':
      case 'smartphone':
        return Icons.smartphone_outlined;
      case 'clothing':
      case 'checkroom_outlined':
      case 'checkroom':
        return Icons.checkroom_outlined;
      case 'card_giftcard_outlined':
      case 'card_giftcard':
        return Icons.card_giftcard_outlined;
      case 'medicine':
      case 'health_medicine':
      case 'medication_outlined':
      case 'medication':
        return Icons.medication_outlined;
      case 'household':
      case 'household_items':
      case 'soup_kitchen_outlined':
      case 'soup_kitchen':
        return Icons.soup_kitchen_outlined;
      case 'commercial':
      case 'commercial_goods':
      case 'inventory_2_outlined':
      case 'inventory_2':
        return Icons.inventory_2_outlined;
      case 'more_horiz_outlined':
      case 'more_horiz':
      default:
        return Icons.more_horiz_outlined;
    }
  }
}

/// ============================================================================
/// 2. Box Type (10 Kg, 15 Kg, 25 Kg)
/// ============================================================================
class CourierBoxType {
  final String title;
  final String dimensions;
  final double lengthCm;
  final double widthCm;
  final double heightCm;
  final String tag;
  final String capacity;

  const CourierBoxType({
    required this.title,
    required this.dimensions,
    required this.lengthCm,
    required this.widthCm,
    required this.heightCm,
    required this.tag,
    required this.capacity,
  });

  factory CourierBoxType.fromJson(Map<String, dynamic> json) {
    return CourierBoxType(
      title: json['title'] ?? '',
      dimensions: json['dimensions'] ?? '',
      lengthCm: (json['lengthCm'] as num?)?.toDouble() ?? 0.0,
      widthCm: (json['widthCm'] as num?)?.toDouble() ?? 0.0,
      heightCm: (json['heightCm'] as num?)?.toDouble() ?? 0.0,
      tag: json['tag'] ?? '',
      capacity: json['capacity'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'dimensions': dimensions,
        'lengthCm': lengthCm,
        'widthCm': widthCm,
        'heightCm': heightCm,
        'tag': tag,
        'capacity': capacity,
      };
}

/// ============================================================================
/// 3. Parcel Type
/// ============================================================================
class CourierParcelType {
  final String title;
  final String weight;
  final String dimensions;
  final double? lengthCm;
  final double? widthCm;
  final double? heightCm;
  final bool isCustom;

  const CourierParcelType({
    required this.title,
    required this.weight,
    required this.dimensions,
    this.lengthCm,
    this.widthCm,
    this.heightCm,
    this.isCustom = false,
  });

  factory CourierParcelType.fromJson(Map<String, dynamic> json) {
    return CourierParcelType(
      title: json['title'] ?? '',
      weight: json['weight'] ?? '',
      dimensions: json['dimensions'] ?? '',
      lengthCm: (json['lengthCm'] as num?)?.toDouble(),
      widthCm: (json['widthCm'] as num?)?.toDouble(),
      heightCm: (json['heightCm'] as num?)?.toDouble(),
      isCustom: json['isCustom'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'weight': weight,
        'dimensions': dimensions,
        'lengthCm': lengthCm,
        'widthCm': widthCm,
        'heightCm': heightCm,
        'isCustom': isCustom,
      };
}

/// ============================================================================
/// 4. Service Type Option (Local & Intercity)
/// ============================================================================
class CourierServiceTag {
  final String label;
  final String iconName;

  const CourierServiceTag({required this.label, required this.iconName});

  factory CourierServiceTag.fromJson(Map<String, dynamic> json) {
    return CourierServiceTag(
      label: json['label'] ?? '',
      iconName: json['icon'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'label': label,
        'icon': iconName,
      };

  IconData get icon {
    switch (iconName) {
      case 'bolt':
        return Icons.bolt;
      case 'location_on_outlined':
        return Icons.location_on_outlined;
      case 'verified_user_outlined':
        return Icons.verified_user_outlined;
      case 'calendar_today_outlined':
        return Icons.calendar_today_outlined;
      case 'home_outlined':
        return Icons.home_outlined;
      case 'eco_outlined':
        return Icons.eco_outlined;
      case 'rocket_launch_outlined':
        return Icons.rocket_launch_outlined;
      case 'savings_outlined':
        return Icons.savings_outlined;
      case 'access_time':
        return Icons.access_time;
      case 'notifications_none':
        return Icons.notifications_none;
      default:
        return Icons.check_circle_outline;
    }
  }
}

class CourierServiceOption {
  final String? id;
  final String title;
  final String? badge;
  final String? badgeColorHex;
  final String? badgeTextColorHex;
  final String description;
  final List<CourierServiceTag> tags;
  final String deliveryTime;
  final String price;
  final double basePrice;
  final String iconName;

  const CourierServiceOption({
    this.id,
    required this.title,
    this.badge,
    this.badgeColorHex,
    this.badgeTextColorHex,
    required this.description,
    required this.tags,
    required this.deliveryTime,
    required this.price,
    required this.basePrice,
    required this.iconName,
  });

  factory CourierServiceOption.fromJson(Map<String, dynamic> json) {
    final rawTags = json['tags'] as List? ?? [];
    return CourierServiceOption(
      id: json['id'],
      title: json['title'] ?? '',
      badge: json['badge'],
      badgeColorHex: json['badgeColor'] ?? json['badgeColorHex'],
      badgeTextColorHex: json['badgeTextColor'] ?? json['badgeTextColorHex'],
      description: json['description'] ?? '',
      tags: rawTags.map((t) => CourierServiceTag.fromJson(t as Map<String, dynamic>)).toList(),
      deliveryTime: json['deliveryTime'] ?? '',
      price: json['price'] ?? '',
      basePrice: (json['basePrice'] as num?)?.toDouble() ?? 0.0,
      iconName: json['icon'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'badge': badge,
        'badgeColor': badgeColorHex,
        'badgeTextColor': badgeTextColorHex,
        'description': description,
        'tags': tags.map((t) => t.toJson()).toList(),
        'deliveryTime': deliveryTime,
        'price': price,
        'basePrice': basePrice,
        'icon': iconName,
      };

  Color? get badgeColor => badgeColorHex != null ? _parseHexColor(badgeColorHex!, const Color(0xFFEF4444)) : null;
  Color? get badgeTextColor => badgeTextColorHex != null ? _parseHexColor(badgeTextColorHex!, Colors.white) : null;

  IconData get icon {
    switch (iconName) {
      case 'two_wheeler':
        return Icons.two_wheeler;
      case 'local_shipping_outlined':
        return Icons.local_shipping_outlined;
      case 'flight_takeoff':
        return Icons.flight_takeoff;
      case 'local_shipping_sharp':
        return Icons.local_shipping_sharp;
      case 'local_shipping':
        return Icons.local_shipping;
      case 'flash_on':
        return Icons.flash_on;
      case 'edit_calendar_outlined':
        return Icons.edit_calendar_outlined;
      case 'calendar_month':
        return Icons.calendar_month;
      default:
        return Icons.local_shipping;
    }
  }
}

/// ============================================================================
/// 5. Drop Option (Self Service)
/// ============================================================================
class CourierDropOption {
  final int index;
  final String id;
  final String title;
  final String badge;
  final String price;
  final double basePrice;
  final String desc;
  final List<String> tags;
  final String iconName;

  const CourierDropOption({
    required this.index,
    required this.id,
    required this.title,
    required this.badge,
    required this.price,
    required this.basePrice,
    required this.desc,
    required this.tags,
    required this.iconName,
  });

  factory CourierDropOption.fromJson(Map<String, dynamic> json) {
    return CourierDropOption(
      index: json['index'] ?? 0,
      id: json['id'] ?? (json['index'] == 0 ? 'SELF_PICKUP' : 'SELF_DROP'),
      title: json['title'] ?? '',
      badge: json['badge'] ?? '',
      price: json['price'] ?? '',
      basePrice: (json['basePrice'] as num?)?.toDouble() ?? 0.0,
      desc: json['desc'] ?? json['description'] ?? '',
      tags: (json['tags'] as List? ?? []).map((e) => e.toString()).toList(),
      iconName: json['icon'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'index': index,
        'id': id,
        'title': title,
        'badge': badge,
        'price': price,
        'basePrice': basePrice,
        'desc': desc,
        'tags': tags,
        'icon': iconName,
      };

  IconData get icon {
    switch (iconName) {
      case 'directions_run_outlined':
        return Icons.directions_run_outlined;
      case 'storefront_outlined':
        return Icons.storefront_outlined;
      default:
        return Icons.storefront_outlined;
    }
  }
}

/// ============================================================================
/// 6. Insurance Option
/// ============================================================================
class CourierInsuranceOption {
  final int index;
  final String id;
  final String title;
  final String subtitle;
  final String iconName;
  final bool isRecommended;
  final double coverageLimit;
  final double ratePercent;

  const CourierInsuranceOption({
    required this.index,
    required this.id,
    required this.title,
    required this.subtitle,
    required this.iconName,
    this.isRecommended = false,
    this.coverageLimit = 0.0,
    this.ratePercent = 0.0,
  });

  factory CourierInsuranceOption.fromJson(Map<String, dynamic> json) {
    return CourierInsuranceOption(
      index: json['index'] ?? 0,
      id: json['id'] ?? json['apiCode'] ?? '',
      title: json['title'] ?? '',
      subtitle: json['subtitle'] ?? json['description'] ?? '',
      iconName: json['icon'] ?? '',
      isRecommended: json['isRecommended'] == true,
      coverageLimit: (json['coverageLimit'] as num?)?.toDouble() ?? 0.0,
      ratePercent: (json['ratePercent'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
        'index': index,
        'id': id,
        'title': title,
        'subtitle': subtitle,
        'icon': iconName,
        'isRecommended': isRecommended,
        'coverageLimit': coverageLimit,
        'ratePercent': ratePercent,
      };

  IconData get icon {
    switch (iconName) {
      case 'shield_outlined':
        return Icons.shield_outlined;
      case 'gpp_maybe_outlined':
        return Icons.gpp_maybe_outlined;
      case 'gpp_bad_outlined':
        return Icons.gpp_bad_outlined;
      default:
        return Icons.shield_outlined;
    }
  }
}

/// Helper color parser supporting hex strings "#RRGGBB", "0xFFRRGGBB", etc.
Color _parseHexColor(String hex, Color fallback) {
  try {
    String cleanHex = hex.trim().replaceAll('#', '').replaceAll('0x', '').replaceAll('0X', '');
    if (cleanHex.length == 6) {
      cleanHex = 'FF$cleanHex';
    }
    return Color(int.parse(cleanHex, radix: 16));
  } catch (_) {
    return fallback;
  }
}


/// ============================================================================
/// 7. Courier Delivery Order / Booking (with actualPrice)
/// ============================================================================
class CourierPricing {
  final double baseFare;
  final double boxFee;
  final double handlingFee;
  final double insuranceFee;
  final double discount;
  final double tax;
  final double totalPayable;

  const CourierPricing({
    this.baseFare = 0.0,
    this.boxFee = 0.0,
    this.handlingFee = 0.0,
    this.insuranceFee = 0.0,
    this.discount = 0.0,
    this.tax = 0.0,
    this.totalPayable = 0.0,
  });

  factory CourierPricing.fromJson(Map<String, dynamic> json) {
    return CourierPricing(
      baseFare: (json['baseFare'] as num?)?.toDouble() ?? 0.0,
      boxFee: (json['boxFee'] as num?)?.toDouble() ?? 0.0,
      handlingFee: (json['handlingFee'] as num?)?.toDouble() ?? 0.0,
      insuranceFee: (json['insuranceFee'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      totalPayable: (json['totalPayable'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
        'baseFare': baseFare,
        'boxFee': boxFee,
        'handlingFee': handlingFee,
        'insuranceFee': insuranceFee,
        'discount': discount,
        'tax': tax,
        'totalPayable': totalPayable,
      };
}

class CourierDeliveryOrder {
  final String? id;
  final String? bookingNumber;
  final String serviceType;
  final String deliverySpeed;
  final double actualPrice;
  final CourierPricing? pricing;

  const CourierDeliveryOrder({
    this.id,
    this.bookingNumber,
    required this.serviceType,
    required this.deliverySpeed,
    this.actualPrice = 0.0,
    this.pricing,
  });

  factory CourierDeliveryOrder.fromJson(Map<String, dynamic> json) {
    return CourierDeliveryOrder(
      id: json['id'],
      bookingNumber: json['bookingNumber'],
      serviceType: json['serviceType'] ?? '',
      deliverySpeed: json['deliverySpeed'] ?? '',
      actualPrice: (json['actualPrice'] as num?)?.toDouble() ?? 0.0,
      pricing: json['pricing'] != null
          ? CourierPricing.fromJson(json['pricing'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        if (bookingNumber != null) 'bookingNumber': bookingNumber,
        'serviceType': serviceType,
        'deliverySpeed': deliverySpeed,
        'actualPrice': actualPrice,
        if (pricing != null) 'pricing': pricing!.toJson(),
      };
}
