const AWS = require('aws-sdk');

// Configure DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET
});

exports.uploadToSpaces = async (file, folder = 'documents') => {
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ACL: 'private',
    ContentType: file.mimetype
  };

  try {
    const data = await s3.upload(params).promise();
    return {
      url: data.Location,
      key: data.Key
    };
  } catch (error) {
    console.error('Error uploading to Spaces:', error);
    throw new Error('File upload failed');
  }
};

exports.deleteFromSpaces = async (key) => {
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from Spaces:', error);
    throw new Error('File deletion failed');
  }
};

exports.getSignedUrl = (key, expiresIn = 3600) => {
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: key,
    Expires: expiresIn
  };

  return s3.getSignedUrl('getObject', params);
};
