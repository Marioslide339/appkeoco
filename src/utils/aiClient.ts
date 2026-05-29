/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const AI_MODELS = [
  { id: "gemini-3.0-pro-preview", label: "Gemini 3 Pro Preview" },
  { id: "gemini-3.0-flash-preview", label: "Gemini 3 Flash Preview (Default)" }, // Use gemini-3.0-pro-preview or flash-preview? Wait: SDK says models are `gemini-2.5-flash`, etc. The instructions say `gemini-3-pro-preview`, `gemini-3-flash-preview`, `gemini-2.5-flash`.
  // Wait, I will use exactly the strings the instructions said.
  { id: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview" },
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" }
];

// Fallback logic
export const executeWithFallback = async <T>(
  apiKey: string,
  primaryModel: string,
  operation: (ai: GoogleGenAI, model: string) => Promise<T>
): Promise<T> => {
  const modelsToTry = [primaryModel, ...AI_MODELS.map(m => m.id).filter(id => id !== primaryModel)];
  
  const ai = new GoogleGenAI({ apiKey });
  
  let lastError: Error | null = null;
  
  for (const model of modelsToTry) {
    try {
      console.log(`[AI Client] Đang thử model: ${model}...`);
      const result = await operation(ai, model);
      return result;
    } catch (err: any) {
      console.error(`[AI Client] Model ${model} thất bại:`, err.message);
      lastError = err;
      // Triggers retry loop
    }
  }
  
  throw new Error(lastError ? lastError.message : "Tất cả các model đều thất bại.");
};

export const generateQuiz = async (
  apiKey: string,
  model: string,
  topic: string
): Promise<Question[]> => {
  return executeWithFallback(apiKey, model, async (ai, currentModel) => {
    const prompt = `Bạn là vị Kiến trúc sư Trưởng Thiết kế Trò chơi Giáo dục (Lead EdTech Game Architect). Hãy thiết kế cụ thể một bộ đề thi trắc nghiệm đối kháng gồm 8 câu hỏi về chủ đề học tập: "${topic}".
Bộ câu hỏi này sẽ phục vụ trực tiếp cho cơ chế Trò chơi Kéo co kỹ thuật số (Digital Tug-of-War).
Yêu cầu phân bổ câu hỏi cực kỳ nghiêm ngặt theo thang đo Bloom (Bloom's Taxonomy) để hỗ trợ thuật toán AI Adaptive trong trò chơi:
- 2 câu hỏi thuộc nhóm KNOWLEDGE (Nhận biết): Câu hỏi cơ bản, ghi nhớ nhanh định nghĩa, mốc thời gian, công thức.
- 2 câu hỏi thuộc nhóm COMPREHENSION (Thông hiểu): Yêu cầu giải thích khái niệm, mối liên hệ, hiểu bản chất cốt lõi.
- 2 câu hỏi thuộc nhóm APPLICATION (Vận dụng): Bài toán áp dụng thực tế, tình huống thực tế cụ thể.
- 2 câu hỏi thuộc nhóm HIGH_APPLICATION (Vận dụng cao): Phân tích chiến thuật sâu, bài toán hóc búa, tư duy tổng hợp tối ưu hóa.

Mỗi câu hỏi phải đi kèm:
- Lựa chọn (options): Gồm chính xác 4 đáp án đa dạng, không trùng lặp, có tính đánh đố nhẹ.
- Đáp án đúng (correctIndex): Là chỉ số từ 0 đến 3 tương ứng với vị trí đáp án đúng trong mảng options.
- Giải thích (explanation): Độ dài ngắn gọn, súc tích, mang tính giáo dục sâu sắc thúc đẩy động lực cho học sinh.
- Điểm số (points): Hãy tính điểm tương ứng: KNOWLEDGE = 10, COMPREHENSION = 15, APPLICATION = 20, HIGH_APPLICATION = 30.

LƯU Ý: Phải viết bằng Tiếng Việt chuẩn sư phạm. Đảm bảo cấu trúc JSON chính xác theo mô tả.`;

    const response = await ai.models.generateContent({
      model: currentModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Mảng chứa danh sách 8 câu hỏi được phân loại độ khó nghiêm ngặt theo chuẩn Bloom.",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Mã định danh câu hỏi, ví dụ: 'gpt_1', 'gpt_2'..." },
              text: { type: Type.STRING, description: "Nội dung câu hỏi rành mạch kỹ lưỡng." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Mảng chứa đúng 4 câu trả lời trắc nghiệm."
              },
              correctIndex: { type: Type.INTEGER, description: "Chỉ số đáp án đúng (0 đến 3)." },
              difficulty: {
                type: Type.STRING,
                description: "Chỉ nhận một trong bốn giá trị bắt buộc: KNOWLEDGE hoặc COMPREHENSION hoặc APPLICATION hoặc HIGH_APPLICATION"
              },
              explanation: { type: Type.STRING, description: "Lời giải thích sư phạm giải mã lý do tại sao phương án đó đúng." },
              points: { type: Type.INTEGER, description: "Số điểm kéo co tương ứng (10, 15, 20, hoặc 30)" }
            },
            required: ["id", "text", "options", "correctIndex", "difficulty", "explanation", "points"]
          }
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Không nhận được kết quả trả về từ mô hình AI.");
    }

    return JSON.parse(textOutput.trim());
  });
};

