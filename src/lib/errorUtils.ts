export const isAbortError = (error: any): boolean => {
    if (!error) return false;

    // Check standard Error name
    if (error.name === 'AbortError') return true;

    // Check message (common in fetch/supabase-js)
    const message = error.message?.toLowerCase() || '';
    if (message.includes('abort') || message.includes('signal is aborted')) return true;

    // Check code if available
    if (error.code === '20' || error.code === 'AbortError') return true;

    return false;
};
