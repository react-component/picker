export default function useShowTime<Config extends object>(showTime?: boolean | Config): Config {
  if (showTime === true) {
    return {} as Config;
  }

  return showTime || null;
}
