// Extract phone/WhatsApp from text
export function extractContact(text: string): { phone?: string; whatsapp?: string } | null {
    if (!text) return null

    const contact: { phone?: string; whatsapp?: string } = {}

    // Brazilian phone patterns
    const phonePatterns = [
        /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g, // (11) 99999-9999 or 11 99999-9999
        /\d{2}\s\d{4,5}\s\d{4}/g, // 11 99999 9999
        /55\s?\d{2}\s?\d{4,5}-?\d{4}/g // 55 11 99999-9999
    ]

    for (const pattern of phonePatterns) {
        const matches = text.match(pattern)
        if (matches && matches[0]) {
            const cleaned = matches[0].replace(/\D/g, '')
            if (cleaned.length >= 10) {
                contact.phone = matches[0]
                // If text mentions WhatsApp near this number, mark as WhatsApp too
                const index = text.indexOf(matches[0])
                const surrounding = text.substring(Math.max(0, index - 30), index + 30).toLowerCase()
                if (surrounding.includes('whats') || surrounding.includes('zap')) {
                    contact.whatsapp = matches[0]
                }
                break
            }
        }
    }

    return Object.keys(contact).length > 0 ? contact : null
}
