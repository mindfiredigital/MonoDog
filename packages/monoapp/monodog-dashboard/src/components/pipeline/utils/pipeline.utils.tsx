import { cookieUtils } from '../../../utils/cookies';

export const getSessionPermission = () => {
  try {
    const data = cookieUtils.get('monodog_session_data');
    return data ? JSON.parse(data).permission : null;
  } catch (e) {
    console.error("Failed to parse session data", e);
    return null;
  }
};
