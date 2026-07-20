export async function sendTelegramNotification(message: string, customerPhone?: string) {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // 1. Base payload with the message text
    const payload: any = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
    };

    // 2. If a phone number is provided, format it for WhatsApp and add the button
    if (customerPhone) {
        // Strip out any spaces, dashes, or plus signs
        let cleanPhone = customerPhone.replace(/\D/g, '');

        // Handle Sri Lankan local numbers (e.g., converting 077... to 9477...)
        if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
            cleanPhone = '94' + cleanPhone.substring(1);
        }

        // Attach the Inline Keyboard button to the payload
        payload.reply_markup = {
            inline_keyboard: [
                [
                    {
                        text: "💬 Chat on WhatsApp",
                        url: `https://wa.me/${cleanPhone}`
                    }
                ]
            ]
        };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error("Failed to send Telegram message");
        }
    } catch (error) {
        console.error("Telegram API Error:", error);
    }
}