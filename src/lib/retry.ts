export async function retry<T>(
  operation: () => Promise<T>,
  attempts = 3,
  delayMs = 500,
): Promise<T> {
  if (!Number.isInteger(attempts) || attempts < 1)
    throw new Error("Jumlah percobaan harus positif");
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}
