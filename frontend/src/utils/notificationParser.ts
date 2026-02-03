
import { TFunction } from 'i18next';

/**
 * Universal Notification Parser ("Antigravity")
 * Safely handles hybrid notification data (JSON strings or raw text).
 * 
 * @param rawMessage - The raw message string from the backend (JSON or plain text)
 * @param t - The i18next translation function
 * @returns Localized string or original raw message
 */
export const parseNotificationMessage = (rawMessage: string | null | undefined, t: TFunction): string => {
    if (!rawMessage) return "";

    try {
        // 1. Try to parse JSON
        // Check start character to avoid unnecessary parsing of obviously non-JSON strings
        const trimmed = rawMessage.trim();
        if (!trimmed.startsWith('{')) {
            return rawMessage;
        }

        const parsed = JSON.parse(trimmed);

        if (parsed && parsed.key) {
            // 2. If valid JSON with key, translate using i18next
            // Using t function with params spread
            return t(`notification.${parsed.key}`, { ...parsed.params });
        }
    } catch (e) {
        // 3. Fallback: If parsing fails (Legislated/Legacy Data), return original string
        return rawMessage;
    }

    return rawMessage;
};
