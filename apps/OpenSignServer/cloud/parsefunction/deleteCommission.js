import { cloudServerUrl, serverAppId } from '../../Utils.js';
import axios from 'axios';

/**
 * Deletes a commission record owned by the authenticated user.
 * Params: objectId (required)
 */
export default async function deleteCommission(request) {
  const sessionToken =
    request.headers['sessiontoken'] || request.headers['x-parse-session-token'];
  const { objectId } = request.params;

  if (!objectId) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'objectId is required.');
  }

  const serverUrl = cloudServerUrl;
  const appId = serverAppId;
  const masterKey = process.env.MASTER_KEY;

  try {
    const userRes = await axios.get(`${serverUrl}/users/me`, {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': sessionToken,
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (!userId) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': appId,
      'X-Parse-Master-Key': masterKey,
    };

    // Verify ownership before deleting
    const checkRes = await axios.get(`${serverUrl}/classes/loan_Commission/${objectId}`, { headers });
    const record = checkRes.data;
    if (!record || record.CreatedBy?.objectId !== userId) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Commission record not found or access denied.');
    }

    await axios.delete(`${serverUrl}/classes/loan_Commission/${objectId}`, { headers });
    return { success: true };
  } catch (err) {
    if (err instanceof Parse.Error) throw err;
    console.error('deleteCommission error:', err.message);
    throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, err.message || 'Something went wrong.');
  }
}
