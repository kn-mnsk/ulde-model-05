// src/app/global.utils.ts
import { Router } from "@angular/router";


/**
 * The isBrowser() guard is about execution environment, while signals are about reactivity
 * @returns
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Slugify text to generate URLs dynamically, from titles or metadata
 * @param text
 * @returns
 */
export function slugify(text: string | null): string | null {
  if (text == null) return null;
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')         // Remove special characters
    .replace(/\-\-+/g, '-');          // Collapse multiple hyphens
}

/**
 * assuming text format /string/string/string
 * @param text
 * @returns
 */
export function unslugifyA(text: string | null): string | null {

  if (text == null) return null;

  const results = text.replace(/\/(\w+)\/(\w+)\/(\w+)/, (_, p1, p2, p3) => {
    const hiphenToSpace = (s: string) => s.replace(/-/g, ' '); // replace - with space

    const cap = (s: string) => {
      const spaced = hiphenToSpace(s);
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    };
    return `/${cap(p1)}/${cap(p2)}/${cap(p3)}`;

  });

  return results;
}

/**
 * make the first character uppre case and the hyphen space for each path slug
 * @param text
 * @returns
 */
export function unslugify(text: string): string {

  return (text.charAt(0).toUpperCase() + text.slice(1)).replace(/-/g, ' ');
}


//-----------------------------------------------------------------
// Sanitization
//------------------------------------------------------------------
/**
 * Recursively replace non-breaking spaces in text nodes.
 */
export function sanitizeNodeText(node: Node): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const textNode = node as Text;
    textNode.textContent = textNode.textContent?.replace(/\u00A0/g, ' ') ?? '';
    return;
  }

  if (node instanceof HTMLElement || node instanceof DocumentFragment) {
    node.childNodes.forEach(child => sanitizeNodeText(child));
  }
}


// navigate to a specific route
export async function navigate(router: Router, route: any[]): Promise<boolean | undefined> {

  // const url = route.join('/');
  // let results: boolean | undefined;

  const result = await router.navigate(route);
  return result;
  // this.router.navigate(route).then(
  //   (resolve) => {
  //     // console.log(`Debug SceneLoaderComponent: Succeeded in Navigating To`, url);
  //     results = resolve;
  //   },
  //   (reject) => {
  //     // console.warn(`Warning SceneLoaderComponent: Failed in navigating to`, url);
  //     results = reject;
  //   });

  // return results;
}

export function setDecimalPlaces(value: number, places: number) : number{
  // Validate input
  // if (typeof value !== "number" || typeof places !== "number" || places < 0) {
  //   throw new Error("Invalid input: value must be a number and places must be a non‑negative number.");
  // }

  // toFixed returns a string, so convert back to number if needed
  return Number(value.toFixed(places));
}

/**
 * Advanced Fetch Helper with retries, timeout, and JSON parsing.
 * @param url - The endpoint URL
 * @param options - Fetch configuration (RequestInit)
 * @param retries - Number of retry attempts (default: 3)
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Promise<T> - Typed response data
 */
export async function fetchWithRetry<T>(
  url: string,
  router: Router,
  options: RequestInit = {},
  retries: number = 3,
  timeoutMs: number = 5000
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // return (await response.json()) as T;
      return (await response.text()) as T;
    } catch (error) {
      clearTimeout(timeout);

      // AbortError or network error handling
      if (attempt < retries) {
        console.warn(`Attempt ${attempt} failed. Retrying...`);
      } else {
        console.error(`All ${retries} attempts failed.`);
        await router.navigate(['/PageNotFound']);
        throw error;
      }
    }
  }

  // This should never be reached
  throw new Error("Unexpected fetch error");
}

// // --------------------
// // Example Usage
// // --------------------
// interface User {
//   id: number;
//   name: string;
//   email: string;
// }

// (async () => {
//   try {
//     const user = await fetchWithRetry<User>(
//       "https://jsonplaceholder.typicode.com/users/1",
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json"
//         }
//       },
//       3, // retries
//       3000 // timeout
//     );

//     console.log("User fetched:", user.name, "-", user.email);
//   } catch (err) {
//     console.error("Final fetch error:", err);
//   }
// })();
