export const useGuestUser = () => {
  return useState<Object | null>('guestUser', () => null)
}
