import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  getResponse(message: string): string {
    // Hier würden Sie die Logik für die Chatbot-Antwort implementieren
    return `Echo: ${message}`;
  }
}
