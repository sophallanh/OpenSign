import { cloudServerUrl, serverAppId } from '../../Utils.js';
import axios from 'axios';

const ALLOWED_STATUSES = ['pending', 'approved', 'paid'];

/**
 * Creates or updates a commission record in the loan_Commission class.
 *
 * Required params (create): referralPartner, referralEmail, loanAmount, commissionRate, commissionAmount
 * Optional params: objectId (for update), status, paidDate, notes, documentId
 */
export default async function saveCommission(request) {
  const sessionToken =
    request.headers['sessiontoken'] || request.headers['x-parse-session-token'];

  const {
    objectId,
    referralPartner,
    referralEmail,
    loanAmount,
    commissionRate,
    commissionAmount,
    status = 'pending',
    paidDate,
    notes,
    documentId,
  } = request.params;

  const serverUrl = cloudServerUrl;
  const appId = serverAppId;
  const masterKey = process.env.MASTER_KEY;

  if (!objectId) {
    // Validate required fields on create
    if (!referralPartner || typeof referralPartner !== 'string' || referralPartner.trim() === '') {
      throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'referralPartner is required.');
    }
    if (!referralEmail || typeof referralEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(referralEmail)) {
      throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'A valid referralEmail is required.');
    }
    if (loanAmount == null || isNaN(Number(loanAmount)) || Number(loanAmount) < 0) {
      throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'loanAmount must be a non-negative number.');
    }
    if (commissionRate == null || isNaN(Number(commissionRate)) || Number(commissionRate) < 0 || Number(commissionRate) > 100) {
      throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'commissionRate must be between 0 and 100.');
    }
    if (commissionAmount == null || isNaN(Number(commissionAmount)) || Number(commissionAmount) < 0) {
      throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'commissionAmount must be a non-negative number.');
    }
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, `status must be one of: ${ALLOWED_STATUSES.join(', ')}.`);
  }

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

    const headers = {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': appId,
      'X-Parse-Master-Key': masterKey,
    };

    const body = {};
    if (referralPartner !== undefined) body.referralPartner = referralPartner.trim();
    if (referralEmail !== undefined) body.referralEmail = referralEmail.trim().toLowerCase();
    if (loanAmount !== undefined) body.loanAmount = Number(loanAmount);
    if (commissionRate !== undefined) body.commissionRate = Number(commissionRate);
    if (commissionAmount !== undefined) body.commissionAmount = Number(commissionAmount);
    if (status !== undefined) body.status = status;
    if (notes !== undefined) body.notes = notes;
    if (paidDate) body.paidDate = { __type: 'Date', iso: new Date(paidDate).toISOString() };
    if (documentId) {
      body.documentId = {
        __type: 'Pointer',
        className: 'contracts_Document',
        objectId: documentId,
      };
    }

    let res;
    if (objectId) {
      // Verify the record belongs to this user before updating
      const checkUrl = `${serverUrl}/classes/loan_Commission/${objectId}`;
      const checkRes = await axios.get(checkUrl, { headers });
      const record = checkRes.data;
      if (!record || record.CreatedBy?.objectId !== userId) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Commission record not found or access denied.');
      }
      res = await axios.put(checkUrl, body, { headers });
    } else {
      body.CreatedBy = { __type: 'Pointer', className: '_User', objectId: userId };
      res = await axios.post(`${serverUrl}/classes/loan_Commission`, body, { headers });
    }

    return res.data;
  } catch (err) {
    if (err instanceof Parse.Error) throw err;
    console.error('saveCommission error:', err.message);
    if (err.code === 209) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token.');
    }
    throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, err.message || 'Something went wrong.');
  }
}
