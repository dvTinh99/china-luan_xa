export function usePinyinDisplay() {
  const enabled = useState<boolean>('pinyin-display', () => true);
  return { pinyinDisplay: enabled };
}
