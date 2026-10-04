# AGENTS.md — Lingoplay

Tài liệu này quy định cách coding agent làm việc trong project **Lingoplay**.

Mục tiêu là website học tiếng Anh qua mini game: Astro cho routing/content/SEO, React cho interaction, data độc lập; đơn giản, nhanh và dễ bảo trì.

## 1. Nguyên tắc quan trọng nhất

Ưu tiên **giải pháp nhỏ nhất nhưng vẫn đúng**.

Không viết code để trông phức tạp hoặc “professional” hơn mức cần thiết.

Khi có nhiều giải pháp, ưu tiên theo thứ tự:

1. Không cần code mới.
2. Tái sử dụng code hiện có.
3. HTML/CSS/Browser API native.
4. API có sẵn của React/Astro.
5. Dependency đã có.
6. Viết một lượng code mới nhỏ và rõ ràng.
7. Chỉ thêm dependency hoặc abstraction mới khi thực sự cần.

Luôn ưu tiên:

- ít complexity;
- ít dependency;
- ít abstraction;
- ít state;
- ít file không cần thiết;
- code dễ đọc;
- dễ sửa;
- dễ test.

Không tối ưu cho số dòng code ít nhất bằng mọi giá. Tối ưu cho **smallest correct solution**.

## 2. YAGNI

Không xây dựng functionality chỉ vì “sau này có thể cần”.

Đặc biệt, hiện tại KHÔNG tự thêm:

- backend;
- database;
- authentication;
- account;
- API server;
- cloud sync;
- multiplayer;
- leaderboard online;
- state-management library;
- hệ thống plugin;
- kiến trúc đa ngôn ngữ phức tạp.

Phiên bản đầu tiên tập trung vào **English vocabulary learning MVP**.

Tiếng Việt có thể được bổ sung sau nhưng không xây architecture phức tạp cho Vietnamese ngay từ đầu.

Nếu cần lưu progress phía client, ưu tiên `localStorage`.

## 3. Tech stack

Stack mặc định:

- Astro (routing, HTML SEO, Content Collections)
- React
- TypeScript
- CSS
- Browser APIs

Không đổi framework nếu người dùng không yêu cầu.

Không cài UI framework hoặc component library chỉ để giải quyết những thứ CSS/React đơn giản đã làm được.

Trước khi thêm dependency mới phải kiểm tra:

1. Browser có hỗ trợ native không?
2. React/Astro có giải quyết được không?
3. Dependency hiện tại có giải quyết được không?
4. Viết một đoạn code nhỏ có đơn giản hơn thêm dependency không?

Nếu có thì không cài package mới.

## 4. UI/UX

Project ưu tiên trải nghiệm trực quan, sạch và hiện đại.

Khi thiết kế hoặc cải thiện UI:

- sử dụng **Impeccable** nếu skill/tool này có sẵn trong môi trường;
- dùng Impeccable để hỗ trợ các quyết định về layout, spacing, hierarchy, typography, responsive và interaction;
- không cài Impeccable thành runtime dependency nếu nó chỉ là skill/tool của coding agent;
- không sao chép nguyên giao diện của website hoặc phần mềm khác.

Games to Learn English và các sản phẩm tương tự chỉ được dùng làm **tham khảo về ý tưởng UX và learning flow**, không clone giao diện, assets, branding hoặc source code.

UI phải:

- dễ hiểu với người mới;
- responsive;
- sử dụng tốt trên desktop/laptop;
- có accessibility cơ bản;
- không có animation thừa;
- không hy sinh usability để đổi lấy hiệu ứng đẹp.

Mỗi game cần kiểm tra desktop, tablet và mobile; keyboard và touch đều là interaction cốt lõi.

## 5. Core UX của Lingoplay

Homepage game-first, filter kỹ năng native; topic optional. Không dùng Easy/Medium/Hard làm progression chính. Giữ EN/VI là UI locale, learning target English. Game có session ngắn, hình/audio/đáp án ưu tiên, feedback gọn, keyboard/touch và reload/restart/results.

