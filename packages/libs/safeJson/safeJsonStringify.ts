// @ts-nocheck
// /* eslint-disable @es/code-spec-unid/no-json-parse-or-json-stringify */

const hasProp = Object.prototype.hasOwnProperty;

export function throwsMessage(err) {
  return '[Throws: ' + (err ? err.message : '?') + ']';
}

export function safeGetValueFromPropertyOnObject(obj: Record<string, any>, property: string) {
  if (hasProp.call(obj, property)) {
    try {
      return obj[property];
    } catch (err) {
      return throwsMessage(err);
    }
  }

  return obj[property];
}

export function ensureProperties(obj: any) {
  const seen: any[] = []; // store references to objects we have seen before

  function visit(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (seen.indexOf(obj) !== -1) {
      return '[Circular]';
    }
    seen.push(obj);

    if (typeof obj.toJSON === 'function') {
      try {
        const fResult = visit(obj.toJSON());
        seen.pop();
        return fResult;
      } catch (err) {
        return throwsMessage(err);
      }
    }

    if (Array.isArray(obj)) {
      const aResult = obj.map(visit);
      seen.pop();
      return aResult;
    }

    const result = Object.keys(obj).reduce(function (result, prop) {
      // prevent faulty defined getter properties
      result[prop] = visit(safeGetValueFromPropertyOnObject(obj, prop));
      return result;
    }, {});
    seen.pop();
    return result;
  }

  return visit(obj);
}

// type TReplacer = (number | string)[]
export type TReplacer = (this: any, key: string, value: any) => any | (number | string)[];

export type TSpace = string | number | undefined;

export function safeJsonStringify(value: any, replacer?: TReplacer, space?: TSpace) {
  return JSON.stringify(ensureProperties(value), replacer, space);
}
