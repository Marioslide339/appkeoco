/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, Difficulty } from "./types.ts";

export interface QuizPackage {
  id: string;
  name: string;
  topic: string;
  description: string;
  questions: Question[];
}

export const PRELOADED_QUIZZES: QuizPackage[] = [
  {
    id: "vietnam_history",
    name: "Hùng Ca Lịch Sử Việt Nam",
    topic: "Lịch sử Việt Nam Quốc phòng & Khởi nghĩa hào hùng",
    description: "Bộ câu hỏi đa dạng kiến thức lịch sử, tư duy quân sự thời kỳ Ngô Quyền cứu nước, Điện Biên Phủ, và các cuộc khởi nghĩa huyền thoại.",
    questions: [
      {
        id: "vn_h_1",
        text: "Trận chiến lừng lẫy trên sông Bạch Đằng đánh tan quân Nam Hán năm 938 gắn liền với vị anh hùng nào?",
        options: ["Đinh Bộ Lĩnh", "Lý Thường Kiệt", "Ngô Quyền", "Lê Lợi"],
        correctIndex: 2,
        difficulty: Difficulty.KNOWLEDGE,
        explanation: "Năm 938, Ngô Quyền đã dùng mưu đóng cọc gỗ đầu nhọn bọc sắt xuống lòng sông Bạch Đằng để đè bẹp chiến thuyền quân Nam Hán.",
        points: 10
      },
      {
        id: "vn_h_2",
        text: "Vì sao Đinh Bộ Lĩnh chọn giải pháp dẹp loạn 12 sứ quân bằng con đường vừa dùng binh lực đánh dẹp, vừa thu phục khôn khéo?",
        options: [
          "Vì ông không đủ binh lực để tấn công trực diện",
          "Để tránh tổn thất xương máu nhân dân, quy tụ sức mạnh đoàn kết dân tộc",
          "Do các sứ quân tự nguyện xin đầu hàng từ trước",
          "Do có sự viện trợ vũ khí từ triều đình phương Bắc"
        ],
        correctIndex: 1,
        difficulty: Difficulty.COMPREHENSION,
        explanation: "Sự thấu hiểu chiến lược của Đinh Bộ Lĩnh nằm ở chỗ ông muốn quy tụ lòng dân, thống nhất đất nước nhanh chóng và vững bền thay vì chỉ tàn sát bạo lực.",
        points: 15
      },
      {
        id: "vn_h_3",
        text: "Trong chiến dịch Điện Biên Phủ (1954), Đại tướng Võ Nguyên Giáp đã có một quyết định thay đổi lịch sử từ phương châm 'Đánh nhanh giải quyết nhanh' sang phương châm nào?",
        options: [
          "Đánh chậm tiến chậm",
          "Đánh chắc tiến chắc",
          "Vừa đánh vừa đàm phán",
          "Tổng tiến công toàn lực"
        ],
        correctIndex: 1,
        difficulty: Difficulty.APPLICATION,
        explanation: "Quyết định chuyển sang 'Đánh chắc tiến chắc' của Đại tướng Võ Nguyên Giáp bảo đảm tính an toàn cao nhất cho lực lượng ta trước hệ thống công sự kiên cố của Pháp.",
        points: 20
      },
      {
        id: "vn_h_4",
        text: "Nếu phân tích chiến thuật ngoại giao 'Vừa đánh vừa đàm' của Nhà Trần trong 3 lần kháng chiến chống Nguyên Mông, yếu tố quyết định tạo nên thắng lợi ở giai đoạn cuối là gì?",
        options: [
          "Yếu tố bất ngờ của súng hỏa mai thần công",
          "Sự suy kiệt kỵ binh địch khi sa vào địa hình bùn lầy kết hợp kế sách cô lập lương thực triệt để",
          "Nhờ nội bộ quân Nguyên Mông tự mâu thuẫn tranh đoạt ngôi vua",
          "Sự viện trợ kinh tế dồi dào từ các vương quốc lân bang thời đó"
        ],
        correctIndex: 1,
        difficulty: Difficulty.HIGH_APPLICATION,
        explanation: "Vận dụng tối đa địa hình nước sông rạch bùn lầy của Đại Việt phá hủy thế mạnh kỵ binh thiện chiến phương Bắc, kết hợp 'Vườn không nhà trống' cô lập lương thực chính là đỉnh cao quân sự.",
        points: 30
      },
      {
        id: "vn_h_5",
        text: "Ai là tác giả của bản 'Hịch Tướng Sĩ' nhằm khích lệ tinh thần binh sĩ kháng chiến chống quân xâm lược Nguyên Mông?",
        options: ["Trần Nguyên Hãn", "Trần Hưng Đạo", "Trần Quốc Toản", "Trần Thủ Độ"],
        correctIndex: 1,
        difficulty: Difficulty.KNOWLEDGE,
        explanation: "Trần Hưng Đạo (Hưng Đạo Đại Vương) viết Hịch Tướng Sĩ để hiệu triệu quân lính rèn luyện binh thư, sẵn sàng chiến đấu.",
        points: 10
      },
      {
        id: "vn_h_6",
        text: "Hội nghị Diên Hồng thể hiện tư tưởng chiến lược dân chủ quân sự sâu sắc nào của nhà Trần?",
        options: [
          "Tập trung quyền lực tối cao vào tay nhà vua",
          "Trưng cầu ý kiến của toàn thể bô lão đại diện cho nhân dân cả nước để đồng lòng kháng chiến",
          "Chia đất nước làm 12 đơn vị tự trị",
          "Tuyển chọn binh lính từ các gia tộc quý tộc"
        ],
        correctIndex: 1,
        difficulty: Difficulty.COMPREHENSION,
        explanation: "Hội nghị Diên Hồng là biểu tượng của tinh thần dân tộc đoàn kết một lòng, coi trọng sức dân như nước.",
        points: 15
      },
      {
        id: "vn_h_7",
        text: "Ứng dụng nghệ thuật quân sự chiêu dụ quân địch của Nguyễn Trãi 'Mưu phạt công tâm' (đánh vào lòng người) được áp dụng hiệu quả cao trong cuộc khởi nghĩa nào?",
        options: ["Khởi nghĩa Lam Sơn", "Khởi nghĩa Tây Sơn", "Khởi nghĩa Hương Khê", "Khởi nghĩa Bãi Sậy"],
        correctIndex: 0,
        difficulty: Difficulty.APPLICATION,
        explanation: "'Mưu phạt công tâm' giúp Vương thông và các tướng nhà Minh buộc phải ký hội thề Đông Quan rút quân về nước an toàn mà không cần tàn sát máu chảy thành sông.",
        points: 20
      },
      {
        id: "vn_h_8",
        text: "Phân tích trận chiến thần tốc Ngọc Hồi - Đống Đa xuân Kỷ Dậu (1789) của vua Quang Trung, nhân tố địa lý và khí hậu thời gian nào được phối hợp khôn ngoan nhất?",
        options: [
          "Tấn công lúc lũ lụt miền Bắc dâng cao",
          "Hành quân thần tốc ngày đêm xuyên tết, tấn công bất ngờ vào lúc tết cổ truyền khiến quân Thanh chủ quan hoảng loạn",
          "Chờ đợi gió mùa mùa hạ đốt cháy công sự đối thủ",
          "Lợi dụng địa hình rừng rậm núi đá vôi chặn nguồn tiếp viện"
        ],
        correctIndex: 1,
        difficulty: Difficulty.HIGH_APPLICATION,
        explanation: "Quang Trung đã chớp thời cơ quân Thanh bận đón Tết lơi lỏng cảnh giác, hành quân đi bộ ngày đêm liên tục giải phóng hoàn toàn Thăng Long chỉ trong 5 ngày.",
        points: 30
      }
    ]
  },
  {
    id: "space_physics",
    name: "Sứ Mệnh Không Gian & Vật Lý",
    topic: "Vật lý Thiên thể, Cơ học vũ trụ và Công nghệ Cyber tương lai",
    description: "Thách thức tư duy về trọng lực thế giới, các định luật Kepler, lực đẩy phản lực và lý thuyết tương đối đầy mê hoặc.",
    questions: [
      {
        id: "sp_p_1",
        text: "Lực nào giữ cho các hành tinh quay xung quanh Mặt Trời trên quỹ đạo ổn định liên tục?",
        options: ["Lực từ trường", "Lực vạn vật hấp dẫn", "Lực điện từ", "Lực hạt nhân mạnh"],
        correctIndex: 1,
        difficulty: Difficulty.KNOWLEDGE,
        explanation: "Lực vạn vật hấp dẫn do Isaac Newton phát hiện giữ vai trò trung tâm liên kết quỹ đạo vũ trụ.",
        points: 10
      },
      {
        id: "sp_p_2",
        text: "Hiện tượng phản lực (Jet Propulsion) – cơ sở hoạt động của tên lửa vũ trụ – được giải thích dựa trên định luật vật lý nào của Newton?",
        options: [
          "Định luật I (Quán tính)",
          "Định luật II (Gia tốc)",
          "Định luật III (Hành động và Phản hành động)",
          "Định luật bảo toàn khối lượng"
        ],
        correctIndex: 2,
        difficulty: Difficulty.COMPREHENSION,
        explanation: "Định luật III Newton: Khi tên lửa phun khí nóng mạnh về phía sau (lực tác dụng), luồng khí sẽ đẩy tên lửa tiến thẳng về phía trước (phản lực tương đương).",
        points: 15
      },
      {
        id: "sp_p_3",
        text: "Một phi hành gia nặng 60kg trên Trái Đất đi đến Mặt Trăng, nơi có gia tốc trọng trường chỉ bằng 1/6 Trái Đất. Tại Mặt Trăng, khối lượng của phi hành gia đó là bao nhiêu?",
        options: ["10 kg", "60 kg", "360 kg", "0 kg"],
        correctIndex: 1,
        difficulty: Difficulty.APPLICATION,
        explanation: "Khối lượng (mass) là lượng chất cấu thành vật thể và không đổi bất chấp tọa độ vũ trụ. Thực chất chỉ có Trọng lượng (weight) giảm 6 lần xuống còn khoảng 100 Newton.",
        points: 20
      },
      {
        id: "sp_p_4",
        text: "Vì sao các vệ tinh viễn thông nhân tạo quỹ đạo địa tĩnh luôn luôn trông thấy đứng yên ở một điểm cố định phía trên xích đạo của Trái Đất?",
        options: [
          "Do vệ tinh tắt động cơ đứng im tuyệt đối ngoài khoảng không",
          "Do vệ tinh có chu kỳ tự quay riêng bằng đúng tốc độ ánh sáng",
          "Do chu kỳ quỹ đạo quay quanh Trái Đất của vệ tinh chính xác bằng chu kỳ tự quay quanh trục của Trái Đất (24 giờ)",
          "Do bị khóa hấp dẫn cực đại bởi mặt trăng đẩy ngược"
        ],
        correctIndex: 2,
        difficulty: Difficulty.HIGH_APPLICATION,
        explanation: "Để luôn đứng yên so với một điểm dưới đất, vệ tinh địa tĩnh được lắp đặt ở khoảng cách ~35,786 km, có thời gian quay đúng bằng 23h 56m 4s giúp đồng bộ hoàn hảo với Trái Đất.",
        points: 30
      },
      {
        id: "sp_p_5",
        text: "Hiện tượng 'Giãn nở thời gian' nổi tiếng được mô tả trong Thuyết tương đối rộng của ai?",
        options: ["Albert Einstein", "Stephen Hawking", "Niels Bohr", "Galileo Galilei"],
        correctIndex: 0,
        difficulty: Difficulty.KNOWLEDGE,
        explanation: "Albert Einstein chứng minh không gian và thời gian là tương đối, thời gian trôi chậm hơn ở gần các vật thể có trọng lực cực lớn như hố đen.",
        points: 10
      },
      {
        id: "sp_p_6",
        text: "Tại sao ánh sáng không thể thoát khỏi 'Chân trời sự kiện' của một hố đen vũ trụ?",
        options: [
          "Vì hố đen hấp thụ nhiệt độ quá lạnh dập tắt ánh sáng",
          "Vì vận tốc vũ trụ cấp hai tại vùng đó vượt quá cả vận tốc ánh sáng do mật độ vật chất nén quá đặc",
          "Do phản ứng hóa học tiêu diệt photon hạt ánh sáng",
          "Vì ánh sáng bị khúc xạ lệch hướng phản xạ liên tục ra ngoài"
        ],
        correctIndex: 1,
        difficulty: Difficulty.COMPREHENSION,
        explanation: "Trọng lực khủng khiếp bẻ cong không gian đến mức vận tốc giải thoát lớn hơn vận tốc ánh sáng (300.000 km/s). Do vậy không gì thoát nổi hố đen khi đã đi quá Chân trời sự kiện.",
        points: 15
      },
      {
        id: "sp_p_7",
        text: "Áp dụng định luật cơ học: Nếu thu nhỏ bán kính quay của một ngôi sao sụp đổ (sao neutron) mà khối lượng giữ vững, tốc độ quay quanh trục của nó sẽ thay đổi thế nào?",
        options: ["Quay chậm đi nhiều lần", "Sẽ dừng quay hẳn", "Tăng vọt cực nhanh vì định luật bảo toàn momen động lượng", "Quay đảo chiều liên tục"],
        correctIndex: 2,
        difficulty: Difficulty.APPLICATION,
        explanation: "Giống như vận động viên trượt băng thu hồi tay vào sát người để quay nhanh hơn, bảo toàn momen động lượng làm sao neutron quay hàng trăm vòng mỗi giây khi co nhỏ thể tích.",
        points: 20
      },
      {
        id: "sp_p_8",
        text: "Tại một trạm vũ trụ không trọng lực, một phi hành gia muốn đo khối lượng của bản thân bằng cân lò xo thông thường thì phải làm thế nào, dựa trên tính chất vật lý của gia tốc?",
        options: [
          "Cân lò xo không bao giờ hoạt động ngoài vũ trụ",
          "Sử dụng dao động điều hòa của ghế lò xo (đo chu kỳ dao động phụ thuộc khối lượng m) hoặc đẩy một lực lò xo biết trước rồi đo gia tốc thu được (F=ma)",
          "Chỉ cần đứng thẳng bám chắc lên cân lò xo rồi bật máy hút chân không",
          "Uống thật nhiều nước để tạo áp suất ép lò xo lún xuống"
        ],
        correctIndex: 1,
        difficulty: Difficulty.HIGH_APPLICATION,
        explanation: "Trong môi trường không trọng lực, lực nén cơ học gây ra bởi trọng trường bằng 0. Ta buộc phải dùng quán tính vật lý (F=ma) thông qua hệ đập rung chu kỳ lò xo đo khối lượng vô cùng khoa học.",
        points: 30
      }
    ]
  },
  {
    id: "mythology_east_west",
    name: "Thần Thoại & Truyền Thuyết",
    topic: "Thần thoại Hy Lạp Bắc Âu kết hợp Vũ trụ thần tích Lạc Long Quân",
    description: "Khám phá chiều sâu văn hóa tâm linh nhân loại qua các triết lý sáng thế, sự trừng phạt của thần linh và nguồn gốc vũ trụ rừng vàng biển bạc.",
    questions: [
      {
        id: "my_1",
        text: "Trong thần thoại Hy Lạp, vị thần tối cao nắm giữ quyền lực sấm sét ngự trị trên đỉnh núi Olympus là ai?",
        options: ["Poseidon", "Zeus", "Hades", "Ares"],
        correctIndex: 1,
        difficulty: Difficulty.KNOWLEDGE,
        explanation: "Thần Zeus là vua của các vị thần trên đỉnh Olympus, cầm vũ khí là lưỡi thiên lôi cực mạnh.",
        points: 10
      },
      {
        id: "my_2",
        text: "Ý nghĩa ẩn dụ đằng sau chiếc hộp của nàng Pandora trong triết lý thần thoại Hy Lạp là gì?",
        options: [
          "Chứa đựng sự trừng trị tham vọng giàu sang phú quý của loài người",
          "Mở ra mang lại mọi tai ác, dịch bệnh cho con người, nhưng dưới đáy vẫn còn lại 'Hy vọng' nâng đỡ nhân loại",
          "Là kho vũ khí tối tân diệt vong thế giới khổng lồ Titan",
          "Món quà cưới cứu rỗi vĩnh hằng người anh hùng Prometheus"
        ],
        correctIndex: 1,
        difficulty: Difficulty.COMPREHENSION,
        explanation: "Hộp Pandora là lời nhắc nhở dù nhân loại phải đối diện khổ đau điêu tàn, dòng chảy hy vọng sống tốt đẹp luôn bảo tồn mãnh liệt dưới sâu tinh thần.",
        points: 15
      },
      {
        id: "my_3",
        text: "Sự phân chia 50 con theo Lạc Long Quân xuống biển, 50 con theo Âu Cơ lên non phản ánh triết lý định cư kinh tế xã hội cốt lõi nào của người Việt cổ?",
        options: [
          "Mâu thuẫn phân rã bộ tộc gia đình gia trưởng cổ",
          "Giải pháp tối ưu hóa sinh kế khai phá đa dạng sinh thái nông lâm nghiệp (vùng cao) nông nghiệp lúa nước thủy sản (vùng trũng duyên hải Đông Sơn)",
          "Thủ đoạn phân chia lãnh thổ để tránh nội chiến bộ lạc",
          "Thờ cúng vật tổ thiêng liêng rồng và phượng hoàng bắt buộc"
        ],
        correctIndex: 1,
        difficulty: Difficulty.APPLICATION,
        explanation: "Truyền thuyết phản ánh chân thực cuộc bành trướng dân cư thông minh để khai khẩn hai miền rừng và biển tạo ra nền kinh tế toàn diện của Đại Việt sơ khởi.",
        points: 20
      },
      {
        id: "my_4",
        text: "Điểm tương đồng triết lý sâu sắc nhất giữa sự kiện Ragnarok trong thần thoại Bắc Âu và trận hồng thủy Đại hồng thủy Trung Hoa là gì?",
        options: [
          "Các vị thần đều muốn tuyệt chủng tuyệt đối sinh vật sống",
          "Quan niệm về vòng tuần hoàn hoại diệt vũ trụ: cái cũ buộc phải sụp đổ, hủy diệt đau thương trước khi gieo mầm một chu kỳ thế giới mới tinh sạch, hồi sinh lý tưởng",
          "Bản án trừng phạt loài người vì việc rèn đúc sắt thép nông cụ",
          "Tranh đoạt các cây thần chứa quả táo vàng hồi xuân bất tử"
        ],
        correctIndex: 1,
        difficulty: Difficulty.HIGH_APPLICATION,
        explanation: "Các nền văn hóa lớn đều hướng thế giới nhân văn thông qua cái chết tái sinh. Ragnarok hủy diệt các vị thần cũ nhưng thắp sáng lại kỷ nguyên của thế hệ thần linh hiền hòa tiếp theo.",
        points: 30
      }
    ]
  }
];
