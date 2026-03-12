
/**
 * Unit tests for pipeline-related utilities.
 */

import { getSessionPermission } from '../src/components/pipeline/utils/pipeline.utils';
import { cookieUtils } from '../src/utils/cookies';

describe('Pipeline utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns permission object when cookie contains valid JSON', () => {
    const obj = { permission: 'write' };
    jest.spyOn(cookieUtils, 'get').mockReturnValue(JSON.stringify(obj));

    const result = getSessionPermission();
    expect(result).toEqual('write');
  });

  it('returns null if cookie is missing', () => {
    jest.spyOn(cookieUtils, 'get').mockReturnValue(null as any);
    expect(getSessionPermission()).toBeNull();
  });

  it('returns null and logs error when JSON is malformed', () => {
    jest.spyOn(cookieUtils, 'get').mockReturnValue('not json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(getSessionPermission()).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
