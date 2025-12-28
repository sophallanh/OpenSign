const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { protect, authorize } = require('../middleware/auth');
const { uploadToSpaces, deleteFromSpaces, getSignedUrl } = require('../utils/spaces');
const { sendDocumentSignatureRequest } = require('../utils/email');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// @route   POST /api/documents
// @desc    Create a new document
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Upload to DigitalOcean Spaces
    const { url, key } = await uploadToSpaces(req.file);

    const document = await Document.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      fileUrl: url,
      fileKey: key,
      fileSize: req.file.size,
      owner: req.user._id,
      signers: req.body.signers ? JSON.parse(req.body.signers) : []
    });

    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Document creation error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   GET /api/documents
// @desc    Get all documents for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = {
      $or: [
        { owner: req.user._id },
        { 'signers.user': req.user._id },
        { 'signers.email': req.user.email }
      ]
    };

    const documents = await Document.find(query)
      .populate('owner', 'name email')
      .populate('signers.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('signers.user', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions
    const hasAccess = document.owner._id.toString() === req.user._id.toString() ||
                      document.signers.some(s => 
                        s.user?._id.toString() === req.user._id.toString() || 
                        s.email === req.user.email
                      );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }

    // Generate signed URL for file access
    const signedUrl = getSignedUrl(document.fileKey);

    res.json({
      success: true,
      document: {
        ...document.toObject(),
        fileSignedUrl: signedUrl
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/documents/:id/sign
// @desc    Sign a document
// @access  Private
router.post('/:id/sign', protect, [
  body('signatureData').notEmpty().withMessage('Signature data is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Find signer
    const signerIndex = document.signers.findIndex(s => 
      s.user?.toString() === req.user._id.toString() || 
      s.email === req.user.email
    );

    if (signerIndex === -1) {
      return res.status(403).json({ message: 'You are not authorized to sign this document' });
    }

    if (document.signers[signerIndex].status === 'signed') {
      return res.status(400).json({ message: 'Document already signed' });
    }

    // Update signer status
    document.signers[signerIndex].status = 'signed';
    document.signers[signerIndex].signedAt = Date.now();
    document.signers[signerIndex].signatureData = req.body.signatureData;

    // Check if all signers have signed
    const allSigned = document.signers.every(s => s.status === 'signed');
    if (allSigned) {
      document.status = 'completed';
      document.completedAt = Date.now();
    } else {
      document.status = 'partially_signed';
    }

    await document.save();

    res.json({
      success: true,
      message: 'Document signed successfully',
      document
    });
  } catch (error) {
    console.error('Sign document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/documents/:id/send
// @desc    Send signature request emails
// @access  Private
router.post('/:id/send', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('owner', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Send emails to all signers
    const emailPromises = document.signers
      .filter(s => s.status === 'pending')
      .map(signer => {
        const signUrl = `${process.env.CORS_ORIGIN}/sign/${document._id}`;
        return sendDocumentSignatureRequest(
          signer.email,
          document.title,
          signUrl,
          document.owner.name
        );
      });

    await Promise.all(emailPromises);

    document.status = 'pending';
    await document.save();

    res.json({
      success: true,
      message: 'Signature requests sent successfully'
    });
  } catch (error) {
    console.error('Send signature request error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Delete file from Spaces
    await deleteFromSpaces(document.fileKey);

    // Delete document from database
    await document.deleteOne();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
