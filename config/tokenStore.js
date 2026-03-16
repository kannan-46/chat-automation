// In-memory token store (resets on server restart)
// For production, use a database instead

let store = {
  pageAccessToken: null,
  pageId: null,
  igUserId: null,
  igUsername: null,
};

export const setTokens = ({ pageAccessToken, pageId, igUserId, igUsername }) => {
  store.pageAccessToken = pageAccessToken;
  store.pageId = pageId;
  store.igUserId = igUserId;
  store.igUsername = igUsername;
  console.log(`Tokens stored for @${igUsername}`);
};

export const getTokens = () => store;
