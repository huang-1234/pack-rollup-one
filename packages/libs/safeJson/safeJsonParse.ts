
export type TReviver = (this: any, key: string, value: any) => any
export function safeJsonParse(text: string, reviver?: TReviver, defaultValue?: any): any {
  if (typeof text === 'string') {
    try {
      return JSON.parse(text, reviver) || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  } else if (text != null) {
    return text;
  }
  return defaultValue;
}