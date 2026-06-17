# CUBIX Changelog

## [1.0.0] - 2026-06-17
### Added
- İlk kararlı sürüm yayınlandı.
- Dinamik 3D Küp Bulmaca mekanikleri entegre edildi.
- Puan (Score) ve Altın (Gold) ekonomisi kuruldu.
- AdMob Entegrasyonu yapıldı (Ödüllü reklam sistemi: Gold kazanma ve ekstra süre).
- Market (Shop) yapısı ve Profil arayüzü kuruldu.
- "Yakında" sekmesi (Temalar, Efektler vb.) eklendi.
- `localStorage` üzerinden profil kayıt mekanizması eklendi.

### Changed
- Ekran ölçeklendirmesi (Responsive) %100 her cihaza uyumlu hale getirildi (`flex-box`, `vh`, `vw`, `safe-area-inset` yapısı ile tasarlandı).
- UI/UX kalitesi artırıldı. Oyun modalları cihaz dışına taşmayacak şekilde geliştirildi.
- Test AdMob kimlikleri temizlendi, Release build aşamasına hazır hale getirildi.

### Fixed
- Mobil cihazlarda sanal klavye açıldığında Ayarlar / Modalların ekrandan dışarı taşması engellendi.
- Oyun sonu "Reklam İzleyerek İkiye Katla" mekanizmasının erken tetiklenme/Gold vermeme hatası giderildi.
- Alt navigasyon çubuğu simgeleri modernize edildi ve tablet formatlarına uygun olarak küçültüldü.
