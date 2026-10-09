# CE Shipper – App shipper cho Android & iOS (React Native · Expo)

App native cho shipper: đăng nhập, xem việc lấy / giao / trả hoàn, quét mã vạch – QR, gọi khách, chỉ đường,
xác nhận lấy hàng, bắt đầu giao (OTP gửi người nhận), giao thành công (tiền thu, OTP, ảnh, chữ ký),
giao thất bại (lý do, hẹn ngày giao lại), trả hàng hoàn, tiền COD đang giữ & lịch sử nộp tiền,
lịch sử công việc theo ngày, đổi mật khẩu, chia sẻ vị trí GPS khi bật "Đang làm việc" (chạy nền).

App gọi API `/api/shipper/*` của máy chủ Courier Express (file `Controllers/Api/ShipperApiController.cs`).
Token đăng nhập là một phiên trong bảng `LoginSessions` → quản trị viên thu hồi được tại *Người dùng → Phiên đăng nhập*.

## 1. Chạy thử trên điện thoại (không cần build) – Expo Go

1. Cài **Node.js 20+**. Trên điện thoại cài app **Expo Go** (CH Play / App Store).
2. Chạy máy chủ web ở chế độ mạng LAN (profile `LAN (test App Shipper)` – lắng nghe `http://0.0.0.0:5180`),
   máy tính và điện thoại cùng Wi-Fi. Mở tường lửa Windows cho cổng 5180.
3. Trong thư mục này:
   ```bash
   npm install
   npx expo install --fix      # căn chỉnh phiên bản thư viện theo Expo SDK
   npx expo start
   ```
   Quét QR hiện ra bằng Expo Go (Android) hoặc Camera (iPhone).
4. Màn hình đăng nhập → bấm "Máy chủ" → nhập `http://<IP-máy-tính>:5180` (VD `http://192.168.1.10:5180`).
   Tài khoản demo: `shipper01` / `123456`.

> Nếu Expo Go báo *"Project is incompatible with this version of Expo Go"*: nâng SDK bằng
> `npx expo install expo@latest && npx expo install --fix` rồi chạy lại `npx expo start`.
>
> Trong Expo Go, GPS chỉ gửi khi app đang mở; chạy nền đầy đủ cần bản build (bước 2).

## 2. Build file cài đặt (APK cho Android, IPA cho iOS) – EAS Build trên đám mây

```bash
npm install -g eas-cli
eas login                       # tài khoản miễn phí tại expo.dev
eas build:configure             # lần đầu, chọn All
npm run build:apk               # Android APK cài trực tiếp để test  (profile "preview")
npm run build:android           # Android AAB để đưa lên Google Play
npm run build:ios               # iOS – cần tài khoản Apple Developer (99 USD/năm)
```
EAS build trên máy chủ của Expo, **không cần máy Mac** cho iOS. Xong sẽ có link tải APK / IPA.
- Cài iPhone bản test: `eas device:create` để đăng ký máy, rồi `eas build -p ios --profile preview`.
- Đưa lên store: `eas submit -p android` / `eas submit -p ios` (TestFlight → App Store).

## 2b. Build APK miễn phí bằng GitHub Actions (không cần tài khoản Expo, không cần Android Studio)

1. Tạo repository trên GitHub (để Private), đẩy **toàn bộ thư mục dự án** lên (gồm `.github/workflows/build-shipper-mobile-apk.yml`).
2. Vào tab **Actions** → chọn **Build Shipper Mobile APK** → **Run workflow** → (tùy chọn) nhập địa chỉ máy chủ, VD `http://192.168.1.10:5180`.
3. Chờ khoảng 15–20 phút → mở lần chạy vừa xong → mục **Artifacts** → tải **CE-Shipper-apk** (file .zip chứa `CE-Shipper-N.apk`).
4. Chép file `.apk` vào điện thoại → mở để cài (cho phép "Cài ứng dụng không rõ nguồn gốc" nếu được hỏi).

APK này ký bằng khóa debug, dùng để cài thử. Bản đưa lên Google Play dùng `npm run build:android` (EAS) hoặc cấu hình keystore riêng.

## 3. Cấu hình

| Mục | File | Ghi chú |
|---|---|---|
| Địa chỉ máy chủ mặc định | `app.json` → `expo.extra.defaultServerUrl` | Người dùng đổi được ngay trên màn hình đăng nhập |
| Tên app, mã định danh | `app.json` → `name`, `ios.bundleIdentifier`, `android.package` | Đổi trước khi đưa lên store |
| Icon / splash | `assets/icon.png`, `adaptive-icon.png`, `splash.png` | 1024×1024 |
| Màu thương hiệu | `src/theme.js` → `colors.brand` | |
| HTTP (không SSL) | `app.json` → `NSAllowsArbitraryLoads`, `usesCleartextTraffic` | Chỉ để test LAN. **Bản chính thức dùng HTTPS và tắt 2 mục này** |

## 4. Cấu trúc

```
App.js                     Điều hướng: Đăng nhập | Tab (Trang chủ, Công việc, Quét mã, COD, Tài khoản) + màn hình chi tiết
src/api.js                 Gọi API (token Bearer, timeout, thông báo lỗi tiếng Việt)
src/auth.js                Đăng nhập / đăng xuất, tự về màn hình đăng nhập khi phiên hết hạn
src/location.js            GPS: chạy nền (Android foreground service / iOS background), lưu đệm khi mất mạng
src/storage.js             Token lưu trong Keychain / Keystore (expo-secure-store)
src/theme.js, format.js    Màu sắc, định dạng tiền / ngày
src/components/            Nút, thẻ, ô nhập, thẻ công việc…
src/screens/               Login, Home, Tasks, Scan, Order, Deliver, Fail, Cod, History, Profile, ChangePassword
```

## 5. API máy chủ dùng bởi app

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| POST | `/api/shipper/auth/login` | Đăng nhập `{username, password, device}` → `{token, profile}` |
| POST | `/api/shipper/auth/logout`, `/auth/password` | Đăng xuất, đổi mật khẩu |
| GET | `/api/shipper/me` | Tổng quan: số việc, đã giao/lấy/thất bại hôm nay, COD đang giữ |
| GET | `/api/shipper/tasks?type=pickup\|delivery\|return` | Danh sách việc được phân công |
| GET | `/api/shipper/orders/{id}`, `/orders/by-code/{mã}` | Chi tiết đơn, hành trình, các thao tác được phép |
| POST | `/orders/{id}/pickup`, `/pickup-fail` | Xác nhận lấy hàng / lấy thất bại |
| POST | `/orders/{id}/start-delivery` | Bắt đầu giao (sinh OTP gửi người nhận) |
| POST | `/orders/{id}/deliver` (multipart) | Giao thành công: `collected`, `otp`, `recipientName`, `photo`, `signature` |
| POST | `/orders/{id}/fail` | Giao thất bại `{reasonId, note, rescheduleDate}` |
| POST | `/orders/{id}/return-done` | Đã trả hàng hoàn cho shop |
| GET | `/api/shipper/reasons`, `/history?date=`, `/cod` | Lý do thất bại, lịch sử, COD |
| POST | `/api/shipper/location` | Gửi mảng điểm GPS `[{lat, lng, at}]` |

Mọi request (trừ login) gửi header `Authorization: Bearer <token>`.
