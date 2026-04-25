import { cloudServerUrl, serverAppId } from '../../Utils.js';
import axios from 'axios';

/**
 * Retrieves commission records for the authenticated user.
 * Supports filtering by status and pagination.
 *
 * Class: loan_Commission
 * Fields: documentId, referralPartner, referralEmail, loanAmount,
 *         commissionRate, commissionAmount, status, paidDate, notes, CreatedBy
 */
export default async function getCommissions(request) {
  const sessionToken =
    request.headers['sessiontoken'] || request.headers['x-parse-session-token'];
  const { skip = 0, limit = 20, status } = request.params;

  const serverUrl = cloudServerUrl;
  const appId = serverAppId;
  const masterKey = process.env.MASTER_KEY;

  try {
    // Resolve authenticated user
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

    const whereClause = {
      CreatedBy: {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      },
    };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const url =
      `${serverUrl}/classes/loan_Commission` +
      `?where=${JSON.stringify(whereClause)}` +
      `&order=-createdAt` +
      `&skip=${skip}` +
      `&limit=${limit}` +
      `&count=1`;

    const res = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': appId,
        'X-Parse-Master-Key': masterKey,
      },
    });

    return {
      results: res.data.results || [],
      count: res.data.count || 0,
    };
  } catch (err) {
    console.error('getCommissions error:', err.message);
    if (err.code === 209) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token.');
    }
    throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, err.message || 'Something went wrong.');
  }
}