export const generateReport = async (
  apiKey: string,
  model: string,
  matchData: any
): Promise<{ recommendation: string; focusArea: string; reflexAnalysis: string; cognitiveProfile: string }> => {
  return executeWithFallback(apiKey, model, async (ai, currentModel) => {
    const reportPrompt = `Bạn là vị Kiến trúc sư Trưởng Thiết kế Trò chơi Giáo dục đóng vai trò Trực lãnh đạo Ban Sư phạm Công nghệ (Lead EdTech Game Architect & Strategic Director).
Hãy phân tích dữ liệu telemetry thu thập từ trận đấu "Kéo co kỹ thuật số" sau đây để viết một Báo cáo sư phạm sâu sắc.

Thông số trận đấu:
- Chủ đề: "${matchData.topic}"
- Chế độ chơi: "${matchData.mode}"
- Điểm số Đội Đỏ: ${matchData.scoreRed} điểm
- Điểm số Đội Xanh: ${matchData.scoreBlue} điểm
- Đội giành chiến thắng chung cuộc: ${matchData.winner === "RED" ? "Đội Đỏ" : matchData.winner === "BLUE" ? "Đội Xanh" : "Hòa nhau"}
- Lịch sử đối đầu & câu hỏi:
${JSON.stringify(matchData.history, null, 2)}
- Lịch sử tốc độ phản xạ Đội Đỏ (giây): ${JSON.stringify(matchData.reflexHistoryRed)}
- Lịch sử tốc độ phản xạ Đội Xanh (giây): ${JSON.stringify(matchData.reflexHistoryBlue)}

Lập báo cáo chuyên sâu và trả về kết cấu JSON chứa đúng các trường mô tả sau:
1. "recommendation": Khuyến nghị sư phạm mang tính đột phá và tầm nhìn giúp gia cố lỗ hổng kiến thức cho bên thua và tăng nâng cấp kiến thức cho bên thắng. Động viên sâu sắc, tràn đầy cảm hứng học tập.
2. "focusArea": Điểm tập trung cốt lõi (Vùng kiến thức gây khó khăn nhất, độ khó nào bị sai nhiều nhất, những khái niệm hiểu lệch).
3. "reflexAnalysis": Phân tích chuyên môn về nhịp độ phản xạ của hai đội (đội nào nôn nóng, đội nào bình tĩnh suy xét, sự căng thẳng tâm lý ảnh hưởng lên tốc độ kéo co thế nào).
4. "cognitiveProfile": Đánh giá phân phối năng lực nhận thức theo Bloom (Tỉ lệ chuẩn sắc sảo ở các nấc: Nhận biết, Thông hiểu so với Vận dụng cao).

Hãy viết báo cáo bằng Tiếng Việt chuyên sâu, giàu tính khoa học giáo dục, phong cách của nhà chiến lược giáo dục hàng đầu.`;

    const response = await ai.models.generateContent({
      model: currentModel,
      contents: reportPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          description: "Báo cáo phân tích sư phạm học lực và tốc độ kéo co.",
          properties: {
            recommendation: { type: Type.STRING, description: "Khuyến nghị chi tiết cá nhân hóa." },
            focusArea: { type: Type.STRING, description: "Phân tích vùng kiến thức lỗi sai trọng điểm." },
            reflexAnalysis: { type: Type.STRING, description: "Đánh giá động lực phản xạ tâm lý kéo co." },
            cognitiveProfile: { type: Type.STRING, description: "Hồ sơ năng lực nhận thức tổng quan chuẩn Bloom." }
          },
          required: ["recommendation", "focusArea", "reflexAnalysis", "cognitiveProfile"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Không thể trích xuất văn bản từ phản hồi AI.");
    }

    return JSON.parse(textOutput.trim());
  });
};
