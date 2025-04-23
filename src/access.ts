/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.Profile } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: true,
  };
}

//用不上，考虑优化掉