Không thêm PixiJS hay dependency game/audio trong MVP. Impeccable chỉ dùng nếu có sẵn; không cài chỉ vì thiếu tool.

## 6. Content và learning memory

Một canonical Word dùng chung các game, ID ổn định. Media URLs/alt đến từ data; renderer không đoán filename/provider. Eligibility lọc trước rank/count. `learningRank` là editorial priority, `frequencyRank` chỉ khi có nguồn xác thực. Topics có priority.

Oxford 3000 là nguồn đối chiếu membership; các subset 300 ⊂ 1.200 ⊂ 3.000 do Lingoplay curate. Không copy definitions/examples/artwork/audio của Oxford. Demo 50 từ, ít nhất20 media phù hợp; ghi provenance. Cumulative targets không đồng nghĩa đã có đủ content.

Memory localStorage theo canonical ID; mastery cần đúng ở3 ngày khác nhau, lịch1d/7d/60d, sai5h. Không biến completed/seen IDs cũ thành mastery. Không xóa progress cũ. Supabase metadata/auth/sync là backlog, chưa implement.

## 7. Component và architecture

Trước khi tạo component mới, kiểm tra xem component hiện tại có thể mở rộng một cách rõ ràng hay không.

Không tạo component chỉ để bọc vài dòng JSX.

Không tự tạo:

- service layer;
- repository pattern;
- factory;
- manager;
- adapter;
- generic abstraction;
- custom hook chỉ dùng một lần;
- utility file cho logic rất nhỏ;
- config system cho một vài giá trị cố định.

Chỉ abstraction khi pattern lặp lại thực sự xuất hiện.

Duplication nhỏ và dễ hiểu đôi khi tốt hơn abstraction quá sớm.

Tuy nhiên, những phần có domain rõ ràng như vocabulary, media eligibility, learning memory hoặc lesson data có thể tách riêng khi điều đó thực sự giúp code dễ hiểu và tái sử dụng.

## 8. State

Ưu tiên state đơn giản nhất.

Thứ tự ưu tiên:

1. giá trị tính trực tiếp;
2. local component state;
3. React Context nếu thực sự có state dùng chung;
4. chỉ cân nhắc state-management library khi các cách trên không còn phù hợp.

Không cài Redux, Zustand hoặc library tương tự chỉ để quản lý một lượng state nhỏ.

Không duplicate state nếu giá trị có thể derive từ state hiện tại.

## 9. Styling

Ưu tiên CSS đơn giản.

Không tạo design system phức tạp ngay từ đầu.

Có thể dùng một số CSS variables cho những giá trị thực sự dùng lặp lại như:

- background;
- foreground;
- primary;
- border;
- spacing cơ bản;
- border radius.

Không tạo hàng chục design token khi project chưa cần.

Không dùng JavaScript cho layout hoặc visual effect nếu CSS làm được.

## 10. Trước khi code

Trước mỗi task:

1. Đọc yêu cầu đầy đủ.
2. Kiểm tra `git status`.
3. Đọc code liên quan.
4. Kiểm tra project đã có functionality/component tương tự chưa.
5. Xác định giải pháp nhỏ nhất.
6. Sau đó mới sửa code.

Không sửa những phần không liên quan.

Không refactor code đang chạy tốt chỉ vì muốn tổ chức theo cách khác.

Không ghi đè thay đổi của người dùng.

## 11. Khi nào cần hỏi

Không hỏi người dùng về những quyết định kỹ thuật nhỏ mà agent có thể tự quyết hợp lý.

Phải hỏi trước nếu:

- requirement có nhiều cách hiểu quan trọng;
- quyết định làm thay đổi đáng kể architecture;
- cần đổi framework;
- cần thêm backend/database;
- cần dependency lớn;
- có breaking change;
- có nguy cơ mất dữ liệu;
- thay đổi đáng kể cách deploy;
- lựa chọn ảnh hưởng trực tiếp đến behavior mà người dùng mong muốn.

