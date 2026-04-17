export const cookieUtils = {
  /**
   * Sets a cookie with security defaults.
   * SameSite=Lax is standard for modern browsers to prevent CSRF.
   */
  set: (name: string, value: string, days: number = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    // Secure: Only send over HTTPS
    // SameSite=Lax: Good balance between security and usability
    const attributes = [
      `${name}=${encodeURIComponent(value)}`,
      `expires=${date.toUTCString()}`,
      'path=/',
      'SameSite=Lax',
      window.location.protocol === 'https:' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ');

    document.cookie = attributes;
  },

  /**
   * Retrieves a cookie value by name.
   */
  get: (name: string): string | null => {
    const nameEQ = `${name}=`;
    // Using a more robust split/find approach
    const cookieArray = document.cookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
      const c = cookieArray[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  },

  /**
   * Removes a cookie by setting expiration to the past.
   */
  remove: (name: string) => {
    // Ensure the path and SameSite attributes match the 'set' call
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  },
};
