@PRD.md Hãy đóng vai trò là Principal System Architect và Game Designer cho dự án LinguaWorld. 

Nhiệm vụ của bạn là nghiên cứu và tích hợp hệ thống "Cột mốc Thông thạo Ngôn ngữ theo mô hình 7 Luân Xa (7-Chakra Proficiency Milestones)" vào kiến trúc của LinguaWorld, sau đó cập nhật trực tiếp vào tài liệu PRD và tạo file thiết kế kỹ thuật `docs/chakra-milestone-architecture.md`.

### 1. Ràng buộc cốt lõi từ PRD (Bắt buộc tuân thủ):
- **Tách biệt Level RPG và Trình độ ngôn ngữ (Mục 5.2 & 7):** `Character Level` (dựa trên EXP cày cuốc) hoàn toàn độc lập với `Chakra Milestone` (dựa trên năng lực ghi nhớ từ vựng và kỹ năng thực tế đã được FSRS xác thực).
- **Không trừng phạt khi vắng mặt (Mục 7):** Các Luân Xa đã khai mở không bao giờ bị hạ cấp hay khóa lại khi người chơi nghỉ học dài ngày.
- **Không chặn quyền học tập (Mục 5.3 & 7):** Việc mở khóa vùng đất (Regions) trong Godot có thể gắn với Luân Xa, nhưng người dùng luôn được phép truy cập bài học và ôn tập SRS đến hạn bất kể trạng thái vùng đất.
- **Backend nắm quyền quyết định (Mục 7):** Mọi tính toán khai mở Luân Xa phải được xác thực từ dữ liệu FSRS và lịch sử học tập trên Backend.

### 2. Yêu cầu thiết kế chi tiết trong `docs/chakra-milestone-architecture.md`:
Hãy thiết kế hệ thống bao gồm 4 phần sau:

**Phần A: Ánh xạ Vĩ mô (Macro-Milestones: 7 Luân Xa ↔ 7 Bậc HSK 3.0 & Vùng đất Godot)**
Thiết kế bảng thông số và điều kiện mở khóa cho 7 Luân Xa tương ứng với 7 cột mốc HSK 3.0 (Band 1, Band 2, Band 3, Band 4, Band 5, Band 6, và Band 7-9):
1. Muladhara (Gốc - Đỏ - Đất) ↔ HSK 3.0 Band 1 (Ngôn ngữ sinh tồn, 300-500 từ, Pinyin, 100 chữ viết cơ bản).
2. Svadhisthana (Xương cùng - Cam - Nước) ↔ HSK 3.0 Band 2 (Giao tiếp cảm xúc & thói quen hàng ngày).
3. Manipura (Đám rối dương - Vàng - Lửa) ↔ HSK 3.0 Band 3 (Tự chủ giải quyết tác vụ thực tế).
4. Anahata (Tim - Xanh lá - Khí) ↔ HSK 3.0 Band 4 (Thấu cảm văn hóa & giao tiếp trung cấp).
5. Vishuddha (Cổ họng - Xanh lam - Không gian) ↔ HSK 3.0 Band 5 (Biểu đạt, thuyết phục & đọc hiểu báo chí).
6. Ajna (Con mắt thứ ba - Chàm - Ánh sáng) ↔ HSK 3.0 Band 6 (Trực giác ngôn ngữ, hiểu hàm ý & thành ngữ).
7. Sahasrara (Vương miện - Tím - Tư tưởng) ↔ HSK 3.0 Band 7-9 (Làm chủ học thuật và chuyên ngành).
-> Định nghĩa rõ công thức điều kiện mở khóa từng Luân Xa dựa trên: Số lượng từ vựng đạt ngưỡng `FSRS Stability (S) >= X ngày`, tỷ lệ `Accuracy` theo kỹ năng, và số lượng `NPC Story Quests` hoàn thành.

**Phần B: Ánh xạ Vi mô (Micro-Milestones trong từng Unit bài học)**
Trong cấu trúc `Course -> Unit -> Lesson -> Activity`, thiết kế vòng lặp 7 bước tiến hóa năng lượng cho mỗi Unit:
- Từ Nhận diện âm thanh/Pinyin (Gốc) -> Hiểu nghĩa từ vựng (Xương cùng) -> Cấu trúc ngữ pháp (Đám rối dương) -> Ngữ cảnh văn hóa (Tim) -> Phản xạ tạo câu/hội thoại (Cổ họng) -> Nhận diện mặt chữ Hán không Pinyin & Bộ thủ (Con mắt thứ ba) -> Đạt độ ổn định trí nhớ FSRS & hoàn thành Quest thực tế trong Godot (Vương miện).

**Phần C: Cơ chế Chẩn đoán Học tập "Khai thông dòng chảy" (Non-punitive Diagnostic State)**
Thay vì phạt người chơi, hãy thiết kế thuật toán phát hiện "Điểm nghẽn kỹ năng" (Skill Bottlenecks):
- Ví dụ: Nếu tỷ lệ nhớ mặt chữ Hán thấp hoặc hay sai bộ thủ -> Luân xa số 6 (Ajna) hiển thị gợi ý bài tập "Thiền định Chữ Hán" (5 phút ôn tập tập trung các thẻ yếu).
- Nếu tồn đọng quá nhiều thẻ FSRS overdue -> Luân xa số 1 (Muladhara) hiển thị nhiệm vụ "Củng cố nền tảng" với phần thưởng cộng thêm Gold/EXP khi hoàn thành.

**Phần D: Đặc tả Kỹ thuật (Database Schema, API Contract & Nuxt ↔ Godot Bridge)**
1. Thiết kế các bảng dữ liệu (hoặc Prisma/Drizzle schema): `chakra_definitions`, `user_chakra_progress`, `unit_chakra_nodes`.
2. Định nghĩa REST/TRPC API endpoints để Nuxt lấy tiến độ Luân Xa và Backend tự động đánh giá nâng cấp Luân Xa sau mỗi phiên FSRS review.
3. Định nghĩa JSON payload truyền qua `Nuxt <-> Godot Bridge` (JavaScriptBridge) để Godot 2D render hiệu ứng Hào quang nhân vật (Character Aura), mở khóa cổng Vùng đất (Region Gate) và thay đổi lời thoại NPC theo cấp độ Luân Xa hiện tại.