Nếu có thể chọn một default hợp lý, dễ hoàn tác và không thay đổi requirement thì tự quyết và tiếp tục.

## 12. Fix bug

Khi sửa bug:

1. reproduce;
2. tìm root cause;
3. đọc data/state flow liên quan;
4. sửa tại nguyên nhân;
5. kiểm tra regression.

Không thêm workaround chỉ để che lỗi.

Không suppress error chỉ để build/test pass.

Không refactor phần không liên quan trong lúc sửa bug.

## 13. Accessibility

Không bỏ accessibility chỉ để giảm code.

Ít nhất phải đảm bảo:

- semantic HTML khi phù hợp;
- button thực sự dùng `<button>`;
- keyboard navigation cho UI tương tác;
- focus state nhìn thấy được;
- contrast đủ đọc;
- label/ARIA khi UI không thể hiểu bằng semantic HTML thông thường.

Đặc biệt vì đây là ứng dụng liên quan đến bàn phím, keyboard interaction phải được coi là behavior cốt lõi.

## 14. Performance

Không premature optimization.

Nhưng tránh:

- re-render rõ ràng không cần thiết;
- event listener bị đăng ký lặp;
- asset quá lớn;
- dependency lớn cho functionality nhỏ;
- animation gây lag khi typing.

Typing input phải phản hồi ngay.

Không để animation hoặc visual effect ảnh hưởng đến cảm giác gõ.

## 15. Test

Sau mỗi feature quan trọng, chạy check phù hợp.

Trước khi hoàn thành task, tối thiểu kiểm tra nếu project hỗ trợ:

- TypeScript;
- lint;
- build;
- behavior vừa thay đổi.

Với game interaction, phải kiểm tra thực tế:

- trả lời/gõ/ghép đúng;
- trả lời/gõ/ghép sai;
- Backspace nếu feature cho phép;
- chuyển câu/bảng matching;
- hoàn thành round;
- keyboard focus và touch targets;
- hình/audio, replay và media failure;
- restart/reload khi relevant.

Không tạo hệ thống test lớn cho logic rất nhỏ nếu project chưa cần.

Nhưng logic quan trọng như scoring, accuracy, matching state hoặc learning progression/SRS cần có cách kiểm tra đáng tin cậy khi được triển khai.

## 16. Test như người dùng thật

Browser integration failure must not block the roadmap when equivalent QA can be performed with Playwright, the Codex built-in browser, or another safe local validation method.

Với localhost/local development, ưu tiên automated tests / Playwright, sau đó Codex built-in browser, rồi Chrome Integration khi thực sự cần. Nếu Chrome disconnect, tự chuyển sang phương pháp QA tương đương; chỉ báo BLOCKED khi không còn cách hợp lý để kiểm tra feature. Ghi rõ phương pháp và kết quả thực tế.

Sau khi implementation xong, nếu môi trường cho phép:

1. mở app;
2. đi qua flow thực tế;
3. click navigation;
4. bắt đầu game;
5. chọn/ghép/gõ bằng keyboard và touch;
6. kiểm tra correct/incorrect state;
7. hoàn thành round/result;
8. kiểm tra responsive relevant;
9. reload;
10. kiểm tra console error.

Không chỉ chứng minh rằng code compile.

Phải chứng minh workflow người dùng hoạt động.

## 17. Git

Không:

- force push;
- rewrite history;
- revert thay đổi của người dùng;
- commit secret;
- commit debug/test junk.

Trước khi kết thúc kiểm tra:

```bash
git diff
git status
```

Nếu đề xuất commit message, viết ngắn gọn bằng tiếng Việt và giữ thuật ngữ English khi phù hợp.

Ví dụ:

```text
feat: thêm giao diện luyện phím cơ bản
fix: sửa highlight sai ngón tay
```

## 18. Documentation

Không tạo nhiều documentation chỉ để có documentation.

Chỉ tạo/cập nhật tài liệu khi nó thực sự giúp project.

`README.md` nên chứa tối thiểu:

