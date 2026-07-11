export const formatMarketCap = (value: number) => `$${value.toFixed(1)}B`;
export const formatChange = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
export const formatTime = (iso: string) => new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Shanghai' }).format(new Date(iso));