- project là gì;
- tech stack;
- cách cài;
- cách chạy;
- cách build.

Nếu sau này architecture hoặc data model trở nên đủ phức tạp thì mới cân nhắc thêm tài liệu riêng.

Không bắt buộc tạo `ARCHITECTURE.md`, `DATA_MODEL.md` hoặc `ROADMAP.md` cho một project nhỏ nếu chúng chưa mang lại giá trị.

## 19. Trước khi báo hoàn thành

Tự kiểm tra:

- Có làm thứ người dùng không yêu cầu không?
- Có abstraction không cần thiết không?
- Có dependency mới không cần thiết không?
- Có thể dùng native solution không?
- Có duplicate state không?
- Có file thừa không?
- Typing interaction có phản hồi tốt không?
- Matching, media eligibility và learning scheduling có đúng không?
- Accessibility cơ bản còn hoạt động không?
- Build có thành công không?
- Có console error không?
- Có debug code hoặc secret không?

Nếu phát hiện complexity không cần thiết, đơn giản hóa trước khi hoàn thành.

## 20. Báo cáo cuối task

Trả lời người dùng bằng tiếng Việt.

Không kể lại từng thao tác.

Chỉ cần báo ngắn:

### Đã làm

Những functionality chính đã hoàn thành.

### File chính thay đổi

Các file quan trọng đã tạo/sửa.

### Validation

Build/test/lint/browser test đã chạy và kết quả.

### Lưu ý

Chỉ ghi nếu còn limitation hoặc việc người dùng thực sự cần biết.

### Git

Đề xuất commit message nếu phù hợp.

Nguyên tắc cuối cùng:

> Code tốt không phải code trông phức tạp nhất.
> Hãy tạo giải pháp nhỏ nhất nhưng vẫn đúng, nhanh, dễ hiểu, dễ test và dễ bảo trì.

## 21. Theo dõi phase và tiến trình Lingoplay

Theo yêu cầu của người dùng, sau mỗi task cần cập nhật `doc/PROGRESS.md` theo phần việc thực sự đã làm: ngày, trạng thái phase, kết quả, validation và phần còn lại hoặc blocker nếu có.

- Đọc `doc/PHASES.md` và `doc/PROGRESS.md` trước khi triển khai task để nắm scope và tiến trình.
- Chỉ cập nhật `doc/PHASES.md` khi phạm vi hoặc tiêu chí phase thay đổi.
- Không ghi test/build/push đã thành công nếu chưa xác nhận; không đánh dấu phase hoàn thành khi còn việc bắt buộc.
- Phase tương lai là hướng dự kiến, không tự triển khai nếu chưa có yêu cầu.
- Giữ README cho overview/cách chạy/kiến trúc; không tạo thêm tài liệu trùng nội dung.

## 22. Autonomous MVP workflow

Đọc `docs/PRODUCT_DECISIONS.md`, `ROADMAP.md`, `PLANS.md`, `docs/PROJECT_STATE.md` và plan liên quan trước task. Quyết định đã được user xác nhận ưu tiên hơn ví dụ typing cũ trong tài liệu.

Giữ Astro static/SEO/Collections, React islands, pure engine và repository/data boundary. Không SPA rewrite, không import nguồn mock trực tiếp từ React. Không cài dependency nếu native/existing package đủ.

User đã cho phép tự implement/validation/review/commit từng feature và push từng milestone trên dev branch `codex/oxford-learning-mvp`. Không push main (auto-deploy), force push, rewrite history hay commit secrets. Không hỏi lại permission cho scope này. Tiếp tục feature tiếp theo trong roadmap MVP; future BACKLOG không tự triển khai.

Definition of Done: code hoạt động, tests quan trọng pass, Astro/TypeScript/build và HTML checks pass, flow thực tế keyboard/touch/right/wrong/reload/restart/result/media/responsive và console đã kiểm tra, diff review, progress/plan/state/roadmap cập nhật đúng bằng chứng, feature commit và milestone dev push. Không ghi DONE cho phần chưa kiểm tra.
